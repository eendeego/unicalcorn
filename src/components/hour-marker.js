import PixelRow from './pixel-row.js';

const hexNumbers = [
  ' ##   #  ##  ##    ####  ## #### ##  ##  ## ###  ## ### ########',
  '#  # ## #  ##  #  ###   #      ##  ##  ##  ##  ##  ##  ##   #   ',
  '#  #  #   #   #  # #### ###   #  ##  ########## #   #  #### ### ',
  '#  #  #  #  #  #####   ##  # #  #  #   ##  ##  ##  ##  ##   #   ',
  ' ##   # #### ##    ####  ##  #   ##  ## #  ####  ## ### #####   ',
];

export default function HourMarker({
  config,
  rowTime, // Not used yet
  rowIndex, // 0-15
}) {
  const x = config.ui.hours === 'left' ? 0 : 12;
  let y = rowIndex;
  const color = [63, 63, 63];

  const pixelColors = new Array(4).fill(color);

  let result = [];

  if (y >= 0 && y <= 15) {
    result = result.concat(PixelRow({x, y, pixelColors}));
  }

  const digit = new Date(rowTime).getHours() % 12;
  for (let j = 0; j < 5; j++) {
    y = rowIndex + j + 2;

    if (y < 0 || y > 15) {
      continue;
    }

    for (let i = 0; i < 4; i++) {
      if (hexNumbers[j][4 * digit + i] !== ' ') {
        result.push({x: x + i, y, color});
      }
    }
  }

  return result;
}
