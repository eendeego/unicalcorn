/**********************************
 * Paint implementation running on Unicorn hat HD
 */

const UnicornHatHD = require('unicornhat-hd');

const unicornHatHD = new UnicornHatHD('/dev/spidev0.0');
unicornHatHD.setBrightness(0.5);

function rgb(color) {
  switch (color) {
    case 'red': {
      const base = Math.floor(128 + 127 * Math.random());
      return [base, 0, 0];
    }
    case 'orange': {
      const base = Math.floor(128 + 127 * Math.random());
      return [base, (base >> 2) + (base >> 1), 0];
    }
    case 'cyan': {
      const base = Math.floor(128 + 127 * Math.random());
      return [0, base, base];
    }
    default: {
      return [2, 2, 2];
    }
  }
}

function paintEvent(event) {
  for (let i = 0; i < event.width; i++) {
    unicornHatHD.setPixel(15 - (event.x + i), 15 - event.y, 255, 255, 255);
  }

  for (let j = 1; j < event.height; j++) {
    for (let i = 0; i < event.width; i++) {
      const x = event.x + i;
      const y = event.y + j;

      if (x < 0 || x > 15 || y < 0 || y > 15) {
        continue;
      }

      unicornHatHD.setPixel(15 - x, 15 - y, ...rgb(event.color));
    }
  }
}

function paint(sceneGraph) {
  unicornHatHD.setAll(0, 0, 0);

  for (const item of sceneGraph) {
    if (item.type === 'event') {
      paintEvent(item);
    }
  }

  unicornHatHD.show();
}

module.exports = {paint};
