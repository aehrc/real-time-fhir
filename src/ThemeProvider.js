/*
 * Copyright © 2022, Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
 * Software Licence Agreement.
 */

import React, { createContext } from "react";
import { createTheme, CssBaseline } from "@mui/material";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import getThemeOptions from "./Theme";

export const ColorModeContext = createContext("light");

export default function ThemeProvider(props) {
  const { mode, children } = props,
    theme = React.useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={mode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}
