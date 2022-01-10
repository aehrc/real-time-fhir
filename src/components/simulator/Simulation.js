import React, { useState, useEffect, useRef, useReducer } from "react";
import { Grid } from "@mui/material";
import { socket } from "../../App";
import SimulationForm from "./SimForm";
import SimulationAttributes from "./SimAttributes";
import Stopwatch from "./Stopwatch";
import EventTable from "./EventTable";
import EventsRecieved from "./EventsRecieved";

// default values for attributes state
const defaultAttributes = {
  resourceType: "Not Specified",
  duration: "0",
  totalEvents: "0",
  eventsReceived: "0",
  finalEventCount: "",
  timelineDuration: "0",
  durationMultiplier: "0",
};

function Simulation() {
  // Form, Attributes and Table states
  const [form, setForm] = useState({
    resourceType: "DiagnosticReport",
    duration: 60,
  });

  const [attributes, setAttributes] = useState(defaultAttributes);
  const attributesRef = useRef(defaultAttributes);
  attributesRef.current = attributes;

  const [table, setTable] = useState([]);
  const tableRef = useRef([]);
  tableRef.current = table;

  // sockets receiving messages from backend
  useEffect(() => {
    socket.on("sendEvents", (numOfEvents, timelineDuration) => {
      setAttributes({
        ...attributesRef.current,
        totalEvents: numOfEvents,
        timelineDuration: timelineDuration,
        durationMultiplier: `${timelineDuration / attributesRef.current.duration}`,
      });
      statusDispatch("sendEvents");
    });

    socket.on("postBundle", (idx, bundle, timestamp, elapsed, status) => {
      setAttributes({
        ...attributesRef.current,
        eventsReceived: idx,
      });

      const tableRow = generateRow(idx, bundle, timestamp, elapsed, status, attributesRef.current.totalEvents);
      let tempTable = [tableRow, ...tableRef.current];
      if (tempTable.length > 30) {
        tempTable.pop();
      }
      setTable(tempTable);
    });

    socket.on("simulationEnd", (data) => {
      if (attributesRef.current.eventsReceived === attributesRef.current.totalEvents) {
        statusDispatch("simulationComplete");
      } else {
        statusDispatch("simulationStopped");
      }
      setAttributes({
        ...attributesRef.current,
        finalEventCount: `${attributesRef.current.eventsReceived}/${attributesRef.current.totalEvents}`,
      });
    });

    return () => socket.disconnect();
  }, []);

  // Reducer for simulation status
  const statusReducer = (state, action) => {
    switch (action) {
      case "notRunning":
        return { statusCode: action, statusMsg: "Not running", startBtn: true, stopBtn: false, resetBtn: false };
      case "startSimulation":
        setAttributes(defaultAttributes);
        setTable([]);
        setAttributes({
          ...attributes,
          resourceType: form.resourceType,
          duration: form.duration,
          finalEventCount: "",
        });
        socket.emit("start_simulation", { rtype: form.resourceType, duration: parseInt(form.duration) });
        return { statusCode: action, statusMsg: "Generating events", startBtn: false, stopBtn: false, resetBtn: false };
      case "sendEvents":
        return { statusCode: action, statusMsg: "Receiving events", startBtn: false, stopBtn: true, resetBtn: false };
      case "stopSimulation":
        socket.emit("stop_simulation", true);
        return { statusCode: action, statusMsg: "Stopping", startBtn: false, stopBtn: false, resetBtn: false };
      case "simulationStopped":
        return { statusCode: action, statusMsg: "Ended early", startBtn: true, stopBtn: false, resetBtn: true };
      case "simulationComplete":
        return { statusCode: action, statusMsg: "Completed", startBtn: true, stopBtn: false, resetBtn: true };
      case "resetSimulation":
        setAttributes(defaultAttributes);
        setTable([]);
        return { statusCode: action, statusMsg: "Not running", startBtn: true, stopBtn: false, resetBtn: false };
      default:
        return state;
    }
  };

  // Simulation Status reducer
  const [status, statusDispatch] = useReducer(statusReducer, {
    statusCode: "notRunning",
    statusMsg: "Not running",
    startBtn: true,
    stopBtn: false,
    resetBtn: false,
  });

  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12}>
          <SimulationForm formState={form} setForm={setForm} statusState={status} statusDispatch={statusDispatch} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={7}>
          <SimulationAttributes attributes={attributes} status={status} />
        </Grid>

        <Grid item xs={2}>
          <EventsRecieved eventsReceived={attributes.eventsReceived} totalEvents={attributes.totalEvents} />
        </Grid>

        <Grid item xs={3}>
          <Stopwatch status={status} />
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={12}>
          <EventTable tableBody={table} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

const generateRow = (idx, bundle, timestamp, elapsed, status, total_events) => {
  const row = {
    eventNo: `${idx}/${total_events}`,
    resource: {
      type: bundle.entry[0].resource.resourceType,
      id: bundle.entry[0].resource.id,
    },
    refCount: bundle.entry.length - 1,
    references: [],
    timestamp: timestamp,
    elapsed: elapsed,
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
