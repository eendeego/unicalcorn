import PowerMate from 'powermate';
import {ONE_DAY, QUARTER_HOUR, THREE_DAYS} from './layout.js';

import logger from './logger.js';
import {useEffect} from './ui.js';

export default function usePowermate({config, setTimeOffset}) {
  useEffect(() => {
    let handle;
    let powermate;

    function pollForPowerMate() {
      logger.trace('pollForPowerMate');
      try {
        powermate = new PowerMate();

        powermate.on('left', () =>
          setTimeOffset(timeOffset =>
            Math.max(timeOffset - QUARTER_HOUR, -ONE_DAY),
          ),
        );
        powermate.on('right', () => {
          setTimeOffset(timeOffset =>
            Math.min(timeOffset + QUARTER_HOUR, THREE_DAYS - 16 * QUARTER_HOUR),
          );
        });
        powermate.on('press', () =>
          setTimeOffset(config.ui.defaultOffset * QUARTER_HOUR),
        );

        powermate.on('error', _error => {
          powermate
            .eventNames()
            .forEach(event => powermate.removeAllListeners(event));
          powermate = null;
          handle = setTimeout(pollForPowerMate, 1000);
        });
      } catch (_e) {
        handle = setTimeout(pollForPowerMate, 1000);
      }
    }

    pollForPowerMate();

    return () => clearTimeout(handle);
  }, [config]);
}
