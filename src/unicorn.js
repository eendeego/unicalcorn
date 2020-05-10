/**********************************
 * Paint implementation running on Unicorn hat HD
 */

import UnicornHatHD from 'unicornhat-hd';

const unicornHatHD = new UnicornHatHD('/dev/spidev0.0');
unicornHatHD.setBrightness(0.5);

export function paint(sceneGraph) {
  unicornHatHD.setAll(0, 0, 0);

  for (const {x, y, color} of sceneGraph) {
    unicornHatHD.setPixel(15 - x, 15 - y, color[0], color[1], color[2]);
  }

  unicornHatHD.show();
}
