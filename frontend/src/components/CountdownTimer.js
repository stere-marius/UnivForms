import React, { useState, useEffect } from "react";
import { formatToHHMMSS } from "../utilities";

const CountdownTimer = ({ initialSeconds, onEnd, onTimeLeftChange }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  const tick = () => {
    if (seconds === 0) {
      onEnd();
      return;
    }
    setSeconds(seconds - 1);
    onTimeLeftChange(seconds - 1);
  };

  useEffect(() => {
    const timerID = setInterval(tick, 1000);
    return () => {
      clearInterval(timerID);
    };
  });

  return <p>{formatToHHMMSS(seconds)}</p>;
};

export default CountdownTimer;
