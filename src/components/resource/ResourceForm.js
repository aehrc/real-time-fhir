import React, { useState,useEffect } from "react";
import { CardContent, Typography, Grid, Button, TextField, FormControl, Autocomplete } from "@mui/material";
import { CloudDownload } from "@mui/icons-material";
import resourceList from "../assets/resources-synthea.json";
import { RegularCard } from "./ResourceStyles";

const defaultFetchButton = { text: "Fetch resource", disabled: false };

function ResourceForm(props) {
  const [fetchButton, setFetchButton] = useState(defaultFetchButton);
  const { resourceUrlState, setResourceUrl, tableState, setTable } = props;

  const fetchResource = () => {
    setTable({ url: "", headers: [], body: [], errorMsg: "" });
    //setFetchButton({ text: "Fetching...", disabled: true });
    fetch(`/resources/${resourceUrlState.resourceType}${resourceUrlState.urlParams}`)
      .then((res) => res.json())
      .then((data) => setTable(data))
      .catch((error) => setTable({ ...tableState, errorMsg: error.toString() }));
  };


  return (
    <RegularCard sx={{ my: 2.5 }}>
      <CardContent>
        <Typography variant="h5">Resources</Typography>

        <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Autocomplete
                options={resourceList.resources}
                value={resourceUrlState.resourceType}
                onChange={(e, newValue) => {
                  setResourceUrl({ ...resourceUrlState, resourceType: newValue });
                }}
                renderInput={(params) => <TextField {...params} label="Resource Type" />}
              />
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <TextField
                value={resourceUrlState.urlParams}
                onChange={(e) => {
                  setResourceUrl({ ...resourceUrlState, urlParams: e.target.value });
                }}
                label="Additional Parameters"
              />
            </FormControl>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={6}>
            <Button
              variant="contained"
              startIcon={<CloudDownload />}
              onClick={fetchResource}
              disabled={fetchButton.disabled}
            >
              {fetchButton.text}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </RegularCard>
  );
}

export default ResourceForm;
