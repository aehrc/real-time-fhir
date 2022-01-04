import React from "react";
import { AppBar, Box, Button, Container, Link, Toolbar, Typography } from "@mui/material";
import "./NavBar.styles.css";

const pages = ["Simulator", "Resources"];

const NavBar = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography variant="h6" noWrap component="div" sx={{ mr: 2.5 }}>
            <Link className="nav-title" href="/simulator" sx={{ textDecoration: "none" }} style={{ color: 'white' }}>
              Real-Time-FHIR
            </Link>
          </Typography>

          <Box sx={{ flexGrow: 1 }}>
            {pages.map((page) => (
              <Link href={page.toLowerCase()} underline="none" key={page}>
                <Button sx={{ color: "white" }}>{page}</Button>
              </Link>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default NavBar;
