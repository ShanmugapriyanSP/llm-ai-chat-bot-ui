import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
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
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import apiClient from "./ApiClient";

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
      maxWidth: "60%",
      margin: "0 auto",
      justifyContent: role === "user" ? "flex-end" : "flex-start",
    }}
  >
    {role === "user" && <Avatar sx={{ bgcolor: "#bb86fc" }} />}
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
        <ReactMarkdown>{content}</ReactMarkdown>
      </Typography>
    </Box>
    {role === "assistant" && <Avatar sx={{ bgcolor: "#03dac6" }} />}
  </Stack>
);

const ChatHistory = ({ history, onSelect }) => (
  <Box
    sx={{
      width: "20%",
      height: "100vh",
      backgroundColor: "#1e1e1e",
      overflowY: "auto",
      padding: "10px",
    }}
  >
    <Typography variant="h6" color="text.primary" sx={{ marginBottom: 2 }}>
      Chat History
    </Typography>
    <List>
      {history.map((session, index) => (
        <ListItem key={index} disablePadding>
          <ListItemButton onClick={() => onSelect(index)}>
            <ListItemText
              primary={`Session ${index + 1}`}
              secondary={session.summary || "No summary available"}
              sx={{ color: "#fff" }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Box>
);

const App = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getToken = () => localStorage.getItem("token");
  const getChatId = () => localStorage.getItem("chatId");

  useEffect(() => {
    const token = getToken();
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

    apiClient.createNewChat(token).then((response) => {
      const chatId = response?.data?.id;
      localStorage.setItem("chatId", chatId);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function chatCompletion(payload) {
    const token = getToken(); // Retrieve the token

    const response = await fetch(
      "http://localhost:8080/v1/api/chat/completion",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the Bearer token in the Authorization header
        },
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
      content:
        payload.chatCompletionRequest.messages[
          payload.chatCompletionRequest.messages.length - 1
        ].content,
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
      chatId: getChatId(),
      chatCompletionRequest: {
        model: selectedModel.value,
        messages: [
          { role: "system", content: "Always answer in rhymes." },
          ...messages,
          userMessage,
        ],
        temperature: 0.7,
        maxTokens: -1,
        stream: true,
      },
    };

    chatCompletion(payload)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const saveChatToHistory = () => {
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { summary: messages[0]?.content || "New Chat", messages },
    ]);
    setMessages([]);
  };

  const handleHistorySelect = (index) => {
    setMessages(chatHistory[index].messages);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Stack direction="row" sx={{ height: "100vh", width: "100vw" }}>
        <ChatHistory history={chatHistory} onSelect={handleHistorySelect} />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            overflow: "hidden",
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
            <div ref={messagesEndRef} />
          </Stack>
          <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
            <TextField
              fullWidth
              variant="filled"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              multiline
              rows={1}
              sx={{ backgroundColor: "#1e1e1e", borderRadius: "20px" }}
            />
            <Box
              sx={{
                marginLeft: 1,
                backgroundColor: "#03dac6",
                borderRadius: "50%",
                padding: "10px",
                cursor: "pointer",
              }}
              onClick={handleSend}
            >
              <Typography color="#fff" variant="body1">
                ➤
              </Typography>
            </Box>
          </Box>
        </Box>
      </Stack>
    </ThemeProvider>
  );
};

export default App;
