import PixelRow from './pixel-row.js';
import parseColor from '../parse-color.js';

let clockLineState = {
  lastSeenConfig: null,
  colorScheme: null,
};

function getClockLineState(config) {
  if (config === clockLineState.lastSeenConfig) {
    return clockLineState;
  }

  const colorScheme = {
    face: [0, 0, 0, 0],
    events: [0, 0, 0, 0],
  };

  for (const color of Object.keys(colorScheme)) {
    colorScheme[color] = parseColor(config.ui.clock.line.colors[color]);
  }

  clockLineState = {
    ...clockLineState,
    lastSeenConfig: config,
    colorScheme,
  };
  return clockLineState;
}

export default function ClockLine({config, row}) {
  const {colorScheme} = getClockLineState(config);

  const faceStart = config.ui.hours === 'left' ? 0 : 12;
  const eventsStart = config.ui.hours === 'left' ? 4 : 0;

  return PixelRow({
    x: 0,
    y: row,
    pixelColors: new Array(16)
      .fill(colorScheme.face, faceStart, faceStart + 4)
      .fill(colorScheme.events, eventsStart, eventsStart + 12),
  });
}
