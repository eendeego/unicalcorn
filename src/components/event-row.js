import PixelRow from './pixel-row.js';

const WAVE_BRIGHTNESS = 5 / 16;
const WAVE_PERIOD = 4; // 1 cycle every 2s
const WAVE_SPEED = 0.001 / WAVE_PERIOD;
const WAVE_LENGTH = 1 / 32; // 8 pixels

function gray(base) {
  return [base >> 2, base >> 2, base >> 2];
  // return [0, 0, base];
}

function red(base) {
  return [base, 0, 0];
}

function orange(base) {
  return [base, base >> 2, 0];
}

function cyan(base) {
  return [0, base, base];
}

function yellow(base) {
  return [base, (base >> 1) + (base >> 2), 0];
}

function applyBrightness(rgb, brightness) {
  return [
    Math.floor(rgb[0]) * brightness,
    Math.floor(rgb[1]) * brightness,
    Math.floor(rgb[2]) * brightness,
  ];
}

export default function EventRow({
  currentTimeSlot,
  timeSlot, // time slot index
  rowIndex, // 0-15
  columnIndex, // 1-#max overlapping meetings
  layoutEvent,
}) {
  const x = (columnIndex * 12) / layoutEvent.rowGroup.width;
  const y = rowIndex;
  const width = 12 / layoutEvent.rowGroup.width;

  let pixelColors;

  if (timeSlot === layoutEvent.firstSlotIndex) {
    pixelColors = Array.from({length: width}, () => [255, 255, 255]);
  } else {
    const colorFn =
      layoutEvent.lastSlotIndex < currentTimeSlot
        ? gray
        : layoutEvent.firstSlotIndex <= currentTimeSlot
        ? red
        : layoutEvent.firstSlotIndex === currentTimeSlot + 1
        ? orange
        : yellow;

    const brightness =
      1 -
      WAVE_BRIGHTNESS +
      WAVE_BRIGHTNESS *
        Math.sin(
          (timeSlot * WAVE_LENGTH - Date.now() * WAVE_SPEED) * 2 * Math.PI,
        );

    pixelColors = Array.from({length: width}, (_, i) =>
      i === 0
        ? [255, 255, 255]
        : applyBrightness(
            // colorFn(Math.floor(128 + 127 * Math.random())),
            colorFn(192),
            brightness,
          ),
    );
  }

  return PixelRow({x, y, pixelColors});
}
