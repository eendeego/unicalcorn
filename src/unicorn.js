/**********************************
 * Paint implementation running on Unicorn hat HD
 */

import UnicornHatHD from 'unicornhat-hd';

const unicornHatHD = new UnicornHatHD('/dev/spidev0.0');
unicornHatHD.setBrightness(0.5);

function rgb(color) {
  const base = Math.floor(128 + 127 * Math.random());
  switch (color) {
    case 'red':
      return [base, 0, 0];
    case 'orange':
      return [base, base >> 2, 0];
    case 'cyan':
      return [0, base, base];
    case 'yellow':
      return [base, base >> 1, 0];
    default:
      return [2, 2, 2];
  }
}

function paintEvent(event) {
  if (event.y >= 0 && event.y <= 15) {
    for (let i = 0; i < event.width; i++) {
      unicornHatHD.setPixel(15 - (event.x + i), 15 - event.y, 255, 255, 255);
    }
  }

  for (let j = 1; j < event.height; j++) {
    const y = event.y + j;
    if (y < 0 || y > 15) {
      continue;
    }

    if (event.x >= 0 && event.x <= 15) {
      unicornHatHD.setPixel(15 - event.x, 15 - y, 255, 255, 255);
    }

    for (let i = 1; i < event.width; i++) {
      const x = event.x + i;
      if (x < 0 || x > 15) {
        continue;
      }

      unicornHatHD.setPixel(15 - x, 15 - y, ...rgb(event.color));
    }
  }
}

export function paint(sceneGraph) {
  unicornHatHD.setAll(0, 0, 0);

  for (const item of sceneGraph) {
    if (item.type === 'event') {
      paintEvent(item);
    }
  }

  unicornHatHD.show();
}
