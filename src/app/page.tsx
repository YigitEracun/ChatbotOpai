"use client";

import { DefaultSessionProvider } from "@openai/chatkit";
import { Main } from "@openai/chatkit/components";
import "@openai/chatkit/theme.css";

export default function Home() {
  return (
    <DefaultSessionProvider>
      <Main />
    </DefaultSessionProvider>
  );
}

