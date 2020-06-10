import PixelRow from './pixel-row.js';

const WAVE_BRIGHTNESS = 5 / 16;
const WAVE_PERIOD = 4; // 1 cycle every 2s
const WAVE_SPEED = 0.001 / WAVE_PERIOD;
const WAVE_LENGTH = 1 / 32; // 8 pixels

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

let timeBasedEventRowState = {
  lastSeenConfig: null,
  colorScheme: null,
};

function colorSubComponent(rgb, offset) {
  return parseInt(rgb.substring(offset, offset + 2), 16);
}

function getTimeBasedEventRowState(config) {
  if (config === timeBasedEventRowState.lastSeenConfig) {
    return timeBasedEventRowState;
  }

  const colorScheme = {
    egde: [0, 0, 0, 0],
    past: [0, 0, 0, 0],
    present: [0, 0, 0, 0],
    impending: [0, 0, 0, 0],
    future: [0, 0, 0, 0],
  };

  for (const color of Object.keys(colorScheme)) {
    const rgb = config.ui.events['time-based-color-scheme'][color];
    console.log(rgb);
    colorScheme[color][0] = colorSubComponent(rgb, 1);
    colorScheme[color][1] = colorSubComponent(rgb, 3);
    colorScheme[color][2] = colorSubComponent(rgb, 5);
    colorScheme[color][3] = rgb.length > 7 ? colorSubComponent(rgb, 7) : 0xff;
    console.log(colorScheme[color]);
  }

  timeBasedEventRowState = {lastSeenConfig: config, colorScheme};
  return timeBasedEventRowState;
}

function TimeBasedEventRow({
  config,
  currentTimeSlot,
  timeSlot, // time slot index
  rowIndex, // 0-15
  columnIndex, // 1-#max overlapping meetings
  layoutEvent,
  noise,
}) {
  const {colorScheme} = getTimeBasedEventRowState(config);

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

export default function EventRow(props) {
  if (props.config.ui.events.scheme === 'time-based') {
    return TimeBasedEventRow(props);
  }
}
