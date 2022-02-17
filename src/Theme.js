import { grey, lightBlue, pink } from "@mui/material/colors";

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
          error: {
            main: "#B00020",
          }
        }
      : {
          // Dark mode
          background: {
            default: "#121212",
          },
          primary: {
            main: "rgb(102,186,201)",
          },
          secondary: {
            main: pink["300"],
          },
          error: {
            main: "#CF6679",
          }
        }),
  },
});

export default getThemeOptions;
