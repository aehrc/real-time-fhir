import React, { useState, useEffect } from "react";
import { CardContent } from "@mui/material";
import { Timer } from "@mui/icons-material";
import { CardHeadingTypography, CardContentMediumTypography, FullHeightCard } from "../../ComponentStyles";

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
      case "startSimulation":
        setTime(0);
        break;
      case "sendEvents":
        setTime(0);
        setRunning(true);
        break;
      case "stopSimulation":
      case "simulationComplete":
        setRunning(false);
        break;
      case "resetSimulation":
        setTime(0);
        break;
      default:
        break;
    }
    return;
  }, [props.status]);

  return (
    <FullHeightCard>
      <CardContent>
        <CardHeadingTypography>
          Time Elapsed
          <Timer sx={{ ml: 0.5 }} />
        </CardHeadingTypography>
        <CardContentMediumTypography color="text.secondary">
          {("0" + Math.floor((time / 60000) % 60)).slice(-2)}:{("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
          {("0" + ((time / 10) % 100)).slice(-2)}
        </CardContentMediumTypography>
      </CardContent>
    </FullHeightCard>
  );
}

export default React.memo(Stopwatch);
