/*
 * Copyright © 2022, Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
 * Software Licence Agreement.
 */

const simulationStatusReducer = (state, action) => {
  switch (action) {
    case "notRunning":
      return { statusCode: action, statusMsg: "Not running", startBtn: true, stopBtn: false, resetBtn: false };
    case "startSimulation":
      return { statusCode: action, statusMsg: "Generating events", startBtn: false, stopBtn: false, resetBtn: false };
    case "sendEvents":
      return { statusCode: action, statusMsg: "Sending events", startBtn: false, stopBtn: true, resetBtn: false };
    case "stopSimulation":
      return { statusCode: action, statusMsg: "Stopping", startBtn: false, stopBtn: false, resetBtn: false };
    case "simulationStopped":
      return { statusCode: action, statusMsg: "Ended early", startBtn: true, stopBtn: false, resetBtn: true };
    case "simulationComplete":
      return { statusCode: action, statusMsg: "Completed", startBtn: true, stopBtn: false, resetBtn: true };
    case "resetSimulation":
      return { statusCode: action, statusMsg: "Not running", startBtn: true, stopBtn: false, resetBtn: false };
    default:
      return state;
  }
};

export default simulationStatusReducer;
