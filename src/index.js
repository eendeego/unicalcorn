import {fetchCurrentEvents, dumpEvents} from './calendar-data.js';
import uiEventLoop from './ui.js';

// eslint-disable-next-line
function renderCalendar({url}) {
  return [];
}

uiEventLoop(renderCalendar, {url: process.argv[2]});

fetchCurrentEvents().then(events => dumpEvents(events));
