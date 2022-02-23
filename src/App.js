/*
 * Copyright © 2022, Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230. Licensed under the CSIRO Open Source
 * Software Licence Agreement.
 */

import "./App.css";
import { Container } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import io from "socket.io-client";
import ThemeProvider from "./ThemeProvider";
import NavBar from "./components/NavBar";
import Simulation from "./components/simulator/Simulation";
import Resource from "./components/resource/Resource";

export const socket = io.connect(`http://localhost:${process.env.REACT_APP_BACKEND_PORT}/`);

function App(props) {
  const { colorMode } = props;

  return (
    <ThemeProvider mode={colorMode}>
      <NavBar></NavBar>
      <Container maxWidth="xl">
        <BrowserRouter>
          <Routes>
            <Route path="/simulator" element={<Simulation />} />
            <Route path="/resources" element={<Resource />} />
            <Route path="*" element={<Navigate replace to="/simulator" />} />
          </Routes>
        </BrowserRouter>
      </Container>
    </ThemeProvider>
  );
}

export default App;
