import React, { useState, useEffect, useContext } from "react";
import { StatusContext } from "./Simulation";

function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  const { statusState } = useContext(StatusContext);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!running) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    const status = statusState.statusMsg;
    switch (status) {
      case "Sending events":
        return setRunning(true);
      case "Stopping simulation":
      case "Simulation completed":
        setTime(0);
        setRunning(false);
        return;
      default:
        return;
    }
  }, [statusState]);

  return (
    <span>
      <span>{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
      <span>{("0" + Math.floor((time / 1000) % 60)).slice(-2)}:</span>
      <span>{("0" + ((time / 10) % 100)).slice(-2)}</span>
    </span>
  );
}

export default Stopwatch;
