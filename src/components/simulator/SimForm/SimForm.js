import React from "react";
import { CardContent, Grid, Typography } from "@mui/material";
import { RegularCard } from "../../ComponentStyles";
import SimulationFormInput from "./SimFormInput";
import SimulationFormButtons from "./SimFormButtons";
import SimFormEndpointSwitcher from "./SimFormEndpointSwitcher";

const SimulationForm = (props) => (
  <RegularCard sx={{ my: 2.5 }}>
    <CardContent>
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="h5">Simulator</Typography>
        </Grid>
        <Grid item xs={6} container justifyContent="flex-end">
          <SimFormEndpointSwitcher statusState={props.statusState} />
        </Grid>
      </Grid>

      <SimulationFormInput formState={props.formState} setForm={props.setForm} />
      <SimulationFormButtons
        defaultAttributes={props.defaultAttributes}
        setAttributes={props.setAttributes}
        formState={props.formState}
        setTable={props.setTable}
        statusState={props.statusState}
        statusDispatch={props.statusDispatch}
      />
    </CardContent>
  </RegularCard>
);

export default React.memo(SimulationForm);
