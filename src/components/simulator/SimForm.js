import React from "react";
import { CardContent, CardActions } from "@mui/material";
import SimulationFormInput from "./SimFormInput";
import SimulationFormButtons from "./SimFormButtons";
import { RegularCard } from "./SimStyles";

const SimulationForm = (props) => (
  <RegularCard sx={{ my: 2.5 }}>
    <CardContent>
      <SimulationFormInput formState={props.formState} setForm={props.setForm} />
      <SimulationFormButtons
        formState={props.formState}
        attributesState={props.attributesState}
        setAttributes={props.setAttributes}
        setTable={props.setTable}
        statusState={props.statusState}
        statusDispatch={props.statusDispatch}
      />
      </CardContent>
  </RegularCard>
);

export default React.memo(SimulationForm);
