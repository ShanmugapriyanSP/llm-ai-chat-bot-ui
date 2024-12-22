import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Stack, Paper } from "@mui/material";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (email && password) {
      // Create Basic Auth header value
      const credentials = `${email}:${password}`;
      const base64Credentials = btoa(credentials); // Convert to Base64

      try {
        // Send GET request with Basic Auth
        const response = await fetch(
          "http://localhost:8080/api/v1/auth/authenticate",
          {
            method: "GET",
            headers: {
              Authorization: `Basic ${base64Credentials}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          console.log("Signed in successfully");
          const data = await response.json(); // Assuming response is JSON
          // You can store JWT or other tokens from the response if needed
          localStorage.setItem("token", data.token); // Example: Save token to localStorage
          navigate("/chat"); // Redirect to Chat Page
        } else {
          alert("Invalid credentials, please try again.");
        }
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
