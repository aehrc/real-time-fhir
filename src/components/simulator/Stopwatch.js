import React, { useState, useEffect } from "react";
import { Paper, Card, CardContent, Typography } from "@mui/material";
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
    const status = props.status.statusCode;
    switch (status) {
      case "sendEvents":
        return setRunning(true);
      case "stopSimulation":
      case "simulationComplete":
        setTime(0);
        setRunning(false);
        return;
      default:
        return;
    }
  }, [props.status]);

  return (
    <Card style={{ height: "100%" }}>
      <CardContent>
        <Typography sx={{ fontSize: 18 }}>Time Elapsed</Typography>
        <Typography sx={{ fontSize: 68, textAlign: "center"}} color="text.secondary">
          {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:{("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
          {("0" + ((time / 10) % 100)).slice(-2)}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default React.memo(Stopwatch);
