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
import CallIcon from "@mui/icons-material/Call";
import CallEndIcon from "@mui/icons-material/CallEnd";
import { listBucket } from "@/lib/aws/listS3";

type Message = {
  sender: "user" | "chatbot";
  content: string;
};

export default function Home(props: { disableCustomTheme?: boolean }) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState<string>("");

  const handleSend = async () => {
    if (input.trim() === "") return;
    const newMessage: Message = { sender: "user", content: input };

    const s3ls: string = await listBucket();

    setMessages([
      ...messages,
      newMessage,
      { sender: "chatbot", content: s3ls ?? "no value" },
    ]);
    setInput("");
  };

  return (
    <AppTheme {...props} themeComponents={undefined}>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          display: "flex",
          //height: "100vh",
          backgroundColor: `white`,
          overflowY: "hidden",
        }}
      >
        <AppNavbar />
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
              height: "100vh",
              overflowY: "hidden",
            }}
          >
            {/* chat area. */}
            <Box
              component="main"
              sx={() => ({
                minWidth: "100%",
                height: "calc(100vh - 100px)",
                overflowY: "scroll",
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
            </Box>
            <Box
              sx={{
                display: "flex",
                minWidth: "100%",
                minHeight: "100px",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 0,
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
              <IconButton
                color="success"
                onClick={handleSend}
                sx={{ marginX: 1 }}
              >
                <CallIcon fontSize={"large"} />
              </IconButton>
              <IconButton
                color="error"
                onClick={handleSend}
                sx={{ marginX: 1 }}
              >
                <CallEndIcon fontSize={"large"} />
              </IconButton>
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
