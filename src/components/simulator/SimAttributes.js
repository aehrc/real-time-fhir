import React, { useState, useEffect } from "react";
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
    resourceType: { label: "Resource Type", value: `${props.attributes.resourceType}` },
    duration: { label: "Duration", value: `${props.attributes.duration}` },
    eventsReceived: {
      label: "Events Received",
      value: `${props.attributes.eventsReceived}/${props.attributes.totalEvents}`,
    },
  };

  const [attributes, setAttributes] = useState(simAttributes);
  
  useEffect(() => {
    setAttributes(simAttributes)
  }, [props])

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        {/* Move grid container to sim so that we cana include timer too */}
        {Object.keys(attributes).map((attribute, index) => (
          <Grid item xs={3}>
            <Card>
              <CardContent>
                <Typography sx={{ fontSize: 20 }}>{attributes[attribute].label}</Typography>
                <Typography sx={{ fontSize: 15 }} color="text.secondary">
                  {attributes[attribute].value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </React.Fragment>
  );
};

export default SimulationAttributes;
