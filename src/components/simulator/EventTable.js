import React, { useContext } from "react";
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import "../componentStyles.css";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));
const tableHeaders = ["Event no.", "Resource", "Ref. count", "References", "Elapsed timestamp", "Status"];
const EventTable = (props) => (
  <div className="table-div">
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
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
  </div>
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
      <TableCell>{row.status}</TableCell>
    </StyledTableRow>
  ));
  return <React.Fragment>{outRow}</React.Fragment>;
}

export default React.memo(EventTable);
