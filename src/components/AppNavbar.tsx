"use client";

import * as React from "react";
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Stack from "@mui/material/Stack";
import MuiToolbar from "@mui/material/Toolbar";
import { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

const Toolbar = styled(MuiToolbar)({
  width: "100%",
  height: "50px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  justifyContent: "center",
  gap: "12px",
  flexShrink: 0,
  [`& ${tabsClasses.flexContainer}`]: {
    gap: "8px",
    p: "8px",
    pb: 0,
  },
});

export default function AppNavbar() {
  return (
    <AppBar
      position="fixed"
      sx={{
        boxShadow: 0,
        bgcolor: "background.paper",
        backgroundImage: "none",
        borderBottom: "1px solid",
        borderColor: "divider",
        top: "var(--template-frame-height, 0px)",
      }}
    >
      <Toolbar variant="regular">
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            flexGrow: 1,
            width: "100%",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: "text.primary" }}
            >
              Dashboard
            </Typography>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
