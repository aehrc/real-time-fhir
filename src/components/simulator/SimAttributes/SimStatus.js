import React from "react";
import { CardContent } from "@mui/material";
import { CardHeadingTypography, CardContentMediumTypography, FullHeightCard } from "../../ComponentStyles";
import { HourglassBottom } from "@mui/icons-material";

function SimulationStatus(props) {
  return (
    <FullHeightCard>
      <CardContent>
        <CardHeadingTypography>
          {props.simulationStatus.label}
          <HourglassBottom sx={{ ml: 0.5 }} />
        </CardHeadingTypography>
        
        <CardContentMediumTypography color="text.secondary">{props.simulationStatus.value}</CardContentMediumTypography>
      </CardContent>
    </FullHeightCard>
  );
}

export default React.memo(SimulationStatus);
