import React from "react";
import { Grid, Button } from "@mui/material";
import { PlayArrow, RestartAlt, Stop } from "@mui/icons-material";

function SimulationFormButtons(props) {
  const { statusState, statusDispatch } = props;

  const startSimulation = () => {
    statusDispatch("startSimulation");
  };

  const resetSimulation = () => {
    statusDispatch("resetSimulation");
  };

  const stopSimulation = () => {
    statusDispatch("stopSimulation");
  };

  return (
    <Grid container>
      <Grid item xs={6}>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={startSimulation}
          disabled={!statusState.startBtn}
        >
          Start Simulation
        </Button>
      </Grid>

      <Grid item xs={6} container justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<RestartAlt />}
          onClick={resetSimulation}
          disabled={!statusState.resetBtn}
          sx = {{mr: 1.5}}
        >
          Reset Simulation
        </Button>
        <Button variant="contained" startIcon={<Stop />} onClick={stopSimulation} disabled={!statusState.stopBtn} color="error" >
          Stop Simulation
        </Button>
      </Grid>
    </Grid>
  );
}

export default React.memo(SimulationFormButtons);
