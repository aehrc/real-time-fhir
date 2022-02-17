import React, {useEffect} from "react";
import { CardContent, Typography, Grid, Button, TextField, FormControl, Autocomplete } from "@mui/material";
import { CloudDownload } from "@mui/icons-material";
import { RegularCard } from "../ComponentStyles";
import resourceList from "../assets/resources-synthea.json";
import { socket } from "../../App";

function ResourceForm(props) {
  const { resourceUrlState, setResourceUrl, fetchButton, setFetchButton, setTable } = props;

  useEffect(() => {
    socket.on("recieveResource", (data) => {
      setTable(data)
    });
  }, []);

  const fetchResource = () => {
    setTable({ url: "", headers: [], body: [], error: "", title: "" });
    setFetchButton({ text: "Fetching...", disabled: true });
    
    socket.emit("fetch_resource", `${resourceUrlState.resourceType}${resourceUrlState.urlParams}`);
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
          <Grid item xs={12}>
            <Button
              variant="contained"
              sx={{ width: 180 }}
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
