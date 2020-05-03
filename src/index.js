const {fetchEvents, dumpEvent, dumpEvents} = require('./calendar-data');
const {QUARTER_HOUR, computeLayout, roundDown, roundUp} = require('./layout');
const {uiEventLoop, useEffect, useState} = require('./ui');
const {paint} = require('./console');

// eslint-disable-next-line
function renderCalendar({url}) {
  const [startTime, setStartTime] = useState(() => roundDown(Date.now()));
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    let handle;

    function updateData() {
      const now = new Date();
      fetchEvents(now).then(events => {
        // dumpEvents(events);
        const layout = computeLayout(events);
        setLayout(layout);
      });
      // handle = setTimeout(updateData, 3000);
    }
    updateData();

    return () => clearTimeout(handle);
  }, []);

  if (layout === null) return [];

  const result = [];

  // let rowIndex = (layout.start - startTime) / QUARTER_HOUR;
  let firstTimelineIndex = (startTime - layout.start) / QUARTER_HOUR;
  for (let rowIndex = 0; rowIndex < 16; rowIndex++) {
    if (firstTimelineIndex + rowIndex < 0) {
      continue;
    }

    const row = layout.timeline[firstTimelineIndex + rowIndex];

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
          color: rowIndex === 0 ? 'red' : rowIndex < 2 ? 'orange' : 'cyan',
        });
      }
    });

    rowIndex++;
  }

  return result;
}

uiEventLoop(paint, renderCalendar, {url: process.argv[2]});
