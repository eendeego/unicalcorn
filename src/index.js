import PowerMate from 'powermate';
import PowerMateBleDevice from 'powermateble';

import {fetchEvents, dumpEvent, dumpEvents} from './calendar-data.js';
import {
  QUARTER_HOUR,
  computeLayout,
  roundDown,
  roundToQuarter,
  roundUp,
} from './layout.js';
import EventRow from './components/event-row.js';
import HourMarker from './components/hour-marker.js';
import {uiEventLoop, useEffect, useState} from './ui.js';
// import {paint as consolePaint} from './console.js';
import {paint as unicornPaint} from './unicorn.js';
import {readAndUpdateConfiguration} from './config.js';

const TWO_HOURS = 2 * 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const THREE_DAYS = 3 * ONE_DAY;

const CALENDER_UPDATE_INTERVAL = 30000;

const noise = Array.from(new Array(16), () =>
  Array.from(new Array(16), () => (128 + 127 * Math.random()) / 255),
);

// eslint-disable-next-line
function renderCalendar(config) {
  const [startTime, setStartTime] = useState(() => roundDown(Date.now()));
  const [timeOffset, setTimeOffset] = useState(0);

  const [layout, setLayout] = useState(null);

  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let handle;

    function updateData() {
      const now = new Date(startTime).getTime();
      fetchEvents(config.data.calendar.url, now - ONE_DAY, now + THREE_DAYS)
        .then(events => setLayout(computeLayout(events)))
        .catch(error => console.log({error}));
      handle = setTimeout(updateData, CALENDER_UPDATE_INTERVAL);
    }
    updateData();

    return () => clearTimeout(handle);
  }, [config]);

  useEffect(() => {
    let handle;

    function updateTime() {
      const now = Date.now();
      setStartTime(roundToQuarter(now));
      const wait = roundToQuarter(now + QUARTER_HOUR) - now;
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
        powermate.on('press', () => setTimeOffset(0));

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
  }, []);

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
    powermate.on('press', () => setTimeOffset(0));

    return () => powermate.destroy();
  }, []);

  useEffect(() => {
    let handle;

    function refresh() {
      setRefresh(refresh => refresh + 1);
      handle = setTimeout(refresh, 17);
    }
    refresh();

    return () => clearTimeout(handle);
  }, []);

  if (layout === null) return [];

  const result = [];

  let currentTimeSlot = (startTime - layout.start) / QUARTER_HOUR;
  let firstTimelineIndex =
    (startTime + timeOffset - layout.start) / QUARTER_HOUR;
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

  {
    let rowIndex = 0;
    let rowTime =
      layout.timeline.length > 0
        ? layout.start + (firstTimelineIndex + rowIndex) * QUARTER_HOUR
        : startTime + timeOffset + rowIndex * QUARTER_HOUR;
    const delta = rowTime % TWO_HOURS;
    rowIndex -= delta / QUARTER_HOUR;
    rowTime -= delta;

    while (rowIndex < 16) {
      result.push(HourMarker({config, rowTime, rowIndex}));
      rowIndex += 8;
      rowTime += TWO_HOURS;
    }
  }

  return result.flat();
}

readAndUpdateConfiguration(process.argv[2]).then(config =>
  uiEventLoop(unicornPaint, renderCalendar, config),
);
