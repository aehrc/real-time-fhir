import React, { useState, useEffect} from "react";
import "../componentStyles.css";

function Stopwatch(props) {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (running) {
      let startTime = new Date().getTime();
      interval = setInterval(() => {
        let elapsed = new Date().getTime() - startTime;
        setTime(Math.ceil(elapsed / 10) * 10);
      }, 33);
    } else if (!running) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    const status = props.status.statusMsg;
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
  }, [props.status]);

  return (
    <div className="simulation-span">Time Elapsed:  
    <span>
      <span> {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
      <span>{("0" + Math.floor((time / 1000) % 60)).slice(-2)}:</span>
      <span>{("0" + ((time / 10) % 100)).slice(-2)}</span>
    </span>
    </div>
  );
}

export default Stopwatch;
