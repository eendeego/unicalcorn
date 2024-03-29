/**********************************
 * Calendar layout
 */

export const ONE_DAY = 24 * 60 * 60 * 1000;
export const THREE_DAYS = 3 * ONE_DAY;
export const QUARTER_HOUR = 15 * 60 * 1000;

export function roundToQuarter(time) {
  return Math.round(time / QUARTER_HOUR) * QUARTER_HOUR;
}

export function roundDown(time) {
  return Math.floor(time / QUARTER_HOUR) * QUARTER_HOUR;
}

export function roundUp(time) {
  return Math.ceil(time / QUARTER_HOUR) * QUARTER_HOUR;
}

export function computeLayout(events) {
  let startTime = events.reduce(
    (min, event) => Math.min(min, event.start.getTime()),
    Number.POSITIVE_INFINITY,
  );
  let endTime = events.reduce(
    (max, event) => Math.max(max, event.end.getTime()),
    Number.NEGATIVE_INFINITY,
  );

  const start = roundDown(startTime);
  const end = roundUp(endTime);

  const quantizedEvents = events.map(event => ({
    event,
    firstSlotIndex: (roundDown(event.start.getTime()) - start) / QUARTER_HOUR,
    lastSlotIndex: (roundUp(event.end.getTime()) - start) / QUARTER_HOUR - 1,
  }));
  quantizedEvents.sort((a, b) => {
    if (a.firstSlotIndex !== b.firstSlotIndex) {
      return a.firstSlotIndex - b.firstSlotIndex;
    }

    return (
      b.lastSlotIndex - b.firstSlotIndex - (a.lastSlotIndex - a.firstSlotIndex)
    );
  });

  const timeline = Array.from(
    {
      length: (end - start) / QUARTER_HOUR,
    },
    (_, i) => ({
      time: start + i * QUARTER_HOUR,
      columns: [],
    }),
  );

  let maxColumns = 0;
  for (const {event, firstSlotIndex, lastSlotIndex} of quantizedEvents) {
    let column = timeline[firstSlotIndex].columns.findIndex(
      column => column === undefined,
    );
    let rowGroup;
    if (column === -1) {
      column = timeline[firstSlotIndex].columns.length;
    }
    if (column === 0) {
      rowGroup = {
        width: 1,
      };
    } else {
      rowGroup = timeline[firstSlotIndex].columns[0].rowGroup;
      rowGroup.width = Math.max(rowGroup.width, column + 1);
    }

    maxColumns = Math.max(maxColumns, column + 1);
    for (
      let slotIndex = firstSlotIndex;
      slotIndex <= lastSlotIndex;
      slotIndex++
    ) {
      timeline[slotIndex].columns[column] = {
        rowGroup,
        event,
        firstSlotIndex,
        lastSlotIndex,
      };
    }
  }

  return {timeline, start, end};
}
