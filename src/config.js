/**********************************
 * Read / Update configurations
 */

import fs from 'fs/promises';

const defaultConfiguration = {
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
    events: {
      scheme: 'time-based',
      'time-based-color-scheme': {
        egde: '#ffffff',
        past: '#3f3f3f',
        present: '#ff0000',
        impending: '#ff3f00',
        future: '#ffbf00',
      },
    },
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

  if (config.ui.hours !== 'left' && config.hours !== 'right') {
    config.ui.hours = 'left';
    fileNeedsUpdate = true;
  }

  if (config.version === 0) {
    config.ui.events = {...defaultConfiguration.ui.events};
    config.version = 1;
    fileNeedsUpdate = true;
  }

  if (config.ui.events.scheme !== 'time-based') {
    config.ui.events.scheme !== 'time-based';
    fileNeedsUpdate = true;
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
