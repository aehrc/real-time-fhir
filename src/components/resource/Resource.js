import React, { useState } from "react";
import { Grid } from "@mui/material";
import ResourceForm from "./ResourceForm";
import ResourceTable from "./ResourceTable";

function Resource() {
  const [resourceUrl, setResourceUrl] = useState({ resourceType: "DiagnosticReport", urlParams: "" });
  const [fetchButton, setFetchButton] = useState({ text: "Fetch resource", disabled: false });
  const [table, setTable] = useState({
    title: "none",
    url: "",
    headers: [],
    body: [],
    error: "",
  });

  const initialRender = table.title === "none";
  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12}>
          <ResourceForm
            resourceUrlState={resourceUrl}
            setResourceUrl={setResourceUrl}
            fetchButton={fetchButton}
            setFetchButton={setFetchButton}
            setTable={setTable}
          />
        </Grid>
      </Grid>

      {initialRender ? (
        <React.Fragment />
      ) : (
        <Grid container>
          <Grid item xs={12}>
            <ResourceTable tableState={table} setFetchButton={setFetchButton} />
          </Grid>
        </Grid>
      )}
    </React.Fragment>
  );
}

export default Resource;
