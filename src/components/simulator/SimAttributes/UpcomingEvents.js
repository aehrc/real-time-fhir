/*
 * Copyright © 2022, Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
 * Software Licence Agreement.
 */

import React from "react";
import { CardContent, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper } from "@mui/material";
import { CardHeadingTypography, FullHeightCard } from "../../ComponentStyles";
import { AssignmentReturn } from "@mui/icons-material";

const UpcomingEvents = (props) => (
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
          <TableBody>
            {props.upcomingEvents.length ? outputTableBody(props.upcomingEvents) : <React.Fragment />}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </FullHeightCard>
);

const outputTableBody = (props) => {
  const outRow = props.map((row, rowIndex) => (
    <TableRow key={rowIndex}>
      <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{row.id}</TableCell>
      <TableCell sx={{ fontSize: 11, color: "text.secondary" }}>{row.expectedTime.toFixed(4)}</TableCell>
    </TableRow>
  ));

  return <React.Fragment>{outRow}</React.Fragment>;
}

export default UpcomingEvents;
