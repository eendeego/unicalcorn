/**********************************
 * Calendar layout
 */

const QUARTER_HOUR = 15 * 60 * 1000;

function roundDown(time) {
  return Math.floor(time / QUARTER_HOUR) * QUARTER_HOUR;
}

function roundUp(time) {
  return Math.ceil(time / QUARTER_HOUR) * QUARTER_HOUR;
}

function computeLayout(events) {
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

  const timeline = Array.from(
    {length: (end - start) / QUARTER_HOUR},
    (_, i) => ({
      time: start + i * QUARTER_HOUR,
      columns: [],
    }),
  );

  let maxColumns = 0;
  for (const event of events) {
    const firstSlotIndex =
      (roundDown(event.start.getTime()) - start) / QUARTER_HOUR;
    const lastSlotIndex = (roundUp(event.end.getTime()) - start) / QUARTER_HOUR;
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
      if (column === timeline[firstSlotIndex].columns.length) {
        rowGroup.width++;
      }
    }

    maxColumns = Math.max(maxColumns, column + 1);
    for (
      let slotIndex = firstSlotIndex;
      slotIndex < lastSlotIndex;
      slotIndex++
    ) {
      timeline[slotIndex].columns[column] = {rowGroup, event};
    }
  }

  return {timeline, start, end};
}

module.exports = {computeLayout, roundDown, roundUp};
