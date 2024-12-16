import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // For rendering markdown
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
  Avatar,
  Divider,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    primary: {
      main: "#bb86fc",
    },
    secondary: {
      main: "#03dac6",
    },
  },
});

const Message = ({ role, content }) => (
  <Stack
    direction="row"
    spacing={2}
    alignItems="flex-start"
    sx={{
      marginBottom: 2,
      maxWidth: "60%", // Limit the width of the messages
      margin: "0 auto", // Centering the messages container
      justifyContent: role === "user" ? "flex-end" : "flex-start", // Align user messages to the right and bot to the left
    }}
  >
    {role === "user" && <Avatar sx={{ bgcolor: "#bb86fc" }} />}{" "}
    {/* User Avatar */}
    <Box
      sx={{
        backgroundColor: role === "user" ? "#bb86fc" : "#03dac6",
        color: "#fff",
        borderRadius: "15px",
        padding: "12px",
        boxShadow: 2,
        wordBreak: "break-word",
        maxWidth: "100%",
      }}
    >
      <Typography variant="body1" sx={{ fontSize: "14px" }}>
        {/* Render Markdown content */}
        <ReactMarkdown>{content}</ReactMarkdown>
      </Typography>
    </Box>
    {role === "assistant" && <Avatar sx={{ bgcolor: "#03dac6" }} />}{" "}
    {/* Bot Avatar */}
  </Stack>
);

const App = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null); // Reference to scroll to the bottom

  useEffect(() => {
    axios
      .get("http://localhost:8080/v1/api/chat/models")
      .then((response) => {
        const modelsData = response?.data?.data || [];
        const modelOptions = modelsData.map((model) => ({
          value: model.id,
          label: model.id,
        }));
        setModels(modelOptions);
      })
      .catch((error) => {
        console.error("Error fetching models:", error);
        setModels([]); // Fallback in case of error
      });
  }, []);

  useEffect(() => {
    // Scroll to the bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function chatCompletion(payload) {
    const response = await fetch(
      "http://localhost:8080/v1/api/chat/completion",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.body) {
      throw new Error("ReadableStream not supported or no response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let ongoingContent = "";

    const userMessage = {
      role: "user",
      content: payload.messages[payload.messages.length - 1].content,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    while (!done) {
      try {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        const chatResponse = JSON.parse(chunk.slice(5)); // Adjust slicing as per API format
        ongoingContent += chatResponse.choices[0]?.delta?.content || "";

        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { role: "assistant", content: ongoingContent },
        ]);
      } catch (err) {
        console.error("Error reading chat response:", err);
        done = true; // End the loop on error
      }
    }
  }

  const handleSend = () => {
    if (!input.trim() || !selectedModel) return;

    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    const payload = {
      model: selectedModel.value,
      messages: [
        { role: "system", content: "Always answer in rhymes." },
        ...messages,
        userMessage,
      ],
      temperature: 0.7,
      max_tokens: -1,
      stream: true,
    };

    chatCompletion(payload)
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          backgroundColor: "#121212",
          overflowY: "hidden",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ fontWeight: "bold" }}
            >
              Chat AI
            </Typography>
            <FormControl variant="filled" sx={{ minWidth: 120 }}>
              <InputLabel>Model</InputLabel>
              <Select
                value={selectedModel?.value || ""}
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
          </Stack>
          <Divider />
          <Stack
            direction="column"
            spacing={2}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              paddingY: 2,
              maxWidth: "60%", // Reduced width to 60%
              margin: "0 auto", // Centering the messages container
              height: "calc(100vh - 200px)", // Set height for scrollable area
              overflowY: "auto", // Make it scrollable
            }}
          >
            {messages.map((msg, index) => (
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
            <div ref={messagesEndRef} /> {/* Scroll to the bottom */}
          </Stack>
          <TextField
            label="Type a message"
            variant="filled"
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              borderRadius: "20px",
              marginTop: "auto",
              backgroundColor: "#1e1e1e",
              "& .MuiFilledInput-root": {
                backgroundColor: "#1e1e1e",
              },
              maxWidth: "60%", // Reduced input box width to 60%
              margin: "0 auto", // Centering the input box
            }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
