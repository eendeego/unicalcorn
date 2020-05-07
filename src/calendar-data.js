const IcalExpander = require('ical-expander');
const fetch = require('node-fetch');

async function fetchIcalData(url) {
  return (await fetch(url)).text();
}

function pad(num) {
  return num < 10 ? '0' + num.toString() : num.toString();
}

function dumpEvent(ev) {
  console.log(
    `${ev.start.getFullYear()}-${pad(ev.start.getMonth() + 1)}-${pad(
      ev.start.getDate(),
    )} ${pad(ev.start.getHours())}:${pad(ev.start.getMinutes())} -> ${pad(
      ev.end.getHours(),
    )}:${pad(ev.end.getMinutes())} ${ev.summary}`,
  );
}

function dumpEvents(events) {
  for (const ev of events) {
    dumpEvent(ev);
  }
}

async function fetchEvents(startTime, stopTime) {
  const ics = await fetchIcalData(process.argv[2]);
  const icalExpander = new IcalExpander({ics, maxIterations: 100});
  const events = icalExpander.between(new Date(startTime), new Date(stopTime));

  const mappedEvents = events.events.map(e => ({
    start: e.startDate.toJSDate(),
    end: e.endDate.toJSDate(),
    summary: e.summary,
    raw: e,
  }));
  const mappedOccurrences = events.occurrences.map(o => ({
    start: o.startDate.toJSDate(),
    end: o.endDate.toJSDate(),
    summary: o.item.summary,
    raw: o,
  }));

  const allEvents = []
    .concat(mappedEvents, mappedOccurrences)
    .filter(e => e.summary !== 'Free')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return allEvents;
}

module.exports = {
  dumpEvent,
  dumpEvents,
  fetchEvents,
};
