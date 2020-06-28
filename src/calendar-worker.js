import {parentPort} from 'worker_threads';
import {fetchEvents} from './calendar-data.js';
import {computeLayout} from './layout.js';

function fetch(url, start, end) {
  fetchEvents(url, start, end)
    .then(events => {
      const layout = computeLayout(events);
      parentPort.postMessage({
        type: 'update-layout',
        layout,
      });
    })
    .catch(error => console.log({error}));
}

parentPort.on('message', message => {
  if (message.type === 'update') {
    fetch(message.url, message.start, message.end);
  }
});
