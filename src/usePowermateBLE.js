import PowerMateBleDevice from 'powermateble';
import {ONE_DAY, QUARTER_HOUR, THREE_DAYS} from './layout.js';
import logger from './logger.js';

import {useEffect} from './ui.js';

export default function usePowermateBLE({config, setTimeOffset}) {
  useEffect(() => {
    let powermateMAC = config?.devices?.['powermate-ble'];
    if (powermateMAC == null) {
      logger.trace('no powermate ble config');
      return;
    }

    logger.trace('connecting to powermate-ble: ' + powermateMAC);
    const powermate = new PowerMateBleDevice(powermateMAC);

    powermate.on('status', status =>
      logger.trace('powermate-ble: status ' + status),
    );

    powermate.on('battery', status =>
      logger.trace('powermate-ble: battery ' + status),
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
