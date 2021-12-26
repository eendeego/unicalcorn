import {ONE_DAY, roundDown, THREE_DAYS} from './layout.js';
import logger from './logger.js';
import {useEffect} from './ui.js';

const CALENDAR_UPDATE_INTERVAL = 30000;

export default function useCalendarUpdater({config, worker, setLayout}) {
  useEffect(() => {
    let handle;

    function updateData() {
      const now = roundDown(Date.now());
      logger.info('Fetch data for ' + new Date(now).toLocaleString());
      worker.postMessage({
        type: 'update',
        url: config.data.calendar.url,
        start: now - ONE_DAY,
        end: now + THREE_DAYS,
      });
      handle = setTimeout(updateData, CALENDAR_UPDATE_INTERVAL);
    }
    updateData();

    function workerListener(message) {
      if (message.type === 'update-layout') {
        logger.info(`Got data! (took ${message.duration.toLocaleString()}ms)`);
        setLayout(message.layout);
      }
    }

    worker.on('message', workerListener);

    return () => {
      clearTimeout(handle);
      worker.removeListener('message', workerListener);
    };
  }, [config]);
}
