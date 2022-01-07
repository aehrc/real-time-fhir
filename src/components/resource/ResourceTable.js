import React from "react";
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
} from "@mui/material";
import { StyledTableRow, RegularCard } from "./ResourceStyles";

function ResourceTable(props) {
  const { tableState } = props;
  console.log(tableState.body.length);
  console.log(tableState.headers.length);
  return (
    <RegularCard>
      <CardContent>
        <Grid container>
          {tableState.body.length ? <RenderTable tableState={tableState} />:<RenderMessage message={tableState.errorMsg} />}
        </Grid>
      </CardContent>
    </RegularCard>
  );
}

const RenderTable = (props) => {
  console.log(props);
  const { url, headers, body, errorMsg } = props.tableState;
  return (
    <React.Fragment>
      <Grid item xs={6}>
        <Typography sx={{ fontSize: 12 }} color="text.secondary">
          Data obtained from: {url}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography sx={{ fontSize: 12 }} align="right" color="text.secondary">
          Last updated: {new Date().toTimeString()}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((cell, index) => (
                  <TableCell key={index}>{cell}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {body.map((row, rowIndex) => (
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

const RenderMessage = (props) => {
  if (props.message === "") {
    return (
      <Grid item xs={12}>
        <Typography sx={{ fontSize: 16 }} align="center" color="text.secondary">
          Loading table...
        </Typography>
      </Grid>
    );
  } else {
    return (
      <Grid item xs={12}>
        <Typography sx={{ fontSize: 12 }} color="text.secondary">
          {props.message}
        </Typography>
      </Grid>
    );
  }
};

export default React.memo(ResourceTable);
