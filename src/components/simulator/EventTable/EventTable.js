import React from "react";
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper } from "@mui/material";
import { StyledTableRow, RegularCard } from "../../ComponentStyles";

const tableHeaders = ["No.", "Resource", "Refs.", "References", "Timestamp", "Est. start(s)", "Actual start(s)", "Completed(s)"];

const EventTable = (props) => (
  <RegularCard sx={{ my: 2.5 }}>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {tableHeaders.map((cell, index) => (
              <TableCell key={index} sx={{fontSize: 12}}>{cell}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{props.tableBody.length ? outputTableBody(props.tableBody) : <React.Fragment />}</TableBody>
      </Table>
    </TableContainer>
  </RegularCard>
);

function outputTableBody(props) {
  const outRow = props.map((row, rowIndex) => (
    <StyledTableRow key={rowIndex}>
      <TableCell>{row.eventNo}</TableCell>
      <TableCell>{`${row.resource.type} ${row.resource.id}`}</TableCell>
      <TableCell>{row.refCount}</TableCell>
      <TableCell>
        {row.references.map((reference, refIndex) => (
          <div key={refIndex}>{`${reference.type} ${reference.id}`}</div>
        ))}
      </TableCell>
      <TableCell>{row.timestamp}</TableCell>
      <TableCell>{row.estimated.toFixed(2)}</TableCell>
      <TableCell>{row.start_elapsed.toFixed(2)}</TableCell>
      <TableCell>{row.completion_elapsed.toFixed(2)}</TableCell>
    </StyledTableRow>
  ));

  return <React.Fragment>{outRow}</React.Fragment>;
}

export default React.memo(EventTable);
