import {computeLayout} from '../layout.js';

function time(humanReadableTime) {
  const result = new Date();
  const hhmm = humanReadableTime.split(':');
  result.setHours(hhmm[0]);
  result.setMinutes(hhmm[1]);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
}

describe('computeLayout', () => {
  test('computes bounds', () => {
    const events = [{startTime: time('10:30'), endTime: time('11:00')}];
    const layout = computeLayout(events);
    expect(layout.start).toBe(time('10:30'));
    expect(layout.end).toBe(time('11:30'));
  });
});
