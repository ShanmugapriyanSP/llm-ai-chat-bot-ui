import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "./App.css";

const App = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the list of models
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

  const handleSend = () => {
    if (!input.trim() || !selectedModel) return;

    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    setLoading(true);

    // Construct the payload
    const payload = {
      model: selectedModel.value,
      messages: [
        { role: "system", content: "Always answer in rhymes." },
        ...messages, // Include previous messages in the conversation
        userMessage, // Add the latest user message
      ],
      temperature: 0.7,
      max_tokens: -1,
      stream: true,
    };

    axios
      .post("http://localhost:8080/v1/api/chat/completion", payload)
      .then((response) => {
        const assistantMessage = {
          role: "assistant",
          content: response.data.choices[0].message.content,
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h1>Chat Interface</h1>
        <Select
          options={models}
          onChange={setSelectedModel}
          placeholder="Select a Model"
          className="model-dropdown"
        />
      </div>
      <div className="chat-box">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.role === "user" ? "user" : "assistant"
            }`}
          >
            <p>{message.content}</p>
          </div>
        ))}
        {loading && <div className="loading">Typing...</div>}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={loading || !selectedModel}>
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
