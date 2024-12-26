import React, { useState } from "react";
import { Stack } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import apiClient from "../api/ApiClient";
import ChatHistory from "./ChatHistory";
import ChatContainer from "./ChatContainer";

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

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // New state for sidebar visibility

  const getToken = () => localStorage.getItem("token");
  const getChatId = () => localStorage.getItem("chatId");

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

  const handleSend = (selectedModel, input, setInput, systemPrompt) => {
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
          { role: "system", content: systemPrompt },
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

  const handleHistorySelect = (selectedSession) => {
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

  return (
    <ThemeProvider theme={darkTheme}>
      <Stack direction="row" sx={{ height: "100vh", width: "100vw" }}>
        <ChatHistory
          handleHistorySelect={handleHistorySelect}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        ></ChatHistory>
        <ChatContainer
          messages={messages}
          loading={loading}
          handleSend={handleSend}
          isSidebarOpen={isSidebarOpen}
        ></ChatContainer>
      </Stack>
    </ThemeProvider>
  );
};

export default Chat;
