/**********************************
 * Paint implementation running on console
 */

const chalk = require('chalk');

const blankUI = Array.from({length: 16 * 16}, () => [0, 0, 0]);

let frameBuffer = [...blankUI];

function rgb(color) {
  switch (color) {
    case 'red': {
      const base = Math.floor(128 + 127 * Math.random());
      return [base, 0, 0];
    }
    case 'orange': {
      const base = Math.floor(128 + 127 * Math.random());
      return [base, base >> 2, 0];
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
  if (event.y >= 0 && event.y <= 15) {
    for (let i = 0; i < event.width; i++) {
      frameBuffer[16 * event.y + event.x + i] = [255, 255, 255];
    }
  }

  for (let j = 1; j < event.height; j++) {
    const y = event.y + j;
    if (y < 0 || y > 15) {
      continue;
    }

    for (let i = 0; i < event.width; i++) {
      const x = event.x + i;
      if (x < 0 || x > 15) {
        continue;
      }

      frameBuffer[16 * y + x] = rgb(event.color);
    }
  }
}

function paint(sceneGraph) {
  process.stdout.write('\033[2J\033[H');
  frameBuffer = [...blankUI];

  for (const item of sceneGraph) {
    if (item.type === 'event') {
      paintEvent(item);
    }
  }

  for (let i = 0; i < 16 * 16; i++) {
    process.stdout.write(
      chalk.rgb(frameBuffer[i][0], frameBuffer[i][1], frameBuffer[i][2])('@'),
    );
    if (i % 16 === 15) {
      process.stdout.write('\n');
    }
  }
  process.stdout.write('\n');
}

module.exports = {paint};
