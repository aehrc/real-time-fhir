
import React, { createContext } from "react";
import { createTheme, CssBaseline, PaletteMode } from "@mui/material";
import getThemeOptions from "./Theme";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

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