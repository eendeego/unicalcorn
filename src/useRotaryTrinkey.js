import HID from 'node-hid';
import usbDetect from 'usb-detection';

import {ONE_DAY, QUARTER_HOUR, THREE_DAYS} from './layout.js';
import logger from './logger.js';
import {useEffect} from './ui.js';

const ADAFRUIT_VENDOR_ID = 0x239a;
const ADAFRUIT_ROTARY_TRINKEY_PRODUCT_ID = 0x80fb;

export default function useRotaryTrinkey({config, setTimeOffset}) {
  useEffect(() => {
    let trinkey;

    function initializeTrinkey() {
      try {
        let trinkeyDevice = HID.devices().find(
          dev =>
            dev.vendorId === ADAFRUIT_VENDOR_ID &&
            dev.productId === ADAFRUIT_ROTARY_TRINKEY_PRODUCT_ID,
        );

        if (trinkeyDevice == null) {
          return;
        }

        trinkey = new HID.HID(trinkeyDevice.path);

        trinkey.on('data', function (data) {
          if (data[1] === 234) {
            setTimeOffset(timeOffset =>
              Math.max(timeOffset - QUARTER_HOUR, -ONE_DAY),
            );
          } else if (data[1] === 233) {
            setTimeOffset(timeOffset =>
              Math.min(
                timeOffset + QUARTER_HOUR,
                THREE_DAYS - 16 * QUARTER_HOUR,
              ),
            );
          } else if (data[1] === 226) {
            setTimeOffset(config.ui.defaultOffset * QUARTER_HOUR);
          }
        });

        trinkey.on('error', _error => shutdownTrinkey());
      } catch (e) {
        logger.error(e);
      }
    }

    function shutdownTrinkey() {
      if (trinkey != null) {
        trinkey
          .eventNames()
          .forEach(event => trinkey.removeAllListeners(event));
      }
      trinkey = null;
    }

    usbDetect.on(
      `add:${ADAFRUIT_VENDOR_ID}:${ADAFRUIT_ROTARY_TRINKEY_PRODUCT_ID}`,
      _device => initializeTrinkey(),
    );

    usbDetect.on(
      `remove:${ADAFRUIT_VENDOR_ID}:${ADAFRUIT_ROTARY_TRINKEY_PRODUCT_ID}`,
      _device => shutdownTrinkey(),
    );

    if (
      usbDetect.find(ADAFRUIT_VENDOR_ID, ADAFRUIT_ROTARY_TRINKEY_PRODUCT_ID)
    ) {
      initializeTrinkey();
    }

    return () => shutdownTrinkey();
  }, [config]);
}
