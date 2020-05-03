const {fetchCurrentEvents, dumpEvents} = require('./calendar-data');
const {uiEventLoop, useEffect, useState} = require('./ui');

// eslint-disable-next-line
function renderCalendar({url}) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let handle;

    function updateData() {
      fetchCurrentEvents().then(events => {
        dumpEvents(events);
        setEvents(events);
      });
      console.log('Update');
      handle = setTimeout(updateData, 3000);
    }
    updateData();

    return () => clearTimeout(handle);
  }, []);

  // just for now
  return events;
}

uiEventLoop(renderCalendar, {url: process.argv[2]});
