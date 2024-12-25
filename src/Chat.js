import React, { useState, useEffect, useRef } from "react";
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
  IconButton,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import apiClient from "./ApiClient";
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";

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

const Message = ({ role, content }) => {
  const isUser = role === "user";
  const backgroundColor = "#323232";
  const borderRadius = "20px";
  const boxShadow = 0;
  const textAlign = isUser ? "left" : "left";
  const maxWidth = isUser ? "80%" : "60%"; // Adjust maxWidth for assistant messages

  return (
    <Stack
      direction="row"
      spacing={0}
      alignItems="flex-start"
      sx={{
        marginBottom: 2,
        maxWidth: "100%", // Ensure the message width adjusts dynamically
        justifyContent: isUser ? "flex-end" : "justify", // Align user messages right and assistant messages center
      }}
    >
      {!isUser && (
        <Avatar
          sx={{ width: 50, height: 50, marginRight: 1 }}
          src="/avatar-bot.jpg"
        />
      )}
      <Box
        sx={{
          backgroundColor,
          color: "#fff",
          borderRadius,
          padding: "0px 12px 0px 12px", // Adjust padding to reduce space around text
          boxShadow,
          wordBreak: "break-word",
          maxWidth, // Set dynamic maxWidth based on the role
          display: "inline-block", // Ensure the box stays inline
          textAlign, // Center-align assistant's message and left-align user message
        }}
      >
        <Typography variant="body2" sx={{ fontSize: "16px" }}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Typography>
      </Box>
      {isUser && (
        <Avatar
          sx={{ width: 50, height: 50, marginLeft: 1 }}
          src="/avatar-user.jpg"
        />
      )}
    </Stack>
  );
};

const App = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // New state for sidebar visibility
  const messagesEndRef = useRef(null);

  const getToken = () => localStorage.getItem("token");
  const getChatId = () => localStorage.getItem("chatId");

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

    // Fetch chat history and set the chatHistory state
    apiClient
      .getChatHistory(token)
      .then((response) => {
        const historyData = response?.data || [];
        setChatHistory(historyData); // Set chat history here
      })
      .catch(() => setChatHistory([]));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function chatCompletion(payload) {
    const token = getToken(); // Retrieve the token

    const response = await apiClient.chatCompletion(payload, token);

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
    console.log("Messages - ", messages);
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

  const handleHistorySelect = (index) => {
    // Populate the messages for the selected session
    const selectedSession = chatHistory[index];
    const messageList = [];
    if (selectedSession && selectedSession.messages) {
      selectedSession.messages.forEach((item, index) => {
        messageList.push({
          content: item.content,
          role: item.type.toLowerCase(),
        });
      });
      setMessages(messageList);
      localStorage.setItem("chatId", selectedSession.id);
    } else {
      setMessages([]); // In case there are no messages in the session
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Stack direction="row" sx={{ height: "100vh", width: "100vw" }}>
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
        {isSidebarOpen && (
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
                  <ListItemButton onClick={() => handleHistorySelect(index)}>
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
        )}
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
                    label="Model"
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
              <Stack direction="column" spacing={2}>
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
                  placeholder="Message Chat AI"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  multiline
                  rows={2}
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
          </Box>
        </Box>
      </Stack>
    </ThemeProvider>
  );
};

export default App;
