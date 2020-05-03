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

export function computeLayout(events) {
  let startTime = events.reduce(
    (min, event) => Math.min(min, event.start.getTime()),
    Number.POSITIVE_INFINITY,
  );
  let endTime = events.reduce(
    (max, event) => Math.max(max, event.end.getTime()),
    Number.POSITIVE_INFINITY,
  );

  startTime = roundDown(startTime);
  endTime = roundUp(endTime / QUARTER_HOUR);

  const timeline = Array.from(
    {length: (endTime - startTime) / QUARTER_HOUR},
    () => [],
  );

  let maxColumns = 0;
  for (const event of events) {
    const firstSlotIndex =
      (roundDown(event.start.getTime()) - startTime) / QUARTER_HOUR;
    const lastSlotIndex =
      (roundUp(event.end.getTime()) - startTime) / QUARTER_HOUR;

    const column = timeline[firstSlotIndex].findIndex(
      column => column === undefined,
    );
    maxColumns = Math.max(maxColumns, column + 1);

    for (
      let slotIndex = firstSlotIndex;
      slotIndex < lastSlotIndex;
      slotIndex++
    ) {
      timeline[slotIndex][column] = {event};
    }
  }

  return timeline;
}
