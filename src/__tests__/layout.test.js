const {computeLayout} = require('../layout');

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
  it('computes bounds', () => {
    const events = [{start: time('10:30'), end: time('11:00')}];
    const layout = computeLayout(events);
    const rowGroup = {width: 1};
    expect(layout.start).toBe(time('10:30').getTime());
    expect(layout.end).toBe(time('11:00').getTime());

    expect(layout.timeline).toStrictEqual([
      {time: time('10:30').getTime(), columns: [{rowGroup, event: events[0]}]},
      {time: time('10:45').getTime(), columns: [{rowGroup, event: events[0]}]},
    ]);
  });

  it('supports overlapping events (1)', () => {
    const events = [
      {start: time('10:30'), end: time('11:30')},
      {start: time('11:00'), end: time('12:00')},
    ];
    const rowGroup = {width: 2};
    const layout = computeLayout(events);
    expect(layout.start).toBe(time('10:30').getTime());
    expect(layout.end).toBe(time('12:00').getTime());

    expect(layout.timeline).toStrictEqual([
      {time: time('10:30').getTime(), columns: [{rowGroup, event: events[0]}]},
      {time: time('10:45').getTime(), columns: [{rowGroup, event: events[0]}]},
      {
        time: time('11:00').getTime(),
        columns: [
          {rowGroup, event: events[0]},
          {rowGroup, event: events[1]},
        ],
      },
      {
        time: time('11:15').getTime(),
        columns: [
          {rowGroup, event: events[0]},
          {rowGroup, event: events[1]},
        ],
      },
      {
        time: time('11:30').getTime(),
        columns: [undefined, {rowGroup, event: events[1]}],
      },
      {
        time: time('11:45').getTime(),
        columns: [undefined, {rowGroup, event: events[1]}],
      },
    ]);
  });

  it('supports overlapping events (2)', () => {
    const events = [
      {start: time('10:00'), end: time('10:30')},
      {start: time('10:00'), end: time('10:15')},
      {start: time('10:15'), end: time('10:30')},
    ];
    const rowGroup = {width: 2};
    const layout = computeLayout(events);
    expect(layout.start).toBe(time('10:00').getTime());
    expect(layout.end).toBe(time('10:30').getTime());

    expect(layout.timeline).toStrictEqual([
      {
        time: time('10:00').getTime(),
        columns: [
          {rowGroup, event: events[0]},
          {rowGroup, event: events[1]},
        ],
      },
      {
        time: time('10:15').getTime(),
        columns: [
          {rowGroup, event: events[0]},
          {rowGroup, event: events[2]},
        ],
      },
    ]);
  });

  it('supports different row widths', () => {
    const events = [
      {start: time('10:00'), end: time('10:30')},
      {start: time('10:30'), end: time('11:30')},
      {start: time('11:00'), end: time('12:00')},
      {start: time('12:00'), end: time('12:30')},
    ];
    const rowGroup1 = {width: 1};
    const rowGroup2 = {width: 2};
    const layout = computeLayout(events);
    expect(layout.start).toBe(time('10:00').getTime());
    expect(layout.end).toBe(time('12:30').getTime());

    expect(layout.timeline).toStrictEqual([
      {
        time: time('10:00').getTime(),
        columns: [{rowGroup: rowGroup1, event: events[0]}],
      },
      {
        time: time('10:15').getTime(),
        columns: [{rowGroup: rowGroup1, event: events[0]}],
      },
      {
        time: time('10:30').getTime(),
        columns: [{rowGroup: rowGroup2, event: events[1]}],
      },
      {
        time: time('10:45').getTime(),
        columns: [{rowGroup: rowGroup2, event: events[1]}],
      },
      {
        time: time('11:00').getTime(),
        columns: [
          {rowGroup: rowGroup2, event: events[1]},
          {rowGroup: rowGroup2, event: events[2]},
        ],
      },
      {
        time: time('11:15').getTime(),
        columns: [
          {rowGroup: rowGroup2, event: events[1]},
          {rowGroup: rowGroup2, event: events[2]},
        ],
      },
      {
        time: time('11:30').getTime(),
        columns: [undefined, {rowGroup: rowGroup2, event: events[2]}],
      },
      {
        time: time('11:45').getTime(),
        columns: [undefined, {rowGroup: rowGroup2, event: events[2]}],
      },
      {
        time: time('12:00').getTime(),
        columns: [{rowGroup: rowGroup1, event: events[3]}],
      },
      {
        time: time('12:15').getTime(),
        columns: [{rowGroup: rowGroup1, event: events[3]}],
      },
    ]);
  });
});
