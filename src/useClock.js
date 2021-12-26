import {roundDown, roundUp} from './layout.js';
import {useEffect} from './ui.js';

export default function useClock({setStartTime}) {
  useEffect(() => {
    let handle;

    function updateTime() {
      const now = Date.now();
      setStartTime(roundDown(now));
      const wait = roundUp(now) - now;
      handle = setTimeout(updateTime, wait);
    }
    updateTime();

    return () => clearTimeout(handle);
  }, []);
}
