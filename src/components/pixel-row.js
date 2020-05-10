export default function PixelRow({x, y, pixelColors}) {
  return pixelColors.map((color, i) => ({x: x + i, y, color}));
}
