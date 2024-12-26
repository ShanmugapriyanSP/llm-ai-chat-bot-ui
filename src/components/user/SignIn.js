import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Stack, Paper } from "@mui/material";
import apiClient from "../api/ApiClient";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (email && password) {
      try {
        const response = await apiClient.signIn(email, password);
        console.log("Signed in successfully");
        const data = response.data;
        localStorage.setItem("token", data.token);
        navigate("/chat");
      } catch (error) {
        console.error("Error signing in:", error);
        alert("An error occurred, please try again.");
      }
    } else {
      alert("Please enter email and password.");
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 400,
        margin: "auto",
        marginTop: 10,
        padding: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Sign In
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSignIn}>
          Sign In
        </Button>
      </Stack>
    </Paper>
  );
};

export default SignIn;
