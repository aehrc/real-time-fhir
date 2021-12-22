import React, { useState, useContext } from "react";
import { AttributesContext, StatusContext, TableContext } from "./Simulation";
import { socket } from "../../App";
import resourceList from "../assets/resources-synthea.json";
import "../componentStyles.css";

function SimulationForm() {
  const [form, setForm] = useState({
    resourceType: "DiagnosticReport",
    duration: 60,
  });

  const { attributesState, setAttributes } = useContext(AttributesContext);
  const { setTable } = useContext(TableContext);
  const { statusState, statusDispatch } = useContext(StatusContext);

  const startSimulation = (event) => {
    event.preventDefault();
    setTable([]);
    setAttributes({
      ...attributesState,
      resourceType: form.resourceType,
      duration: form.duration,
      finalEventCount: "",
    });
    statusDispatch("startSimulation");
    socket.emit("start_simulation", {
      rtype: form.resourceType,
      duration: parseInt(form.duration),
    });
  };

  function stopSimulation() {
    statusDispatch("stopSimulation");
    socket.emit("stop_simulation", true);
  }

  return (
    <form onSubmit={startSimulation}>
      <div className="form-group">
        <label>Resource Type</label>
        <select
          className="form-select"
          value={form.resourceType}
          onChange={(e) => setForm({ ...form, resourceType: e.target.value })}
        >
          {resourceList.resources.map((resource, index) => (
            <option key={index} value={resource}>
              {resource}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Duration</label>
        <input
          type="text"
          className="form-control"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
        />
        <small className="form-text text-muted">Enter duration in seconds. E.g. 3600 for 1 hour.</small>
      </div>

      <button type="Submit" className="btn btn-success" disabled={!statusState.startBtn}>
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
    </form>
  );
}

export default SimulationForm;
