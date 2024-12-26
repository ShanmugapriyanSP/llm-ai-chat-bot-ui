import { Box, Typography, Stack, Avatar, IconButton } from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ReactMarkdown from "react-markdown";

const Message = ({ role, content }) => {
  const isUser = role === "user";
  const backgroundColor = "#323232";
  const borderRadius = "20px";
  const boxShadow = 0;
  const textAlign = isUser ? "left" : "left";
  const maxWidth = isUser ? "80%" : "60%"; // Adjust maxWidth for assistant messages

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = "en-US";
      utterance.pitch = 1.5; // Increase pitch
      utterance.rate = 0.9; // Slow down speech
      utterance.volume = 1; // Full volume

      console.log(speechSynthesis.getVoices());
      // Set the voice to "Google UK English Female" if available
      const selectedVoice = speechSynthesis
        .getVoices()
        .find((voice) => voice.name === "Google UK English Female");
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log("Selected voice:", selectedVoice);
        console.log("content:", content);
      } else {
        // If the desired voice is not found, use the default
        console.warn("Desired voice not found, using default voice.");
      }

      speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support text-to-speech.");
    }
  };

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
        {!isUser && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              marginTop: 1,
            }}
          >
            <IconButton
              onClick={handleSpeak}
              sx={{
                color: "#fff",
              }}
            >
              <PlayCircleIcon onClick={handleSpeak} />
            </IconButton>
          </Box>
        )}
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

export default Message;
