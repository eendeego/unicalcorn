import ical from 'ical';
import fetch from 'node-fetch';
import uiEventLoop from './ui.js';

async function fetchIcalData(url) {
  console.log('ical url: ' + url);
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

function dumpEvents(events) {
  for (const ev of events) {
    console.log(
      `${ev.start.getFullYear()}-${pad(ev.start.getMonth() + 1)}-${pad(
        ev.start.getDate(),
      )} ${pad(ev.start.getHours())}:${pad(ev.start.getMinutes())} ${
        ev.summary
      }`,
    );
  }
}

async function fetchCurrentEvents() {
  const todayInMs = midnightTime(new Date());

  const icalData = await fetchIcalData(process.argv[2]);
  return Object.values(ical.parseICS(icalData)).filter(
    e => e.type === 'VEVENT' && e.start.getTime() >= todayInMs,
  );
}

// eslint-disable-next-line
function renderCalendar({url}) {
  return [];
}

uiEventLoop(renderCalendar, {url: process.argv[2]});

fetchCurrentEvents().then(events => dumpEvents(events));
