import React, { useContext } from "react";
import { AttributesContext, StatusContext } from "./Simulation";
import Stopwatch from "./Stopwatch";
import "../componentStyles.css";

function SimulationAttributes() {
  const { attributesState } = useContext(AttributesContext);
  const { statusState } = useContext(StatusContext);

  const { resourceType, duration, totalEvents, eventsReceived, finalEventCount} = attributesState;

  return (
    <div className="simulation-attributes">
      <div className="bold">Simulation Status: {statusState.statusMsg} {finalEventCount}</div>
      <div className="simulation-span">Resource Type: {resourceType}</div>
      <div className="simulation-span">Duration: {duration}</div>
      <div className="simulation-span">
        Events Received: {eventsReceived}/{totalEvents}
      </div>
      <div className="simulation-span">Time Elapsed: <Stopwatch/></div>
    </div>
  );
}

export default SimulationAttributes;
