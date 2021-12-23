import React from "react";
import "../componentStyles.css";

const SimulationAttributes = (props) => (
  <div className="simulation-attributes">
    <div className="bold">
      Simulation Status: {props.status.statusMsg} {props.attributes.finalEventCount}
    </div>
    <div className="simulation-span">Resource Type: {props.attributes.resourceType}</div>
    <div className="simulation-span">Duration: {props.attributes.duration}</div>
    <div className="simulation-span">
      Events Received: {props.attributes.eventsReceived}/{props.attributes.totalEvents}
    </div>
  </div>
);

export default SimulationAttributes;
