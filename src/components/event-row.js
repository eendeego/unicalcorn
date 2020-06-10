import PixelRow from './pixel-row.js';

const WAVE_BRIGHTNESS = 5 / 16;
const WAVE_PERIOD = 4; // 1 cycle every 2s
const WAVE_SPEED = 0.001 / WAVE_PERIOD;
const WAVE_LENGTH = 1 / 32; // 8 pixels

const colorScheme = {
  egde: [0xff, 0xff, 0xff, 0xff],
  past: [0x3f, 0x3f, 0x3f, 0xff],
  present: [0xff, 0x00, 0x00, 0xff],
  impending: [0xff, 0x3f, 0x00, 0xff],
  future: [0xff, 0xbf, 0x00, 0xff],
};

function applyBrightness(rgb, brightness) {
  return [rgb[0] * brightness, rgb[1] * brightness, rgb[2] * brightness];
}

function intCap(component) {
  let intComponent = Math.round(component);
  return intComponent < 0 ? 0 : intComponent > 255 ? 255 : intComponent;
}

function intCappedRGB(rgb) {
  return [intCap(rgb[0]), intCap(rgb[1]), intCap(rgb[2])];
}

export default function EventRow({
  config,
  currentTimeSlot,
  timeSlot, // time slot index
  rowIndex, // 0-15
  columnIndex, // 1-#max overlapping meetings
  layoutEvent,
  noise,
}) {
  const x =
    (config.ui.hours === 'left' ? 4 : 0) +
    (columnIndex * 12) / layoutEvent.rowGroup.width;
  const y = rowIndex;
  const width = 12 / layoutEvent.rowGroup.width;

  let pixelColors;

  if (timeSlot === layoutEvent.firstSlotIndex) {
    pixelColors = Array.from({length: width}, () => colorScheme.egde);
  } else {
    const baseColor =
      layoutEvent.lastSlotIndex < currentTimeSlot
        ? colorScheme.past
        : layoutEvent.firstSlotIndex <= currentTimeSlot
        ? colorScheme.present
        : layoutEvent.firstSlotIndex === currentTimeSlot + 1
        ? colorScheme.impending
        : colorScheme.future;

    const brightness =
      1 -
      WAVE_BRIGHTNESS +
      WAVE_BRIGHTNESS *
        Math.sin(
          (timeSlot * WAVE_LENGTH - Date.now() * WAVE_SPEED) * 2 * Math.PI,
        );

    pixelColors = Array.from({length: width}, (_, i) =>
      i === 0
        ? colorScheme.egde
        : intCappedRGB(
            applyBrightness(
              applyBrightness(baseColor, noise[x + i]),
              brightness,
            ),
          ),
    );
  }

  return PixelRow({x, y, pixelColors});
}
