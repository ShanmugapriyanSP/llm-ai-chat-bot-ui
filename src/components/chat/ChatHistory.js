import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
} from "@mui/material";
import apiClient from "../api/ApiClient";
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
import Slide from "@mui/material/Slide";

const ChatHistory = ({
  handleHistorySelect,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [chatHistory, setChatHistory] = useState([]);

  const token = localStorage.getItem("token");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
  };

  useEffect(() => {
    // Fetch chat history and set the chatHistory state
    apiClient
      .getChatHistory(token)
      .then((response) => {
        const historyData = response?.data || [];
        setChatHistory(historyData); // Set chat history here
      })
      .catch(() => setChatHistory([]));
  }, []);

  return (
    <>
      {/* Sidebar */}
      <Box>
        <IconButton
          onClick={toggleSidebar}
          sx={{
            color: "#fff",
            padding: "6px",
            "&:hover": {
              backgroundColor: "#444",
            },
          }}
        >
          <ViewSidebarOutlinedIcon />
        </IconButton>
      </Box>
      <Slide direction="right" in={isSidebarOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            width: "300px", // Set a fixed width for the sidebar
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            overflowY: "auto", // Ensure the sidebar can scroll if needed
            backgroundColor: "#323232", // Optional: Set a background color for the sidebar
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" color="text.primary">
              Chat History
            </Typography>
          </Stack>
          <List>
            {chatHistory.map((session, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => handleHistorySelect(session)}>
                  <ListItemText
                    primary={`Session ${index + 1}`}
                    secondary={session.summary || "No summary available"}
                    sx={{ color: "#fff" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {/* System Prompt TextField
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="subtitle1" color="text.primary">
              System Prompt
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter system prompt here"
              sx={{
                backgroundColor: "#2c2c2c",
                borderRadius: "10px",
                color: "#fff",
                width: "100%", // Ensure the width is controlled
              }}
            />
          </Box> */}
        </Box>
      </Slide>
    </>
  );
};

export default ChatHistory;
