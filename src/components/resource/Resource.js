import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import ResourceForm from "./ResourceForm";
import ResourceTable from "./ResourceTable";

function Resource() {
  const [resourceUrl, setResourceUrl] = useState({ resourceType: "DiagnosticReport", urlParams: "" });
  const [table, setTable] = useState({
    url: "",
    headers: [],
    body: [],
    errorMsg: "",
  });

  return (
    <React.Fragment>
      <Grid container>
        <Grid item xs={12}>
          <ResourceForm
            resourceUrlState={resourceUrl}
            setResourceUrl={setResourceUrl}
            tableState={table}
            setTable={setTable}
          />
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={12}>
          <ResourceTable tableState={table} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default Resource;
