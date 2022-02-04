import React from 'react';
import { CardContent, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper } from "@mui/material";
import { CardHeadingTypography, FullHeightCard } from "../../ComponentStyles";
import { AssignmentReturn } from "@mui/icons-material";

function UpcomingEvents(props) {
  return (
    <FullHeightCard>
      <CardContent>
        <CardHeadingTypography>
          Upcoming Events
          <AssignmentReturn sx={{ ml: 0.5 }} />
        </CardHeadingTypography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="none" sx={{ fontSize: 11.5, paddingLeft: 2, paddingTop: 1 }}>Resource ID</TableCell>
                <TableCell padding="none" sx={{ fontSize: 11.5, paddingLeft: 2, paddingTop: 1 }}>Estimated (s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{props.upcomingEvents.length ? outputTableBody(props.upcomingEvents) : <React.Fragment />}</TableBody>
          </Table>
        </TableContainer>

      </CardContent>
    </FullHeightCard>
  );
}


function outputTableBody(props) {
  const outRow = props.map((row, rowIndex) => (
    <TableRow key={rowIndex}>
      <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{row.id}</TableCell>
      <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{row.expectedTime.toFixed(4)}</TableCell>
    </TableRow>
  ));

  return <React.Fragment>{outRow}</React.Fragment>;
}

//first  generate events send 5, then for each new event get the event offset by 5, if no more event then dont get, have a queue maintaining 5 next events, 
//every iteration remove firt and add new event to the end if has new event

export default UpcomingEvents;
