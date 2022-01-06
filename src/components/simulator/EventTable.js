import React from "react";
import { Grid, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import "../componentStyles.css";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const tableHeaders = ["No.", "Resource", "Refs.", "References", "Timestamp", "Elapsed", "Status"];
const EventTable = (props) => (
      <TableContainer component={Paper} sx={{ my: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {tableHeaders.map((cell, index) => (
                <TableCell key={index}>{cell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{props.tableBody.length ? outputTableBody(props.tableBody) : <React.Fragment />}</TableBody>
        </Table>
      </TableContainer>
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
      <TableCell>{row.elapsed.toFixed(4)}</TableCell>
      <TableCell>{row.status}</TableCell>
    </StyledTableRow>
  ));
  return <React.Fragment>{outRow}</React.Fragment>;
}

export default React.memo(EventTable);
