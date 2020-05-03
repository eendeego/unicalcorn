const {fetchCurrentEvents} = require('./calendar-data');
const {computeLayout, roundDown} = require('./layout');
const {uiEventLoop, useEffect, useState} = require('./ui');
const {paint} = require('./console');

// eslint-disable-next-line
function renderCalendar({url}) {
  const [startTime, setStartTime] = useState(() => roundDown(Date.now()));
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    let handle;

    function updateData() {
      fetchCurrentEvents().then(events => {
        setLayout(computeLayout(events));
      });
      console.log('Update');
      handle = setTimeout(updateData, 3000);
    }
    updateData();

    return () => clearTimeout(handle);
  }, []);

  if (layout === null) return [];

  // just for now
  return [startTime, layout.start, layout.end];
}

uiEventLoop(paint, renderCalendar, {url: process.argv[2]});
