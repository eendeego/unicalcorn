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

function projectRecurringEvents(rawEvents, startTime, stopTime) {
  let result = [];
  for (const rawEvent of rawEvents) {
    result.push({
      start: rawEvent.start,
      end: rawEvent.end,
      summary: rawEvent.summary,
      raw: rawEvent,
    });

    if (rawEvent.rrule === undefined) {
      continue;
    }

    const duration = rawEvent.end.getTime() - rawEvent.start.getTime();

    const recurrences = {};

    const newStartTimes = rawEvent.rrule.between(
      new Date(startTime),
      new Date(stopTime),
    );

    newStartTimes.forEach(startTime => {
      recurrences[new Date(newStartTimes).toISOString().substr(0, 10)] = {
        start: new Date(startTime),
        end: new Date(new Date(startTime).getTime() + duration),
        summary: rawEvent.summary,
        raw: null,
        recurringEvent: rawEvent,
      };
    });

    let time = rawEvent.start.getTime();

    for (const recurrenceDate of Object.keys(rawEvent.recurrences || [])) {
      const recurrence = rawEvent.recurrences[recurrenceDate];
      recurrences[recurrenceDate] = {
        start: recurrence.start,
        end: recurrence.end,
        summary: rawEvent.summary,
        raw: recurrence,
        recurringEvent: rawEvent,
      };
    }

    result = result.concat(Object.values(recurrences));
  }
  result.sort((a, b) => a.start.getTime() - b.start.getTime());
  return result;
}

async function fetchEvents(startTime, stopTime) {
  const todayInMs = midnightTime(startTime);

  const icalData = await fetchIcalData(process.argv[2]);
  const rawEvents = ical.parseICS(icalData);
  const filteredEvents = Object.values(rawEvents).filter(
    e => e.type === 'VEVENT' && e.summary != 'Free',
  );
  return projectRecurringEvents(filteredEvents, startTime, stopTime);
}

module.exports = {
  dumpEvent,
  dumpEvents,
  fetchEvents,
};
