/**********************************
 * Paint implementation running on Unicorn hat HD
 */

import UnicornHatHD from 'unicornhat-hd';

const unicornHatHD = new UnicornHatHD('/dev/spidev0.0');
unicornHatHD.setBrightness(0.5);

// TODO Dedupe from event-row
function intCap(component) {
  let intComponent = Math.round(component);
  return intComponent < 0 ? 0 : intComponent > 255 ? 255 : intComponent;
}

function intCappedRGB(rgb) {
  return [intCap(rgb[0]), intCap(rgb[1]), intCap(rgb[2])];
}

function setPixel000(x, y, r, g, b) {
  unicornHatHD.setPixel(x, y, r, g, b);
}
function setPixel090(x, y, r, g, b) {
  unicornHatHD.setPixel(15 - y, x, r, g, b);
}
function setPixel180(x, y, r, g, b) {
  unicornHatHD.setPixel(15 - x, 15 - y, r, g, b);
}
function setPixel270(x, y, r, g, b) {
  unicornHatHD.setPixel(y, 15 - x, r, g, b);
}
let setPixel = setPixel180;

export function setOrientation(angle) {
  setPixel =
    angle === 0
      ? setPixel000
      : angle === 90
      ? setPixel090
      : angle === 180
      ? setPixel180
      : setPixel270;
}

export function paint(sceneGraph) {
  unicornHatHD.setAll(0, 0, 0);

  for (const {x, y, color} of sceneGraph) {
    if (color.length === 3 || color[3] === 255) {
      setPixel(x, y, color[0], color[1], color[2]);
    } else {
      let rgb = unicornHatHD.getPixel(15 - x, 15 - y);
      rgb = intCappedRGB([
        rgb[0] + (color[0] * color[3]) / 255,
        rgb[1] + (color[1] * color[3]) / 255,
        rgb[2] + (color[2] * color[3]) / 255,
      ]);
      setPixel(x, y, rgb[0], rgb[1], rgb[2]);
    }
  }

  unicornHatHD.show();
}

export function clear() {
  unicornHatHD.clear();
  unicornHatHD.show();
}
