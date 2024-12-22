import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

const Home = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#121212",
      color: "#fff",
    }}
  >
    <Typography variant="h4" sx={{ mb: 4 }}>
      Welcome to Chat AI
    </Typography>
    <Button
      component={Link}
      to="/signin"
      variant="contained"
      color="primary"
      sx={{ mb: 2 }}
    >
      Sign In
    </Button>
    <Button
      component={Link}
      to="/register"
      variant="contained"
      color="secondary"
    >
      Register
    </Button>
  </Box>
);

export default Home;
