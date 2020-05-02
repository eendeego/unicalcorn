import fetch from 'node-fetch';

async function fetchIcalData(url) {
  console.log('ical url: ' + url);
  return (await fetch(url)).text();
}

const icalData = await fetchIcalData(process.argv[2]);

console.log('ical data size: ' + icalData.length);
