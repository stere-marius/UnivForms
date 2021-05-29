import React, { useState, useEffect } from "react";
import moment from "moment";

const CountdownTimer = ({ initialSeconds, onEnd, onTimeLeftChange }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  const formatToHHMMSS = seconds => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds = seconds - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    return hours + ":" + minutes + ":" + seconds;
  };

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
