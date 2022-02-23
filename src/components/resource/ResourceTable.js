/*
 * Copyright © 2022, Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
 * Software Licence Agreement.
 */

import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import { StyledTableRow, RegularCard } from "../ComponentStyles";

const ResourceTable = (props) => {
  const { tableState, setFetchButton } = props;
  const isError = props.tableState.error !== "";
  return (
    <RegularCard>
      <CardContent>
        <Grid container>
          {props.tableState.body.length ? (
            <Grid container>
              <RenderTable tableState={tableState} setFetchButton={setFetchButton} />
            </Grid>
          ) : (
            <Grid container sx={{ my: 3 }}>
              {isError ? <RenderError tableState={tableState} setFetchButton={setFetchButton} /> : <RenderLoading />}
            </Grid>
          )}
        </Grid>
      </CardContent>
    </RegularCard>
  );
};

const RenderTable = (props) => {
  const { tableState, setFetchButton } = props;

  useEffect(() => {
    setFetchButton({ text: "Fetch resource", disabled: false });
  });

  return (
    <React.Fragment>
      <Grid container sx={{ mb: 1 }}>
        <Grid item xs={6}>
          <Typography sx={{ fontSize: 13 }} color="text.secondary">
            Data obtained from: {tableState.url}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ fontSize: 13 }} align="right" color="text.secondary">
            Last updated: {new Date().toTimeString()}
          </Typography>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {tableState.headers.map((cell, index) => (
                  <TableCell key={index}>{cell}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableState.body.map((row, rowIndex) => (
                <StyledTableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </React.Fragment>
  );
};

const RenderError = (props) => {
  const { tableState, setFetchButton } = props;

  useEffect(() => {
    setFetchButton({ text: "Fetch resource", disabled: false });
  });

  return (
    <React.Fragment>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: 14 }}>
          There was an error fetching the resource. Please recheck your parameters or try again later.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: 12 }} color="text.secondary">
          {tableState.error}
        </Typography>
      </Grid>
    </React.Fragment>
  );
};

const RenderLoading = () => (
  <React.Fragment>
    <Grid item xs={12}>
      <Typography sx={{ fontSize: 16 }} align="center">
        Loading table...sit tight!
      </Typography>
    </Grid>
    <Grid item xs={12} container justifyContent="center">
      <CircularProgress />
    </Grid>
  </React.Fragment>
);

export default React.memo(ResourceTable);
