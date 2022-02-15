import React from "react";
import { Grid, CardContent } from "@mui/material";
import { CardHeadingTypography, CardContentSmallTypography, RegularCard } from "../../ComponentStyles";

function SimulationConstantAttributes(props) {
  const { simAttributes, timelineFormatted } = props;
  return (
    <Grid container spacing={1.5}>
      {[simAttributes.resourceType, simAttributes.duration, timelineFormatted, simAttributes.durationMultiplier].map(
        (attribute, index) => (
          <Grid item xs={6} key={index}>
            <RegularCard>
              <CardContent>
                <CardHeadingTypography>{attribute.label}</CardHeadingTypography>
                
                <CardContentSmallTypography color="text.secondary">{attribute.value}</CardContentSmallTypography>
              </CardContent>
            </RegularCard>
          </Grid>
        )
      )}
    </Grid>
  );
}

export default React.memo(SimulationConstantAttributes);
