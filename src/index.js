import {fetchEvents, dumpEvent, dumpEvents} from './calendar-data.js';
import {
  QUARTER_HOUR,
  computeLayout,
  roundDown,
  roundToQuarter,
  roundUp,
} from './layout.js';
import {uiEventLoop, useEffect, useState} from './ui.js';
// import {paint} from './console.js';
import {paint} from './unicorn.js';

const ONE_DAY = 24 * 60 * 60 * 1000;
const THREE_DAYS = 3 * ONE_DAY;

const CALENDER_UPDATE_INTERVAL = 30000;

// eslint-disable-next-line
function renderCalendar({url}) {
  const [startTime, setStartTime] = useState(() => roundDown(Date.now()));
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    let handle;

    function updateData() {
      const now = new Date(startTime).getTime();
      fetchEvents(now - ONE_DAY, now + THREE_DAYS).then(events => {
        const layout = computeLayout(events);
        setLayout(layout);
      });
      handle = setTimeout(updateData, CALENDER_UPDATE_INTERVAL);
    }
    updateData();

    return () => clearTimeout(handle);
  }, []);

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

  if (layout === null) return [];

  const result = [];

  let firstTimelineIndex = (startTime - layout.start) / QUARTER_HOUR;
  for (let rowIndex = 0; rowIndex < 16; rowIndex++) {
    const row = layout.timeline[firstTimelineIndex + rowIndex];

    if (row === undefined) {
      continue;
    }

    row.columns.forEach((event, columnIndex) => {
      if (event.event.start.getTime() === row.time) {
        result.push({
          type: 'event',
          event: event.event,
          x: (columnIndex * 12) / event.rowGroup.width,
          y: rowIndex,
          width: 12 / event.rowGroup.width,
          height:
            (roundUp(event.event.end.getTime()) -
              roundDown(event.event.start.getTime())) /
            QUARTER_HOUR,
          color: rowIndex === 0 ? 'red' : rowIndex < 2 ? 'orange' : 'yellow',
        });
      } else if (
        event.event.start.getTime() < startTime &&
        row.time + QUARTER_HOUR === roundUp(event.event.end.getTime())
      ) {
        result.push({
          type: 'event',
          event: event.event,
          x: (columnIndex * 12) / event.rowGroup.width,
          y:
            rowIndex -
            (roundUp(event.event.end.getTime()) -
              roundDown(event.event.start.getTime())) /
              QUARTER_HOUR +
            1,
          width: 12 / event.rowGroup.width,
          height:
            (roundUp(event.event.end.getTime()) -
              roundDown(event.event.start.getTime())) /
            QUARTER_HOUR,
          color: 'red',
        });
      }
    });
  }

  return result;
}

uiEventLoop(paint, renderCalendar, {url: process.argv[2]});
