// Interface to Griffin PowerMate

// Received data from the PowerMate contains the state of the button
// in the first byte and the turning direction, if any, in the second
// byte.  The second byte is encoded as a signed integer.  Data sent
// to the PowerMate contains zero in the first byte and the brightness
// of the LED in the second byte.

// This is just an ES(M) rewrite of:
// Original code: https://github.com/node-hid/node-hid

import HID from 'node-hid';
import EventEmitter from 'events';
import logger from '../logger.js';

export const GRIFFIN_VENDOR_ID = 0x077d;
export const POWERMATE_PRODUCT_ID = 0x0410;

export default class PowerMate extends EventEmitter {
  constructor(index) {
    super();
    if (index == null) {
      index = 0;
    }

    const powerMates = PowerMate.getAllDevices();
    if (powerMates.length === 0) {
      throw new Error('No PowerMates could be found');
    }

    if (index > powerMates.length || index < 0) {
      throw new Error(
        `Index ${index} out of range, only ${powerMates.length} PowerMates found`,
      );
    }

    this.hid = new HID.HID(powerMates[index].path);
    this.position = 0;
    this.button = 0;
    this.hid.read(this.interpretData.bind(this));
  }

  static getAllDevices() {
    return HID.devices(GRIFFIN_VENDOR_ID, POWERMATE_PRODUCT_ID);
  }

  static deviceCount() {
    return PowerMate.getAllDevices().length;
  }

  setLed(brightness) {
    this.hid.write([0, brightness]);
  }

  interpretData(error, data) {
    if (error) {
      this.emit('error', error);
      return;
    }

    let handled = false;
    const button = data[0];
    if ((button ^ this.button) !== 0) {
      this.emit(button ? 'buttonDown' : 'buttonUp');
      this.button = button;
      handled = true;
    }

    let delta = data[1];
    if (delta !== 0) {
      if (delta & 0x80) {
        delta = -256 + delta;
      }
      this.position += delta;
      this.emit('turn', delta, this.position);
      handled = true;
    }

    if (!handled) {
      logger.trace({data}, 'Unhandled event');
    }

    this.hid.read(this.interpretData.bind(this));
  }
}
