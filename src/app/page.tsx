"use client";

import * as React from "react";

import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppNavbar from "../components/AppNavbar";
import AppTheme from "../components/AppTheme";
//import ChatPage from "@/features/Dashboard";
import { Typography, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Mic from "@mui/icons-material/Mic";
import { getConversation } from "@/lib/aws/getConversation";
import useTranscribe from "@/hooks/useTranscribe";
import usePolly from "@/hooks/usePolly";

type Message = {
  sender: "user" | "chatbot";
  content: string;
};

export default function Home(props: { disableCustomTheme?: boolean }) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState<string>("");

  const { audioUrl, getSynthesizedVoice } = usePolly();
  const { startTranscription, stopTranscription, recording, transcripts } =
    useTranscribe();

  const handleSend = async () => {
    if (input.trim() === "") return;
    const newMessage: Message = { sender: "user", content: input };

    setMessages([
      ...messages,
      newMessage,
      { sender: "chatbot", content: "no value" },
    ]);
    setInput("");
  };

  // onRecordStart.
  const handleStaertRecord = async () => {
    await startTranscription();
  };

  // onRecordStop.
  const handleStopRecord = async () => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        content: transcripts
          .map((transcript) => transcript.transcript)
          .join(" "),
      },
    ]);

    // recording stop
    stopTranscription();

    const tmp = messages.map((message) => {
      const aa: {
        role: "user" | "chatbot";
        message: string;
      } = {
        role: message.sender,
        message: message.content,
      };
      return aa;
    });

    const textResponse: string = await getConversation({
      message: transcripts.map((transcript) => transcript.transcript).join(" "),
      history: tmp,
    });

    setMessages((prev) => [
      ...prev,
      {
        sender: "chatbot",
        content: textResponse,
      },
    ]);

    // synthesize voice.
    await getSynthesizedVoice(textResponse);
  };

  return (
    <AppTheme {...props} themeComponents={undefined}>
      <CssBaseline enableColorScheme />
      <AppNavbar />
      {audioUrl && (
        <audio controls autoPlay hidden key={audioUrl}>
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio tag.
        </audio>
      )}

      <Box
        sx={{
          display: "bolck",
          //height: "100vh",
          backgroundColor: `white`,
          overflowY: "hidden",
        }}
      >
        {/* Main content */}
        <Box
          component="main"
          sx={() => ({
            flexGrow: 1,
            //height: "100%",
            overflowY: "hidden",
          })}
        >
          <Stack
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              mx: 3,
              mt: { xs: 8, md: 0 },
              height: "auto",
              overflowY: "hidden",
            }}
          >
            {/* chat area. */}
            <Box
              component="main"
              sx={() => ({
                minWidth: "100%",
                height: "100vh",
                overflowY: "scroll",
                paddingBottom: "50px",
              })}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    minWidth: "100%",
                    display: "flex",
                    justifyContent:
                      message.sender === "user" ? "flex-end" : "flex-start",
                    marginBottom: 1,
                  }}
                >
                  <Typography
                    sx={{
                      backgroundColor:
                        message.sender === "user" ? "#1976d2" : "#e0e0e0",
                      color: message.sender === "user" ? "#fff" : "#000",
                      padding: "8px 12px",
                      borderRadius: 4,
                      maxWidth: "60%",
                      wordWrap: "break-word",
                    }}
                  >
                    {message.content}
                  </Typography>
                </Box>
              ))}

              {/** transcription */}
              {recording && transcripts?.length > 0 && (
                <Box
                  sx={{
                    minWidth: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: 1,
                  }}
                >
                  <Typography
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: 4,
                      maxWidth: "60%",
                      wordWrap: "break-word",
                    }}
                  >
                    {transcripts
                      .map((transcript) => transcript.transcript)
                      .join(" ")}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                position: "fixed",
                display: "flex",
                backgroundColor: `white`,
                minWidth: "100%",
                minHeight: "100px",
                padding: "5px",
                alignItems: "center",
                justifyContent: "center",
                borderBottom: "1px solid",
                borderColor: "divider",
                marginTop: 0,
                bottom: 0,
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                maxRows={3}
                sx={{ marginRight: 1 }}
                onKeyDown={(e) => {
                  if (e.shiftKey && e.key === "Enter") {
                    setInput((value) => value + "\n");
                    console.log(input);
                  } else if (e.key === "Enter") {
                    console.log(e.key);
                    handleSend();
                  }
                }}
              />
              <IconButton type="submit" color="primary" onClick={handleSend}>
                <SendIcon fontSize="medium" />
              </IconButton>

              {recording ? (
                <IconButton
                  color="error"
                  onClick={handleStopRecord}
                  sx={{ marginX: 1 }}
                >
                  <Mic fontSize={"large"} />
                </IconButton>
              ) : (
                <IconButton
                  color="info"
                  onClick={handleStaertRecord}
                  sx={{ marginX: 1 }}
                >
                  <Mic fontSize={"large"} />
                </IconButton>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
