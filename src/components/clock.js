import {QUARTER_HOUR} from '../layout.js';
import ClockLine from './clock-line.js';
import HourMarker from './hour-marker.js';

const ONE_HOUR = 60 * 60 * 1000;
const TWO_HOURS = 2 * 60 * 60 * 1000;

// config.ui.clock.digits.hourDisplay values:
//   'screen' | 'epoch' | 'current'

export default function Clock({
  config,
  currentTimeSlot,
  firstTimelineIndex,
  startTime,
  timeOffset,
}) {
  const result = [];

  let rowIndex = 0;
  let rowTime = startTime + timeOffset;
  let delta;
  if (config.ui.clock.digits.hourDisplay === 'screen') {
    delta = rowTime % ONE_HOUR;
    rowIndex -= delta / QUARTER_HOUR;
    rowTime -= delta;
  } else if (config.ui.clock.digits.hourDisplay === 'epoch') {
    delta = rowTime % TWO_HOURS;
    rowIndex -= delta / QUARTER_HOUR;
    rowTime -= delta;
  } else {
    delta = (startTime % ONE_HOUR) + (timeOffset % TWO_HOURS);
    rowIndex -= delta / QUARTER_HOUR;
    rowTime -= delta;
  }

  while (rowIndex > 0) {
    rowIndex -= TWO_HOURS / QUARTER_HOUR;
    rowTime -= TWO_HOURS;
  }

  if (config.ui.clock.digits.centerVertically) {
    rowIndex -= 4;
  }

  while (rowIndex < 16) {
    result.push(HourMarker({config, rowTime, rowIndex}));
    rowIndex += 8;
    rowTime += TWO_HOURS;
  }

  if (
    currentTimeSlot >= firstTimelineIndex &&
    currentTimeSlot < firstTimelineIndex + 16
  ) {
    result.push(
      ClockLine({
        config,
        row: currentTimeSlot - firstTimelineIndex,
      }),
    );
  }

  return result.flat();
}
