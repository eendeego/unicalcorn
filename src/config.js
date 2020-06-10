/**********************************
 * Read / Update configurations
 */

import fs from 'fs/promises';

const _defaultConfiguration = {
  data: {
    calendar: {
      url: 'https://calendar.google.com/calendar/ical/',
    },
  },
  devices: {
    'powermate-ble': '<mac-address>',
  },
  ui: {
    hours: 'left',
  },
};

export async function readAndUpdateConfiguration(filename) {
  const rawConfig = await fs.readFile(filename);
  const config = JSON.parse(rawConfig);

  let fileNeedsUpdate = false;

  if (config.version == null) {
    fileNeedsUpdate = true;
    config.version = 0;
  }

  if (fileNeedsUpdate) {
    try {
      await fs.writeFile(filename, JSON.stringify(config, null, '  '));
    } catch (e) {
      console.log('Could not update configuration file', e);
    }
  }

  return config;
}
