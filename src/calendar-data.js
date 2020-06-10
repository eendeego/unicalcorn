import IcalExpander from 'ical-expander';
import fetch from 'node-fetch';

async function fetchIcalData(url) {
  return (await fetch(url)).text();
}

function pad(num) {
  return num < 10 ? '0' + num.toString() : num.toString();
}

export function dumpEvent(ev) {
  console.log(
    `${ev.start.getFullYear()}-${pad(ev.start.getMonth() + 1)}-${pad(
      ev.start.getDate(),
    )} ${pad(ev.start.getHours())}:${pad(ev.start.getMinutes())} -> ${pad(
      ev.end.getHours(),
    )}:${pad(ev.end.getMinutes())} ${ev.summary}`,
  );
}

export function dumpEvents(events) {
  for (const ev of events) {
    dumpEvent(ev);
  }
}

export async function fetchEvents(url, startTime, stopTime) {
  const ics = await fetchIcalData(url);
  const icalExpander = new IcalExpander({ics, maxIterations: 100});
  const events = icalExpander.between(new Date(startTime), new Date(stopTime));

  const mappedEvents = events.events.map(e => ({
    id: 0,
    dayIndex: 0,
    start: e.startDate.toJSDate(),
    end: e.endDate.toJSDate(),
    summary: e.summary,
    raw: e,
  }));
  const mappedOccurrences = events.occurrences.map(o => ({
    id: 0,
    dayIndex: 0,
    start: o.startDate.toJSDate(),
    end: o.endDate.toJSDate(),
    summary: o.item.summary,
    raw: o,
  }));

  const allEvents = []
    .concat(mappedEvents, mappedOccurrences)
    .filter(e => e.summary !== 'Free')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  let currentDay = (allEvents?.[0]?.start ?? new Date())
    .toISOString()
    .substring(0, 10);
  let dayIndex = 0;
  allEvents.forEach((event, i) => {
    event.id = i;
    const day = event.start.toISOString().substring(0, 10);
    if (day !== currentDay) {
      currentDay = day;
      dayIndex = 0;
    } else {
      dayIndex++;
    }
    event.dayIndex = dayIndex;
  });

  return allEvents;
}
