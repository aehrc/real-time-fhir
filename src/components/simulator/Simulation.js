import React, { useState, useEffect, useRef, useReducer } from "react";
import SimulationForm from "./SimForm";
import SimulationButtons from "./SimButtons";
import SimulationAttributes from "./SimAttributes";
import Stopwatch from "./Stopwatch";
import EventTable from "./EventTable";
import { socket } from "../../App";


// default values for attributes state
const defaultAttributes = {
  resourceType: "Not Specified",
  duration: "0",
  totalEvents: "0",
  eventsReceived: "0",
  finalEventCount: "",
};

// default values for status state
const statusReducer = (state, action) => {
  switch (action) {
    case "notRunning":
      return { startBtn: true, stopBtn: false, statusMsg: "Not running" };
    case "startSimulation":
      return { startBtn: false, stopBtn: false, statusMsg: "Generating events" };
    case "sendEvents":
      return { startBtn: false, stopBtn: true, statusMsg: "Sending events" };
    case "stopSimulation":
      return { startBtn: false, stopBtn: false, statusMsg: "Stopping simulation" };
    case "simulationStopped":
      return { startBtn: true, stopBtn: false, statusMsg: "Simulation ended early" };
    case "simulationComplete":
      return { startBtn: true, stopBtn: false, statusMsg: "Simulation completed" };
    default:
      return state;
  }
  //figure out how to add attributes state into reducer
};

function Simulation() {
  // Simulation form state
  const [form, setForm] = useState({
    resourceType: "DiagnosticReport",
    duration: 60,
  });

  // Simulation attributes state
  const [attributes, setAttributes] = useState(defaultAttributes);
  const attributesRef = useRef(defaultAttributes);
  attributesRef.current = attributes;

  // Event table state
  const [table, setTable] = useState([]);
  const tableRef = useRef([]);
  tableRef.current = table;

  // Simulation Status reducer
  const [status, statusDispatch] = useReducer(statusReducer, {
    startBtn: true,
    stopBtn: false,
    statusMsg: "Not running",
  });

  //Send context/Use state from child to parent - en jp language
  useEffect(() => {
    socket.on("sendEvents", (data) => {
      setAttributes({
        ...attributesRef.current,
        totalEvents: data,
      });
      statusDispatch("sendEvents");
    });

    socket.on("postBundle", (idx, bundle, elapsed, status) => {
      setAttributes({
        ...attributesRef.current,
        eventsReceived: idx,
      });

      const tableRow = generateRow(idx, bundle, elapsed, status, attributesRef.current.totalEvents);
      let tempTable = [tableRow, ...tableRef.current];
      if (tempTable.length > 50) {
        tempTable.pop();
      }
      setTable(tempTable);
      console.log(tableRef.current.length);
    });

    socket.on("simulationEnd", (data) => {
      if (attributesRef.current.eventsReceived === attributesRef.current.totalEvents) {
        statusDispatch("simulationComplete");
      } else {
        statusDispatch("simulationStopped");
      }
      setAttributes({
        ...attributes,
        finalEventCount: `${attributesRef.current.eventsReceived}/${attributesRef.current.totalEvents}`,
      });
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <p className="h1 title">Simulator</p>
      <SimulationForm form={form} setForm={setForm} />
      <SimulationButtons
        formState={form}
        attributesState={attributes}
        setAttributes={setAttributes}
        setTable={setTable}
        statusState={status}
        statusDispatch={statusDispatch}
      />

      <SimulationAttributes attributes={attributes} status={status} />
      <Stopwatch status={status} />
      <EventTable tableBody={table} />
    </div>
  );
}

const generateRow = (idx, bundle, elapsed, status, total_events) => {
  const row = {
    eventNo: `${idx}/${total_events}`,
    resource: {
      type: bundle.entry[0].resource.resourceType,
      id: bundle.entry[0].resource.id,
    },
    refCount: bundle.entry.length - 1,
    references: [],
    timestamp: elapsed,
    status: status,
  };

  for (let i = 1, len = bundle.entry.length; i < len; i++) {
    row.references.push({
      type: bundle.entry[i].resource.resourceType,
      id: bundle.entry[i].resource.id,
    });
  }
  return row;
};

export default Simulation;
