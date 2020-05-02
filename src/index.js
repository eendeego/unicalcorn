// import {fetchCurrentEvents, dumpEvents} from './calendar-data.js';
import uiEventLoop, {useEffect} from './ui.js';

// eslint-disable-next-line
function renderCalendar({url}) {
  useEffect(() => {
    let handle;

    function updateData() {
      // fetchCurrentEvents().then(events => dumpEvents(events));
      console.log('Update');
      handle = setTimeout(updateData, 3000);
    }
    updateData();

    return () => clearTimeout(handle);
  }, []);

  return [];
}

uiEventLoop(renderCalendar, {url: process.argv[2]});
