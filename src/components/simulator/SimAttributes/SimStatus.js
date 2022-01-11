import React from "react";
import { CardContent, Typography } from "@mui/material";
import { CardHeadingTypography, FullHeightCard } from "../../ComponentStyles";
import { HourglassBottom } from "@mui/icons-material";

function SimulationStatus(props) {
  return (
    <FullHeightCard>
      <CardContent>
        <CardHeadingTypography>
          {props.simulationStatus.label}
          <HourglassBottom sx={{ ml: 0.5 }} />
        </CardHeadingTypography>
        <Typography sx={{ fontSize: 40 }} color="text.secondary">
          {props.simulationStatus.value}
        </Typography>
      </CardContent>
    </FullHeightCard>
  );
}

export default React.memo(SimulationStatus);
