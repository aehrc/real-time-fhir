import React from "react";
import { socket } from "../../App";
import "../componentStyles.css";

function SimulationButton(props) {
const {formState, attributesState, setAttributes, setTable, statusState, statusDispatch} = props

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
  }

  return (
    <React.Fragment>
      <button type="button" className="btn btn-success" onClick={startSimulation} disabled={!statusState.startBtn}>
        Start Simulation
      </button>
      <button
        type="button"
        className="btn btn-danger float-right"
        onClick={stopSimulation}
        disabled={!statusState.stopBtn}
      >
        Stop Simulation
      </button>
    </React.Fragment>
  );
}

export default SimulationButton;
