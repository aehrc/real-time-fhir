import React from "react";
import { Grid, Button } from "@mui/material";
import { PlayArrow, Stop } from "@mui/icons-material";
import { socket } from "../../App";
import "../componentStyles.css";

function SimulationButton(props) {
  const { formState, attributesState, setAttributes, setTable, statusState, statusDispatch } = props;

  const startSimulation = () => {
    setTable([]);
    setAttributes({
      ...attributesState,
      resourceType: formState.resourceType,
      duration: formState.duration,
      finalEventCount: "",
    });
    statusDispatch("startSimulation");
    socket.emit("start_simulation", {
      rtype: formState.resourceType,
      duration: parseInt(formState.duration),
    });
  };

  const stopSimulation = () => {
    statusDispatch("stopSimulation");
    socket.emit("stop_simulation", true);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Button
          variant="contained"
          sx={{ m: 1 }}
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
          sx={{ m: 1 }}
          startIcon={<Stop />}
          onClick={stopSimulation}
          disabled={!statusState.stopBtn}
        >
          Stop Simulation
        </Button>
      </Grid>
    </Grid>
  );
}

export default SimulationButton;
