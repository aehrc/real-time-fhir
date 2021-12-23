import React from "react";
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import "../componentStyles.css";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

function ResourceTable(props) {
  if (props.headers.length !== 0) {
    return (
      <React.Fragment>
        <div>
          <small className="text-muted">Data obtained from: {props.url}</small>
          <small className="text-muted float-right">Last updated: {new Date().toTimeString()}</small>
        </div>
        <div className="table-div">
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  {props.headers.map((cell, index) => (
                    <TableCell key={index}>{cell}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {props.body.map((row, rowIndex) => (
                  <StyledTableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </React.Fragment>
    );
  } else {
    if (props.errorMsg === "") {
      return <small className="text-muted">Loading table...</small>;
    } else {
      return <div>{props.errorMsg}</div>;
    }
  }
}

export default React.memo(ResourceTable);
