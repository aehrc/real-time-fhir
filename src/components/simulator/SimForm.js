import React from "react";
import {
  Grid,
  Typography,
  Autocomplete,
  FormControl,
  TextField,
  InputAdornment,
} from "@mui/material";
import resourceList from "../assets/resources-synthea.json";
import "../componentStyles.css";

const SimulationForm = (props) => (
  <React.Fragment>
    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
      Simulator
    </Typography>

    <Grid container spacing={2}>
      <Grid item xs={6}>
        <FormControl variant="outlined" fullWidth>
          <Autocomplete
            id="combo-box-demo"
            options={resourceList.resources}
            value={props.form.resourceType}
            onChange={(e, newValue) => {
              props.setForm({ ...props.form, resourceType: newValue });
            }}
            renderInput={(params) => <TextField {...params} label="Resource Type" />}
          />
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <FormControl variant="outlined" fullWidth>
          <TextField
            label="With normal TextField"
            id="outlined-start-adornment"
            value={props.form.duration}
            onChange={(e) => {
              props.setForm({ ...props.form, duration: e.target.value });
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

export default React.memo(SimulationForm);
