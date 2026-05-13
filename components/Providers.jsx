"use client";

import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "./SettingsContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </SessionProvider>
  );
}
