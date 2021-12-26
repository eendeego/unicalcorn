import PowerMateBleDevice from 'powermateble';
import {ONE_DAY, QUARTER_HOUR, THREE_DAYS} from './layout.js';
import logger from './logger.js';

import {useEffect} from './ui.js';

export default function usePowermateBLE({config, setTimeOffset}) {
  useEffect(() => {
    let powermate;

    if (config?.devices?.['powermate-ble'] == null) {
      logger.trace('no powermate ble config');
      return;
    }

    powermate = new PowerMateBleDevice(config.devices['powermate-ble']);

    powermate.on('status', status =>
      logger.trace('status ' + JSON.stringify(status)),
    );

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

    return () => powermate.destroy();
  }, [config]);
}
