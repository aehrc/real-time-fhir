import React from "react";
import { AppBar, Box, Button, Container, Link, Toolbar, Typography } from "@mui/material";

const pages = ["Simulator", "Resources"];

const NavBar = () => {
  const currentPath = window.location.pathname.substring(1);
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography variant="h6" noWrap component="div" sx={{ mr: 2.5 }}>
            <Link href="/" sx={{ textDecoration: "none" }} style={{ color: "white" }}>
              Real-Time-FHIR
            </Link>
          </Typography>

          <Box sx={{ flexGrow: 1 }}>
            {pages.map((page, index) => (
              <NavButton key={index} page={page.toLowerCase()} color={"white"} />
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

const NavButton = (props) => (
  <Link href={props.page.toLowerCase()} underline="none">
    <Button sx={{ color: props.color }}>{props.page}</Button>
  </Link>
);

export default NavBar;
