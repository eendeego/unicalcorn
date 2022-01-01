import HID from 'node-hid';
import usbDetect from 'usb-detection';

import {Worker} from 'worker_threads';
import {QUARTER_HOUR, roundDown} from './layout.js';
import EventRow from './components/event-row.js';
import Clock from './components/clock.js';
import {uiEventLoop, useEffect, useState} from './ui.js';
// import {paint as consolePaint} from './console.js';
import {paint as unicornPaint, clear, setOrientation} from './unicorn.js';
import {readAndUpdateConfiguration} from './config.js';
import logger from './logger.js';
import useCalendarUpdater from './useCalendarUpdater.js';
import useClock from './useClock.js';
import usePowermate from './usePowermate.js';
import useRotaryTrinkey from './useRotaryTrinkey.js';
import usePowermateBLE from './usePowermateBLE.js';

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

  const [_refresh, setRefresh] = useState(0);

  useCalendarUpdater({config, worker, setLayout});

  useClock({setStartTime});

  usePowermate({config, setTimeOffset});
  useRotaryTrinkey({config, setTimeOffset});
  usePowermateBLE({config, setTimeOffset});

  useEffect(() => void setOrientation(config.ui.screenOrientation), [config]);

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

// logger.level = 10 /* trace */; // Enable for debugging only
logger.info('Starting Unicalcorn!');

usbDetect.startMonitoring();
HID.setDriverType('libusb');

const worker = new Worker('./src/calendar-worker.js', {});
worker.on('error', error => logger.error(error, `Worker error`));
worker.on('exit', code =>
  logger.error(`Worker stopped with exit code ${code}`),
);

readAndUpdateConfiguration(process.argv[2]).then(config =>
  uiEventLoop(unicornPaint, renderCalendar, {config, worker}),
);

/**
 * Leaving signal handlers on hold for the time being
 */

function _signalHandler(signal) {
  logger.info('Received ' + signal);

  // setImmediate(() => {
  logger.info('Stop Monitoring');
  // usbDetect.stopMonitoring();
  logger.info('Clear');
  clear();

  // logger.info('Signal handler: Exit');
  setTimeout(() => process.abort(), 3000);
  process.exit(0);
  // });
}

// process.on('SIGQUIT', signalHandler);
// process.on('SIGINT', signalHandler);
// process.on('SIGTERM', signalHandler);

function exitHandler() {
  logger.info('Exit Handler: Process Exit');
  clear();
}

process.on('exit', exitHandler);
