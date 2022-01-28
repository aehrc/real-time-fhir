import React, { useState, useEffect, useRef, useReducer } from "react";
import { Grid } from "@mui/material";
import { socket } from "../../App";
import SimulationForm from "./SimForm/SimForm";
import SimulationAttributes from "./SimAttributes/SimAttributes";
import EventTable from "./EventTable/EventTable";

import simulationStatusReducer from "./SimStatusReducer";
import generateTableRow from "./EventTable/GenerateTableRow";

const defaultAttributes = {
  resourceType: "Not Specified",
  duration: "0",
  totalEvents: "0",
  eventsSent: "0",
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

  // Simulation Status reducer
  const [status, statusDispatch] = useReducer(simulationStatusReducer, {
    statusCode: "notRunning",
    statusMsg: "Not running",
    startBtn: true,
    stopBtn: false,
    resetBtn: false,
  });

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
        eventsSent: idx,
      });

      const tableRow = generateTableRow(idx, bundle, timestamp, elapsed, status, attributesRef.current.totalEvents);
      let tempTable = [tableRow, ...tableRef.current];
      if (tempTable.length > 30) {
        tempTable.pop();
      }
      setTable(tempTable);
    });

    socket.on("simulationEnd", (data) => {
      if (attributesRef.current.eventsSent === attributesRef.current.totalEvents) {
        statusDispatch("simulationComplete");
      } else {
        statusDispatch("simulationStopped");
      }
      setAttributes({
        ...attributesRef.current,
        finalEventCount: `${attributesRef.current.eventsSent}/${attributesRef.current.totalEvents}`,
      });
    });

    return () => socket.disconnect();
  }, []);

  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12}>
          <SimulationForm
            formState={form}
            setForm={setForm}
            defaultAttributes={defaultAttributes}
            setAttributes={setAttributes}
            setTable={setTable}
            statusState={status}
            statusDispatch={statusDispatch}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <SimulationAttributes attributes={attributes} status={status} />
      </Grid>

      <Grid container>
        <Grid item xs={12}>
          <EventTable tableBody={table} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default Simulation;
