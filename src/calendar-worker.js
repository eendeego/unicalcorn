import {parentPort} from 'worker_threads';
import {fetchEvents} from './calendar-data.js';
import {computeLayout} from './layout.js';
import logger from './logger.js';

async function fetch(url, start, end) {
  const fetchStart = Date.now();

  let events;
  try {
    events = await fetchEvents(url, start, end);
  } catch (error) {
    logger.error(error, 'Error fetching events');
  }

  try {
    const layout = computeLayout(events);
    parentPort.postMessage({
      type: 'update-layout',
      layout,
      duration: Date.now() - fetchStart,
    });
  } catch (error) {
    logger.error(error, 'Error computing layout');
  }
}

parentPort.on('message', async message => {
  if (message.type === 'update') {
    await fetch(message.url, message.start, message.end);
  }
});
