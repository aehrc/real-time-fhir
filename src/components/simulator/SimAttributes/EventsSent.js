import React from "react";
import { CardContent } from "@mui/material";
import { AssignmentTurnedIn } from "@mui/icons-material";
import { CardHeadingTypography, CardContentMediumTypography, FullHeightCard } from "../../ComponentStyles";

function EventsSent(props) {
  return (
    <FullHeightCard>
      <CardContent>
        <CardHeadingTypography>
          Events Sent
          <AssignmentTurnedIn sx={{ ml: 0.5 }} />
        </CardHeadingTypography>
        <CardContentMediumTypography color="text.secondary">
          {props.eventsSent}/{props.totalEvents}
        </CardContentMediumTypography>
      </CardContent>
    </FullHeightCard>
  );
}

export default React.memo(EventsSent);
