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
  for (let i = 0; i < event.width; i++) {
    frameBuffer[16 * event.y + event.x + i] = [255, 255, 255];
  }

  for (let j = 1; j < event.height; j++) {
    for (let i = 0; i < event.width; i++) {
      frameBuffer[16 * (event.y + j) + event.x + i] = rgb(event.color);
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
