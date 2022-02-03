import React from "react";
import { Grid, Autocomplete, FormControl, TextField, InputAdornment } from "@mui/material";
import resourceList from "../../assets/resources-synthea.json";

const SimulationFormInput = (props) => (
  <React.Fragment>
    <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <Autocomplete
            options={resourceList.resources}
            value={props.formState.resourceType}
            onChange={(e, newValue) => {
              props.setForm({ ...props.formState, resourceType: newValue });
            }}
            renderInput={(params) => <TextField {...params} label="Resource Type" />}
          />
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <FormControl fullWidth>
          <TextField
            value={props.formState.duration}
            onChange={(e) => {
              props.setForm({ ...props.formState, duration: e.target.value });
            }}
            InputProps={{
              endAdornment: <InputAdornment position="start">(s)</InputAdornment>,
            }}
            label="Duration"
          />
        </FormControl>
      </Grid>
    </Grid>
  </React.Fragment>
);

export default React.memo(SimulationFormInput);
