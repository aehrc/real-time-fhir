import React, { useState, useEffect } from "react";
import { Grid, CardContent, Typography } from "@mui/material";
import { Task, Timer, HourglassBottom } from "@mui/icons-material";
import { CardHeadingTypography, FullHeightCard, RegularCard } from "./SimStyles";

const SimulationAttributes = (props) => {
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
    if (timelineDuration != 0) {
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
  //have to add progress bar for time
  //have to add error handling in case backend goes down

  useEffect(() => {
    formatTimeline(attributes.timelineDuration);
  }, [attributes.timelineDuration]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <FullHeightCard>
          <CardContent>
            <CardHeadingTypography>
              {simAttributes.simulationStatus.label}
              <HourglassBottom sx={{ ml: 0.5 }} />
            </CardHeadingTypography>
            <Typography sx={{ fontSize: 40 }} color="text.secondary">
              {simAttributes.simulationStatus.value}
            </Typography>
          </CardContent>
        </FullHeightCard>
      </Grid>

      <Grid item xs={6}>
        <Grid container spacing={1.5}>
          {[
            simAttributes.resourceType,
            simAttributes.duration,
            timelineFormatted,
            simAttributes.durationMultiplier,
          ].map((attribute, index) => (
            <Grid item xs={6} key={index}>
              <RegularCard>
                <CardContent>
                  <CardHeadingTypography>{attribute.label}</CardHeadingTypography>

                  <Typography sx={{ fontSize: 16 }} color="text.secondary">
                    {attribute.value}
                  </Typography>
                </CardContent>
              </RegularCard>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SimulationAttributes;
