/*
 * Copyright © 2022, Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
 * Software Licence Agreement.
 */

import React, { useState, useEffect } from "react";
import { Snackbar, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { socket } from "../../App";

function EndpointValidator() {
  const [message, setMessage] = useState("");
  const [openNotification, setOpenNotification] = useState(false);

  useEffect(() => {
    socket.emit("verify_endpoint");
    socket.on("endpointStatus", (data) => {
      let msg = data.status ? `Connection to ${data.url} successful.` : `Connection to ${data.url} failed.`;
      setMessage(msg);
      console.log(message)
      setOpenNotification(true);
    });
  }, []);

  const handleCloseNotification = (e, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenNotification(false);
  };

  const notification = (
    <React.Fragment>
      <IconButton size="small" color="inherit" onClick={handleCloseNotification}>
        <Close fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <Snackbar
        open={openNotification}
        autoHideDuration={4500}
        onClose={handleCloseNotification}
        message={message}
        action={notification}
      />
    </React.Fragment>
  );
}

export default React.memo(EndpointValidator);
