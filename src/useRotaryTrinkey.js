import HID from 'node-hid';
import usbDetect from 'usb-detection';

import {ONE_DAY, QUARTER_HOUR, THREE_DAYS} from './layout.js';
import logger from './logger.js';
import {useEffect} from './ui.js';

const ADAFRUIT_VENDOR_ID = 0x239a;
const ROTARY_TRINKEY_PRODUCT_ID = 0x80fb;

const VOLUME_DOWN = 234;
const VOLUME_UP = 233;
const VOLUME_MUTE = 226;

export default function useRotaryTrinkey({config, setTimeOffset}) {
  useEffect(() => {
    let trinkey;

    function initializeTrinkey(device) {
      logger.trace('Initializing Trinkey');
      try {
        let trinkeyDevice = device;

        if (trinkeyDevice == null) {
          trinkeyDevice = HID.devices().find(
            dev =>
              dev.vendorId === ADAFRUIT_VENDOR_ID &&
              dev.productId === ROTARY_TRINKEY_PRODUCT_ID,
          );
        }

        if (trinkeyDevice == null) {
          return;
        }

        logger.trace({device: trinkeyDevice}, 'Initializing Trinkey');

        trinkey = new HID.HID(trinkeyDevice.path);

        trinkey.on('data', function (data) {
          if (data[1] === VOLUME_DOWN) {
            setTimeOffset(timeOffset =>
              Math.max(timeOffset - QUARTER_HOUR, -ONE_DAY),
            );
          } else if (data[1] === VOLUME_UP) {
            setTimeOffset(timeOffset =>
              Math.min(
                timeOffset + QUARTER_HOUR,
                THREE_DAYS - 16 * QUARTER_HOUR,
              ),
            );
          } else if (data[1] === VOLUME_MUTE) {
            setTimeOffset(config.ui.defaultOffset * QUARTER_HOUR);
          }
        });

        trinkey.on('error', _error => shutdownTrinkey());
      } catch (e) {
        logger.error(e);
      }
    }

    function shutdownTrinkey(_device) {
      logger.trace('Shutting down Trinkey');
      if (trinkey != null) {
        trinkey
          .eventNames()
          .forEach(event => trinkey.removeAllListeners(event));
      }
      trinkey = null;
    }

    usbDetect.on(
      `add:${ADAFRUIT_VENDOR_ID}:${ROTARY_TRINKEY_PRODUCT_ID}`,
      device => {
        logger.trace('Trinkey added');
        initializeTrinkey(device);
      },
    );

    usbDetect.on(
      `remove:${ADAFRUIT_VENDOR_ID}:${ROTARY_TRINKEY_PRODUCT_ID}`,
      device => {
        logger.trace('Trinkey removed');
        shutdownTrinkey(device);
      },
    );

    // Initialize if present on boot
    initializeTrinkey();

    return () => shutdownTrinkey();
  }, [config]);
}
