/*
 * Copyright © 2022, Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
 * Software Licence Agreement.
 */

import React from "react";
import { CardContent, Typography } from "@mui/material";
import { RegularCard } from "../../ComponentStyles";
import SimulationFormInput from "./SimFormInput";
import SimulationFormButtons from "./SimFormButtons";

const SimulationForm = (props) => (
  <RegularCard sx={{ my: 2.5 }}>
    <CardContent>
      <Typography variant="h5">Simulator</Typography>

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
