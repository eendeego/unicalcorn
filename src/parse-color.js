function colorSubComponent(rgb, offset) {
  return parseInt(rgb.substring(offset, offset + 2), 16);
}

/**
 * Parses colors with format:
 *   #rrggbb
 *   #rrggbbaa
 * Into
 *   [rr, gg, bb, aa]
 */
export default function parseColor(rgb) {
  const color = [0, 0, 0, 0];
  color[0] = colorSubComponent(rgb, 1);
  color[1] = colorSubComponent(rgb, 3);
  color[2] = colorSubComponent(rgb, 5);
  color[3] = rgb.length > 7 ? colorSubComponent(rgb, 7) : 0xff;
  return color;
}
