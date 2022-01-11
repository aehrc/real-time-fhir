import React from "react";
import { Grid, CardContent, Typography } from "@mui/material";
import { CardHeadingTypography, RegularCard } from "../../ComponentStyles";

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

                <Typography sx={{ fontSize: 16 }} color="text.secondary">
                  {attribute.value}
                </Typography>
              </CardContent>
            </RegularCard>
          </Grid>
        )
      )}
    </Grid>
  );
}

export default React.memo(SimulationConstantAttributes);
