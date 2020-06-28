import PowerMate from 'powermate';
import PowerMateBleDevice from 'powermateble';

import {Worker} from 'worker_threads';
import {fetchEvents, dumpEvent, dumpEvents} from './calendar-data.js';
import {
  QUARTER_HOUR,
  computeLayout,
  roundDown,
  roundToQuarter,
  roundUp,
} from './layout.js';
import EventRow from './components/event-row.js';
import Clock from './components/clock.js';
import {uiEventLoop, useCallback, useEffect, useState} from './ui.js';
// import {paint as consolePaint} from './console.js';
import {paint as unicornPaint} from './unicorn.js';
import {readAndUpdateConfiguration} from './config.js';

const ONE_DAY = 24 * 60 * 60 * 1000;
const THREE_DAYS = 3 * ONE_DAY;

const CALENDAR_UPDATE_INTERVAL = 30000;

const noise = Array.from(new Array(16), () =>
  Array.from(new Array(16), () => (128 + 127 * Math.random()) / 255),
);

// eslint-disable-next-line
function renderCalendar({config, worker}) {
  const [startTime, setStartTime] = useState(() => roundDown(Date.now()));
  const [timeOffset, setTimeOffset] = useState(
    config.ui.defaultOffset * QUARTER_HOUR,
  );

  const [layout, setLayout] = useState(null);

  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let handle;

    function updateData() {
      const now = new Date(startTime).getTime();
      worker.postMessage({
        type: 'update',
        url: config.data.calendar.url,
        start: now - ONE_DAY,
        end: now + THREE_DAYS,
      });
      handle = setTimeout(updateData, CALENDAR_UPDATE_INTERVAL);
    }
    updateData();

    function workerListener(message) {
      if (message.type === 'update-layout') {
        setLayout(message.layout);
      }
    }

    worker.on('message', workerListener);

    return () => {
      clearTimeout(handle);
      worker.removeListener('message', workerListener);
    };
  }, [config]);

  useEffect(() => {
    let handle;

    function updateTime() {
      const now = Date.now();
      setStartTime(roundDown(now));
      const wait = roundUp(now) - now;
      handle = setTimeout(updateTime, wait);
    }
    updateTime();

    return () => clearTimeout(handle);
  }, []);

  useEffect(() => {
    let handle;
    let powermate;

    function pollForPowerMate() {
      try {
        powermate = new PowerMate();

        powermate.on('left', () =>
          setTimeOffset(timeOffset =>
            Math.max(timeOffset - QUARTER_HOUR, -ONE_DAY),
          ),
        );
        powermate.on('right', () => {
          setTimeOffset(timeOffset =>
            Math.min(timeOffset + QUARTER_HOUR, THREE_DAYS - 16 * QUARTER_HOUR),
          );
        });
        powermate.on('press', () =>
          setTimeOffset(config.ui.defaultOffset * QUARTER_HOUR),
        );

        powermate.on('error', error => {
          powermate
            .eventNames()
            .forEach(event => powermate.removeAllListeners(event));
          powermate = null;
          handle = setTimeout(pollForPowerMate, 1000);
        });
      } catch (_e) {
        handle = setTimeout(pollForPowerMate, 1000);
      }
    }

    pollForPowerMate();

    return () => clearTimeout(handle);
  }, [config]);

  useEffect(() => {
    let handle;
    let powermate;

    if (config?.devices?.['powermate-ble'] == null) {
      console.log('no powermate ble config');
      return;
    }

    powermate = new PowerMateBleDevice(config.devices['powermate-ble']);

    // powermate.on('status', status => console.log('status', status));

    powermate.on('left', () =>
      setTimeOffset(timeOffset =>
        Math.max(timeOffset - QUARTER_HOUR, -ONE_DAY),
      ),
    );
    powermate.on('right', () => {
      setTimeOffset(timeOffset =>
        Math.min(timeOffset + QUARTER_HOUR, THREE_DAYS - 16 * QUARTER_HOUR),
      );
    });
    powermate.on('press', () =>
      setTimeOffset(config.ui.defaultOffset * QUARTER_HOUR),
    );

    return () => powermate.destroy();
  }, [config]);

  useEffect(() => {
    let handle;

    function refresh() {
      setRefresh(refresh => refresh + 1);
      handle = setTimeout(refresh, 17);
    }
    refresh();

    return () => clearTimeout(handle);
  }, []);

  const result = [];

  let layoutStart = layout?.start ?? 0;
  layoutStart = Number.isFinite(layoutStart) ? layoutStart : 0;

  // Offset in QUARTER_HOUR slots from the first event on the calendar and the
  // current time
  let currentTimeSlot = (startTime - layoutStart) / QUARTER_HOUR;
  // Offset in QUARTER_HOUR slots from the first event on the calendar and the
  // current time + time offset
  let firstTimelineIndex =
    (startTime + timeOffset - layoutStart) / QUARTER_HOUR;

  if (layout != null) {
    for (let rowIndex = 0; rowIndex < 16; rowIndex++) {
      const row = layout.timeline[firstTimelineIndex + rowIndex];

      (row?.columns || []).forEach((layoutEvent, columnIndex) => {
        result.push(
          EventRow({
            config,
            currentTimeSlot,
            timeSlot: firstTimelineIndex + rowIndex,
            rowIndex,
            columnIndex,
            layoutEvent,
            noise: noise[(firstTimelineIndex + rowIndex) % 16],
          }),
        );
      });
    }
  }

  result.push(
    Clock({config, currentTimeSlot, firstTimelineIndex, startTime, timeOffset}),
  );

  return result.flat();
}

const worker = new Worker('./src/calendar-worker.js', {});
worker.on('error', error => console.log(error));
worker.on('exit', code => {
  console.log(`Worker stopped with exit code ${code}`);
});

readAndUpdateConfiguration(process.argv[2]).then(config =>
  uiEventLoop(unicornPaint, renderCalendar, {config, worker}),
);
