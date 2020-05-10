/**********************************
 * Paint implementation running on console
 */

import chalk from 'chalk';

const blankUI = Array.from({length: 16 * 16}, () => [0, 0, 0]);

let frameBuffer = [...blankUI];

export function paint(sceneGraph) {
  process.stdout.write('\x1b[2J\x1b[H');
  frameBuffer = [...blankUI];

  for (const {x, y, color} of sceneGraph) {
    frameBuffer[16 * y + x] = color;
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
