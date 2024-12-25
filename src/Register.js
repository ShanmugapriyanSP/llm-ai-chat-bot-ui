import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import apiClient from "./ApiClient";

const Register = () => {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState(""); // Added firstname
  const [lastname, setLastname] = useState(""); // Added lastname
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (
      email &&
      firstname &&
      lastname &&
      password &&
      password === confirmPassword
    ) {
      const requestBody = {
        email,
        firstname,
        lastname,
        password,
      };

      try {
        // Send POST request to register the user
        const response = await apiClient.register(requestBody);
        const token = response?.data?.token;

        // Save the JWT token to local storage (or session storage)
        localStorage.setItem("token", token);

        console.log("Registered successfully");
        navigate("/signin"); // Redirect to Sign In Page
      } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred while registering.");
      }
    } else {
      alert("Please check your inputs.");
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
        Register
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="First Name"
          variant="outlined"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
        />
        <TextField
          label="Last Name"
          variant="outlined"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
        />
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
        <TextField
          label="Confirm Password"
          variant="outlined"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button variant="contained" color="secondary" onClick={handleRegister}>
          Register
        </Button>
      </Stack>
    </Paper>
  );
};

export default Register;
