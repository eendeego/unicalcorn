const ical = require('ical');
const fetch = require('node-fetch');

async function fetchIcalData(url) {
  return (await fetch(url)).text();
}

function midnightTime(referenceDate) {
  const date = new Date(referenceDate);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.getTime();
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

async function fetchCurrentEvents() {
  const todayInMs = midnightTime(new Date());

  const icalData = await fetchIcalData(process.argv[2]);
  return Object.values(ical.parseICS(icalData)).filter(
    e =>
      e.type === 'VEVENT' &&
      e.summary != 'Free' &&
      e.start.getTime() >= todayInMs,
  );
}

module.exports = {
  dumpEvent,
  dumpEvents,
  fetchCurrentEvents,
};
