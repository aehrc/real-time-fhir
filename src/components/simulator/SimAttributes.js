import React, { useState, useEffect, useCallback } from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { PlayArrow, Stop } from "@mui/icons-material";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import TimerIcon from "@mui/icons-material/Timer";
import TopicIcon from "@mui/icons-material/Topic";
import "../componentStyles.css";

const SimulationAttributes = (props) => {
  const simAttributes = {
    simulationStatus: {
      label: "Simulation Status",
      value: `${props.status.statusMsg} ${props.attributes.finalEventCount}`,
    },
    resourceType: { label: "Resource Type", value: props.attributes.resourceType },
    duration: { label: "Simulation Duration", value: `${props.attributes.duration} seconds` },
    //timelineDuration: { label: "Timeline Duration", value: props.attributes.timelineDuration },
    durationMultiplier: { label: "Duration Multiplier", value: `${props.attributes.durationMultiplier}x` },
    eventsReceived: {
      label: "Events Received",
      value: `${props.attributes.eventsReceived}/${props.attributes.totalEvents}`,
    },
  };

  const [attributes, setAttributes] = useState(simAttributes);
  const [timelineFormatted, setTimelineFormatted] = useState({ label: "Timeline Duration", value: "0 seconds" });

  const formatTimeline = (timelineDuration) => {
    if (timelineDuration != 0) {
      const timeline = new Date(timelineDuration * 1000);
      const epoch = new Date(0);

      const years = timeline.getYear() - epoch.getYear();
      const months = timeline.getMonth() - epoch.getMonth();
      let days = timeline.getDate() - epoch.getDate();
      let hours = timeline.getHours() - epoch.getHours();
      let minutes = timeline.getMinutes() - epoch.getMinutes();
      const seconds = timeline.getSeconds() - epoch.getSeconds();
      console.log("Y M D H m s");
      console.log(years, months, days, hours, minutes, seconds);

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
            format += `${value} years `;
            break;
          case "M":
            format += `${value} months `;
            break;
          case "D":
            format += `${value} days `;
            break;
          case "H":
            format += `${value} hours `;
            break;
          case "m":
            format += `${value} minutes `;
            break;
          case "s":
            format += `${value} seconds `;
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
  //have to optimize formattimeline so that wont be called every bundle post

  useEffect(() => {
    setAttributes(simAttributes);
    formatTimeline(props.attributes.timelineDuration);
  }, [props]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={3}>
        <Card style={{ height: "100%" }}>
          <CardContent>
            <Typography sx={{ fontSize: 18 }}>{attributes.simulationStatus.label}</Typography>
            <Typography sx={{ fontSize: 32 }} color="text.secondary">
              {attributes.simulationStatus.value}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={6}>
        <Grid container spacing={1.5}>
          {[attributes.resourceType, attributes.duration, timelineFormatted, attributes.durationMultiplier].map(
            (attribute, index) => (
              <Grid item xs={6} key={index}>
                <Card>
                  <CardContent>
                    <Typography sx={{ fontSize: 18 }}>{attribute.label}</Typography>
                    <Typography sx={{ fontSize: 16 }} color="text.secondary">
                      {attribute.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          )}
        </Grid>
      </Grid>

      <Grid item xs={3}>
        <Card style={{ height: "100%" }}>
          <CardContent>
            <Typography sx={{ fontSize: 18 }}>{attributes.eventsReceived.label}</Typography>
            <Typography sx={{ fontSize: 32 }} color="text.secondary">
              {attributes.eventsReceived.value}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SimulationAttributes;
