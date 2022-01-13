import React from "react";
import { CardContent, Typography } from "@mui/material";
import { Task } from "@mui/icons-material";
import { CardHeadingTypography, FullHeightCard } from "../../ComponentStyles";

function EventsSent(props) {
  return (
    <FullHeightCard>
      <CardContent>
        <CardHeadingTypography>
          Events Sent
          <Task sx={{ ml: 0.5 }} />
        </CardHeadingTypography>
        <Typography sx={{ fontSize: 40 }} color="text.secondary">
          {props.eventsSent}/{props.totalEvents}
        </Typography>
      </CardContent>
    </FullHeightCard>
  );
}

export default React.memo(EventsSent);
