import { deepOrange, green, grey, lightBlue, pink } from "@mui/material/colors";

const getThemeOptions = (mode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode
          background: {
            default: grey["100"],
          },
          primary: {
            main: lightBlue["900"],
          },
          secondary: {
            main: pink["600"],
          },
          accent1: {
            main: pink["200"],
            light: "rgb(255,193,227)",
            dark: "rgb(191,95,130)",
            contrastText: "#fff",
          },
          accent2: {
            main: deepOrange["300"],
            light: "rgb(255,187,147)",
            dark: "rgb(199,91,57)",
            contrastText: "#fff",
          },
          accent3: {
            main: green["300"],
            light: "rgb(178,250,180)",
            dark: "rgb(81,150,87)",
            contrastText: "#fff",
          },
        }
      : {
          // Dark mode
          primary: {
            main: "rgb(102,186,201)",
          },
          secondary: {
            main: pink["300"],
          },
          accent1: {
            main: pink["200"],
            light: "rgb(255,193,227)",
            dark: "rgb(191,95,130)",
            contrastText: "#fff",
          },
          accent2: {
            main: deepOrange["300"],
            light: "rgb(255,187,147)",
            dark: "rgb(199,91,57)",
            contrastText: "#fff",
          },
          accent3: {
            main: green["300"],
            light: "rgb(178,250,180)",
            dark: "rgb(81,150,87)",
            contrastText: "#fff",
          },
        }),
  },
});

export default getThemeOptions;