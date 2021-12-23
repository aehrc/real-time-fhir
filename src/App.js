import "./App.css";
import io from "socket.io-client";
import NavBar from "./components/NavBar";
import Simulation from "./components/simulator/Simulation";
import Resource from "./components/resource/Resource";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Container from 'react-bootstrap/Container'

export const socket = io.connect("http://localhost:5000/");

function App() {
  return (
    <div>
      <NavBar></NavBar>
      <Container fluid="lg">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Resource />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/resource" element={<Resource />} />
            <Route
              path="*"
              element={
                <div>
                  <p>There's nothing here!</p>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </Container>
    </div>
  );
}

export default App;
