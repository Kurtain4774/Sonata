"use client";

import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "./SettingsContext";
import GlobalMiniPlayer from "./GlobalMiniPlayer";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <SettingsProvider>
        {children}
        <GlobalMiniPlayer />
      </SettingsProvider>
    </SessionProvider>
  );
}
