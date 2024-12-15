import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  TextField,
} from "@mui/material";
import "./App.css";

const App = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/v1/api/chat/models")
      .then((response) => {
        const modelOptions = response.data.data.map((model) => ({
          value: model.id,
          label: model.id,
        }));
        setModels(modelOptions);
      })
      .catch((error) => {
        console.error("Error fetching models:", error);
      });
  }, []);

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
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });
      const chatResponse = JSON.parse(chunk.slice(5));

      ongoingContent += chatResponse.choices[0].delta.content;

      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { role: "assistant", content: ongoingContent },
      ]);
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

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.role === "user" ? "user-message" : "assistant-message"
            }`}
          >
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="loading">
            <CircularProgress color="inherit" size={24} /> Assistant is
            typing...
          </div>
        )}
      </div>

      <div className="input-area">
        <FormControl variant="filled" className="select-model">
          <InputLabel>Model</InputLabel>
          <Select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            label="Model"
          >
            {models.map((model) => (
              <MenuItem key={model.value} value={model}>
                {model.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Type a message"
          variant="filled"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="message-input"
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={loading}
          className="send-button"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default App;
