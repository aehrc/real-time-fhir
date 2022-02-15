import React, { useState, useEffect, useRef } from "react";
import { Typography, Stack, Box, Snackbar, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import Switch from "@mui/material/Switch";
import { socket } from "../../../App";

const defaultEndpoint = {
  name: "AEHRC CDR",
  url: "***REMOVED***/fhir_r4/",
  message: "",
};

function SimFormEndpointSwitcher(props) {
  const [endpoint, setEndpoint] = useState(defaultEndpoint);
  const endpointRef = useRef(defaultEndpoint);
  endpointRef.current = endpoint;

  const [openNotification, setOpenNotification] = useState(false);

  useEffect(() => {
    socket.on("endpointStatus", (data) => {
      setOpenNotification(true);
      let message = data.status ? `Connection to ${data.url} successful.` : `Connection to ${data.url} failed.`;
      setEndpoint({ ...endpointRef.current, message: message });
    });
  }, []);

  const handleSwitchChange = (event) => {
    handleCloseNotification();
    let endpoint = event.target.checked
      ? { name: "Pathling", url: "http://localhost:8080/fhir/", message: endpointRef.current.message }
      : { ...defaultEndpoint, message: endpointRef.current.message };

    setEndpoint(endpoint);
    socket.emit("change_endpoint", endpoint.url);
  };

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
      <Stack direction="row" alignItems="center">
        <Switch onChange={handleSwitchChange} disabled={!props.statusState.startBtn} />
        <Box sx={{ width: 85, textAlign: "center" }}>
          <Typography sx={{ fontSize: 15 }} color="text.secondary">{endpoint.name}</Typography>
        </Box>
      </Stack>
      <Snackbar
        open={openNotification}
        autoHideDuration={4500}
        onClose={handleCloseNotification}
        message={endpointRef.current.message}
        action={notification}
      />
    </React.Fragment>
  );
}

export default React.memo(SimFormEndpointSwitcher);
