import PixelRow from './pixel-row.js';
import parseColor from '../parse-color.js';

const hexDigits = {
  5: [
    ' ##    #   ##   ##     # ###   ##  ####  ##   ##   ##  ### ',
    '#  #  ##  #  # #  #   ## #    #       # #  # #  # #  # #  #',
    '#      #    #    #   # # ###  ###    #   ##   ### #### ### ',
    '#  #   #   #   #  # ####    # #  #  #   #  #    # #  # #  #',
    ' ##    #  ####  ##     # ###   ##   #    ##   ##  #  # ### ',
  ],
  7: [
    ' ##    #   ##   ##     # ####  ##  ####  ##   ##   ##  ### ',
    '#  #  ##  #  # #  #   ## #    #  # #  # #  # #  # #  # #  #',
    '#      #     #    #  # # #    #       # #  # #  # #  # #  #',
    '#      #    #    #  #  # ###  ###    #   ##   ### #### ### ',
    '#      #   #      # ####    # #  #  #   #  #    # #  # #  #',
    '#  #   #  #    #  #    # #  # #  #  #   #  # #  # #  # #  #',
    ' ##    #  ####  ##     #  ##   ##   #    ##   ##  #  # ### ',
  ],
};

const decimalDigits = {
  5: [
    '#      #   ##   ##     # ###   ##  ####  ##   ##  #    #   ',
    '# #   ##  #  # #  #   ## #    #       # #  # #  # # #  #   ',
    '#  #   #    #    #   # # ###  ###    #   ##   ### ## # # # ',
    '  #    #   #   #  # ####    # #  #  #   #  #    #  # #   # ',
    '  ##   #  ####  ##     # ###   ##   #    ##   ##    #    # ',
  ],
  7: [
    '#      #   ##   ##     # ####  ##  ####  ##   ##  #    #   ',
    '#     ##  #  # #  #   ## #    #  # #  # #  # #  # #    #   ',
    '#      #     #    #  # # #    #       # #  # #  # #    #   ',
    '# #    #    #    #  #  # ###  ###    #   ##   ### # #  #  #',
    '   #   #   #      # ####    # #  #  #   #  #    #  # #    #',
    '  #    #  #    #  #    # #  # #  #  #   #  # #  #  # #    #',
    '  ##   #  ####  ##     #  ##   ##   #    ##   ##    #     #',
  ],
};

let hourMarkerState = {
  lastSeenConfig: null,
  colorScheme: null,
};

function gethourMarkerState(config) {
  if (config === hourMarkerState.lastSeenConfig) {
    return hourMarkerState;
  }

  const colorScheme = {
    color: [0, 0, 0, 0],
  };

  colorScheme.color = parseColor(config.ui.clock.digits.color);

  hourMarkerState = {
    ...hourMarkerState,
    lastSeenConfig: config,
    colorScheme,
  };
  return hourMarkerState;
}

export default function HourMarker({
  config,
  rowTime,
  rowIndex, // 0-15
}) {
  const {colorScheme} = gethourMarkerState(config);

  const x = config.ui.hours === 'left' ? 0 : 12;
  let y = rowIndex;
  const color = colorScheme.color;

  let result = [];

  if (config.ui.clock.digits.separator) {
    const pixelColors = new Array(4).fill(color);
    if (y >= 0 && y <= 15) {
      result = result.concat(PixelRow({x, y, pixelColors}));
    }
  }

  const height = config.ui.clock.digits.size;

  const digits = (config.ui.clock.digits.format === 'hexa'
    ? hexDigits
    : decimalDigits)[height];

  const digit = new Date(rowTime).getHours() % 12;
  for (let j = 0; j < height; j++) {
    y = rowIndex + j + 2;

    if (y < 0 || y > 15) {
      continue;
    }

    for (let i = 0; i < 4; i++) {
      if (digits[j][5 * digit + i] !== ' ') {
        result.push({x: x + i, y, color});
      }
    }
  }

  return result;
}
