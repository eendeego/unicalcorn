import HID from 'node-hid';
// import PowerMate from 'powermate';
// import PowerMate from 'node-hid/src/powermate.js';
import PowerMate, {GRIFFIN_VENDOR_ID, POWERMATE_PRODUCT_ID} from './index.js';
import usbDetect from 'usb-detection';

import {ONE_DAY, QUARTER_HOUR, THREE_DAYS} from '../layout.js';
import logger from '../logger.js';
import {useEffect} from '../ui.js';

export default function usePowermate({config, setTimeOffset}) {
  useEffect(() => {
    let handle;
    let powermate;

    function initializePowermate(device) {
      logger.trace({device}, 'Initializing Powermate');

      let powermateDevice = device;

      if (powermateDevice == null) {
        powermateDevice = HID.devices().find(
          dev =>
            dev.vendorId === GRIFFIN_VENDOR_ID &&
            dev.productId === POWERMATE_PRODUCT_ID,
        );
        logger.trace('Powermate present');
      }

      if (powermateDevice == null) {
        logger.trace('Powermate not present');
        return;
      }

      try {
        powermate = new PowerMate();

        powermate.on('turn', (delta, _position) =>
          setTimeOffset(timeOffset =>
            Math.min(
              Math.max(timeOffset + QUARTER_HOUR * delta, -ONE_DAY),
              THREE_DAYS - 16 * QUARTER_HOUR,
            ),
          ),
        );

        powermate.on('buttonDown', () =>
          setTimeOffset(config.ui.defaultOffset * QUARTER_HOUR),
        );

        powermate.on('error', err => {
          logger.error({err}, 'PowerMate Error Event');
        });
      } catch (err) {
        // Just log + ignore
        logger.error({err}, 'PowerMate Error');
        powermate = null;
      }
    }

    function shutdownPowermate() {
      try {
        powermate
          .eventNames()
          .forEach(event => powermate.removeAllListeners(event));
      } catch (err) {
        logger.error({err}, 'PowerMate error closing device');
      }
      powermate = null;
    }

    usbDetect.on(`add:${GRIFFIN_VENDOR_ID}:${POWERMATE_PRODUCT_ID}`, device => {
      logger.trace('PowerMate added');
      initializePowermate(device);
    });

    usbDetect.on(
      `remove:${GRIFFIN_VENDOR_ID}:${POWERMATE_PRODUCT_ID}`,
      device => {
        logger.trace('PowerMate removed');
        shutdownPowermate(device);
      },
    );

    initializePowermate();

    return () => clearTimeout(handle);
  }, [config]);
}
