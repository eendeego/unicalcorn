/**********************************
 * Read / Update configurations
 */

import fs from 'fs/promises';

// defaultConfiguration and parseAndUpdateConfiguration are only exported for
// testing purposes

export const defaultConfiguration = {
  version: 4,
  data: {
    calendar: {
      url: 'https://calendar.google.com/calendar/ical/',
    },
  },
  devices: {
    'powermate-ble': '<mac-address>',
  },
  ui: {
    screenOrientation: 180,
    defaultOffset: 0,
    clock: {
      digits: {
        format: 'hexa',
        size: 5,
        hourDisplay: 'current',
        separator: true,
        centerVertically: false,
        color: '#3f3f3f',
      },
      line: {
        enabled: true,
        colors: {
          face: '#0000ff40',
          events: '#ffffff40',
        },
      },
    },
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
      'sequence-color-scheme': [
        '#ff0000',
        '#ffff00',
        '#00ff00',
        '#00ffff',
        '#0000ff',
        '#ff00ff',
        '#ff7f00',
        '#7fff00',
        '#00ff7f',
        '#007fff',
        '#7f00ff',
        '#ff007f',
      ],
    },
  },
};

export async function parseAndUpdateConfiguration(originalConfig) {
  const config = {...originalConfig};
  let fileNeedsUpdate = false;

  if (config.version === 0) {
    config.ui.events = {...defaultConfiguration.ui.events};
    config.version = 1;
    fileNeedsUpdate = true;
  }

  if (config.version === 1) {
    config.ui.events['sequence-color-scheme'] = [
      ...defaultConfiguration.ui.events['sequence-color-scheme'],
    ];
    config.version = 2;
    fileNeedsUpdate = true;
  }

  if (
    config.ui.events.scheme !== 'time-based' &&
    config.ui.events.scheme !== 'sequence'
  ) {
    config.ui.events.scheme = 'time-based';
    fileNeedsUpdate = true;
  }

  if (config.version === 2) {
    config.ui.clock = {...defaultConfiguration.ui.clock};
    config.ui.defaultOffset = defaultConfiguration.ui.defaultOffset;
    config.version = 3;
    fileNeedsUpdate = true;
  }

  if (config.version === 3) {
    config.ui.screenOrientation = defaultConfiguration.ui.screenOrientation;
    config.version = 4;
    fileNeedsUpdate = true;
  }

  return [config, fileNeedsUpdate];
}

export async function readAndUpdateConfiguration(filename) {
  const rawConfig = await fs.readFile(filename);
  const config = JSON.parse(rawConfig);

  const [updatedConfig, fileNeedsUpdate] = await parseAndUpdateConfiguration(
    config,
  );

  if (fileNeedsUpdate) {
    try {
      await fs.writeFile(filename, JSON.stringify(updatedConfig, null, '  '));
    } catch (e) {
      console.log('Could not update configuration file', e);
    }
  }

  return config;
}
