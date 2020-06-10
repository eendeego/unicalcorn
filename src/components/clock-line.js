import PixelRow from './pixel-row.js';

export default function ClockLine({row}) {
  return PixelRow({
    x: 0,
    y: row,
    pixelColors: Array.from(new Array(16), (_, i) =>
      i < 4 ? [0, 0, 255, 0x40] : [255, 255, 255, 0x40],
    ),
  });
}
