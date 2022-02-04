import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import { Timer } from "@mui/icons-material";
import SimulationConstantAttributes from "./SimConstantAttributes";
import Stopwatch from "./Stopwatch";
import EventsSent from "./EventsSent";
import SimulationStatus from "./SimStatus";
import UpcomingEvents from "./UpcomingEvents";

function SimulationAttributes(props) {
  const { attributes, status } = props;
  const propsAttributes = {
    simulationStatus: { label: "Simulation Status", value: `${status.statusMsg} ${attributes.finalEventCount}` },
    resourceType: { label: "Resource Type", value: attributes.resourceType },
    duration: { label: "Simulation Duration", value: `${attributes.duration} seconds` },
    durationMultiplier: { label: "Duration Multiplier", value: `${attributes.durationMultiplier}x` },
  };

  const [simAttributes, setSimAttributes] = useState(propsAttributes);
  const [timelineFormatted, setTimelineFormatted] = useState({
    label: "Timeline Duration",
    value: "0 seconds",
    icon: Timer,
  });

  useEffect(() => {
    setSimAttributes(propsAttributes);
  }, [props]);

  const formatTimeline = (timelineDuration) => {
    if (parseInt(timelineDuration) !== 0) {
      const timeline = new Date(timelineDuration * 1000);
      const epoch = new Date(0);

      const years = timeline.getYear() - epoch.getYear();
      const months = timeline.getMonth() - epoch.getMonth();
      let days = timeline.getDate() - epoch.getDate();
      let hours = timeline.getHours() - epoch.getHours();
      let minutes = timeline.getMinutes() - epoch.getMinutes();
      const seconds = timeline.getSeconds() - epoch.getSeconds();

      if (minutes < 0) {
        hours--;
        minutes += 60;
      }

      if (hours < 0) {
        days--;
        hours += 24;
      }

      let i = 0;
      let format = "";
      for (const [key, value] of Object.entries({ Y: years, M: months, D: days, H: hours, m: minutes, s: seconds })) {
        if (value === 0) continue;
        switch (key) {
          case "Y":
            format += `${value} yrs `;
            break;
          case "M":
            format += `${value} mths `;
            break;
          case "D":
            format += `${value} days `;
            break;
          case "H":
            format += `${value} hrs `;
            break;
          case "m":
            format += `${value} mins `;
            break;
          case "s":
            format += `${value} secs `;
            break;
          default:
            break;
        }
        i++;
        if (i === 3) break;
      }
      setTimelineFormatted({ ...timelineFormatted, value: format });
    } else {
      setTimelineFormatted({ ...timelineFormatted, value: "0 seconds" });
    }
  };

  useEffect(() => {
    formatTimeline(attributes.timelineDuration);
  }, [attributes.timelineDuration]);

  return (
    <React.Fragment>
      <Grid item xs={2}>
        <SimulationStatus simulationStatus={simAttributes.simulationStatus} />
      </Grid>

      <Grid item xs={3.25}>
        <SimulationConstantAttributes simAttributes={simAttributes} timelineFormatted={timelineFormatted} />
      </Grid>

      <Grid item xs={1.5}>
        <Stopwatch status={status} />
      </Grid>

      <Grid item xs={1.5}>
        <EventsSent eventsSent={attributes.eventsSent} totalEvents={attributes.totalEvents} />
      </Grid>

      <Grid item xs={3.75}>
        <UpcomingEvents upcomingEvents={attributes.upcomingEvents}/>
      </Grid>


      
    </React.Fragment>
  );
}

export default SimulationAttributes;
