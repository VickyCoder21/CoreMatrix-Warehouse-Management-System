import { useEffect } from "react";

const useSessionTimeout = (timeout = 15 * 60 * 1000, onTimeout) => {
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        sessionStorage.clear();
        onTimeout();
      }, timeout);
    };

    const activityEvents = ["click", "mousemove", "keydown", "scroll", "touchstart"];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer when hook loads

    return () => {
      clearTimeout(timer);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [timeout, onTimeout]);
};

export default useSessionTimeout;
