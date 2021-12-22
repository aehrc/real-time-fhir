import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import logo from './assets/fhir-logo.png'

function NavBar() {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/" className="nav-brand"><img src={logo} alt="" className='fhir-logo' />Real-Time-FHIR</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/simulation">Simulator</Nav.Link>
            <Nav.Link href="/resource">Resource</Nav.Link>
          </Nav>
          <Outlet />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
