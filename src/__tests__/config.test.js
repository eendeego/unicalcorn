import {defaultConfiguration, parseAndUpdateConfiguration} from '../config';
// import fs from 'fs/promises';
// import jest from 'jest';

describe('parseAndUpdateConfiguration', () => {
  it("doesn't update current configs", async () => {
    const [updatedConfig, fileNeedsUpdate] = await parseAndUpdateConfiguration(
      defaultConfiguration,
    );
    expect(updatedConfig).toEqual(defaultConfiguration);
    expect(fileNeedsUpdate).toBe(false);
  });

  it('ensures valid event color scheme', async () => {
    const originalConfig = {
      version: 2,
      data: {calendar: {}},
      devices: {'powermate-ble': '00:11:22:33:44:55'},
      ui: {
        hours: 'left',
        events: {
          scheme: 'something-wrong',
          'time-based-color-scheme': {},
          'sequence-color-scheme': [],
        },
      },
    };

    const [updatedConfig, fileNeedsUpdate] = await parseAndUpdateConfiguration(
      originalConfig,
    );

    const newColorScheme = updatedConfig.ui.events.scheme;
    const updatedConfigWithoutEventsColorScheme = {...updatedConfig};
    delete updatedConfigWithoutEventsColorScheme.ui.events.scheme;

    expect(newColorScheme).toEqual(
      expect.stringMatching(/(time-based|sequence)/),
    );
    expect(fileNeedsUpdate).toBe(true);
  });

  it('updates v2 configs', async () => {
    const [updatedConfig, fileNeedsUpdate] = await parseAndUpdateConfiguration({
      version: 2,
      data: {calendar: {}},
      devices: {'powermate-ble': '00:11:22:33:44:55'},
      ui: {
        hours: 'left',
        events: {
          scheme: 'time-based',
          'time-based-color-scheme': {},
          'sequence-color-scheme': [],
        },
      },
    });

    expect(updatedConfig.version).toEqual(3);
    expect(updatedConfig.ui.clock).toEqual(defaultConfiguration.ui.clock);
    expect(updatedConfig.ui.defaultOffset).toEqual(
      defaultConfiguration.ui.defaultOffset,
    );
    expect(fileNeedsUpdate).toBe(true);
  });

  it('updates v1 configs', async () => {
    const [updatedConfig, fileNeedsUpdate] = await parseAndUpdateConfiguration({
      version: 1,
      data: {calendar: {}},
      devices: {'powermate-ble': '00:11:22:33:44:55'},
      ui: {
        hours: 'left',
        events: {
          scheme: 'time-based',
          'time-based-color-scheme': {},
        },
      },
    });

    expect(updatedConfig.version).toEqual(3);
    expect(updatedConfig.ui.clock).toEqual(defaultConfiguration.ui.clock);
    expect(updatedConfig.ui.events['sequence-color-scheme']).toEqual(
      defaultConfiguration.ui.events['sequence-color-scheme'],
    );
    expect(fileNeedsUpdate).toBe(true);
  });

  it('updates v0 configs', async () => {
    const [updatedConfig, fileNeedsUpdate] = await parseAndUpdateConfiguration({
      version: 0,
      data: {calendar: {}},
      devices: {'powermate-ble': '00:11:22:33:44:55'},
      ui: {hours: 'left'},
    });

    expect(updatedConfig.version).toEqual(3);
    expect(updatedConfig.ui.clock).toEqual(defaultConfiguration.ui.clock);
    expect(updatedConfig.ui.events).toEqual(defaultConfiguration.ui.events);
    expect(fileNeedsUpdate).toBe(true);
  });
});
