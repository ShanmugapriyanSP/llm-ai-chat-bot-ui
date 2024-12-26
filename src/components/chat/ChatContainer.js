import React, { useState, useEffect, useRef } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import apiClient from "../api/ApiClient";
import Message from "./Message";
import SystemPrompt from "./SystemPrompt";

const ChatContainer = ({ messages, loading, handleSend, isSidebarOpen }) => {
  const getToken = () => localStorage.getItem("token");
  const [selectedModel, setSelectedModel] = useState(null);
  const [models, setModels] = useState([]);
  const [input, setInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("Always answer in rhymes.");
  const [localMessages, setLocalMessages] = useState([]);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    // Fetch models
    apiClient
      .getModels(token)
      .then((response) => {
        const modelsData = response?.data?.data || [];
        const modelOptions = modelsData.map((model) => ({
          value: model.id,
          label: model.id,
        }));
        setModels(modelOptions);
      })
      .catch(() => setModels([]));

    // Create a new chat
    apiClient.createNewChat(token).then((response) => {
      const chatId = response?.data?.id;
      localStorage.setItem("chatId", chatId);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(selectedModel, input, setInput, systemPrompt);
    }
  };

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden", // Prevents outer container from overflowing
        }}
      >
        {/* Scrollable container */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto", // Scrollbar is now on this container
            paddingBottom: "80px", // Prevents overlap with the fixed text field
            "&::-webkit-scrollbar": {
              width: "8px", // Set width of the scrollbar
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#2c2c2c", // Dark background for the track
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#555", // Lighter color for the thumb
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#888", // Hover effect for the thumb
            },
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              paddingTop: "20px",
              paddingLeft: "calc(1vw)", // Responsive padding
              paddingRight: "calc(1vw)", // Responsive padding
              marginLeft: "20px",
              width: "100%",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ paddingBottom: "20px" }}
            >
              <Typography
                variant="h6"
                color="text.primary"
                sx={{ fontWeight: "bold" }}
              >
                Chat AI
              </Typography>

              {/* <Box sx={{ marginLeft: "20px" }}> */}

              {/* </Box> */}
              <Box
                sx={{
                  position: "absolute",
                  right: "40px",
                  paddingRight: "20px",
                }}
              >
                <SystemPrompt
                  systemPrompt={systemPrompt}
                  setSystemPrompt={setSystemPrompt}
                />
                <Box sx={{ position: "absolute", right: "20px" }}>
                  <FormControl
                    variant="filled"
                    sx={{
                      minWidth: 120,
                      paddingTop: "20px",
                      marginBottom: "40px",
                    }}
                  >
                    <InputLabel>Model</InputLabel>
                    <Select
                      label="Model"
                      value={selectedModel?.value || ""}
                      variant="outlined"
                      onChange={(e) =>
                        setSelectedModel(
                          models.find((model) => model.value === e.target.value)
                        )
                      }
                    >
                      {models.length > 0 ? (
                        models.map((model) => (
                          <MenuItem key={model.value} value={model.value}>
                            {model.label}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No models available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* </Box> */}

          {/* Inner Box with padding */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              paddingTop: "20px",
              paddingBottom: "20px",
              paddingLeft: "calc(20vw)", // Responsive padding
              paddingRight: "calc(20vw)", // Responsive padding
              width: "100%",
            }}
          >
            <Stack direction="column" spacing={2}>
              {localMessages.map((msg, index) => (
                <Message key={index} role={msg.role} content={msg.content} />
              ))}
              {loading && (
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                >
                  <CircularProgress size={20} color="secondary" />
                  <Typography variant="body2" color="text.secondary">
                    Assistant is typing...
                  </Typography>
                </Stack>
              )}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>
          {/* Fixed TextField at the bottom */}

          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: isSidebarOpen ? "300px" : "0", // Adjust left offset based on sidebar visibility
              width: isSidebarOpen ? "calc(100% - 300px)" : "100%", // Adjust width based on sidebar visibility
              display: "flex",
              alignItems: "center",
              paddingTop: "20px",
              paddingBottom: "20px",
              paddingLeft: "calc(20vw)", // Responsive padding
              paddingRight: "calc(20vw)", // Responsive padding
              backgroundColor: "#121212", // Optional: Background color for the input area
              transition: "left 0.3s, width 0.3s", // Smooth transition for sidebar toggle
            }}
          >
            <TextField
              fullWidth
              placeholder="Message Chat AI"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              multiline
              rows={2}
              sx={{
                backgroundColor: "#2c2c2c",
                borderRadius: "20px",
                color: "#fff",
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ChatContainer;
