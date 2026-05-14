"use client";

import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "./SettingsContext";
import { ToastProvider } from "./ToastContext";
import ErrorBoundary from "./ErrorBoundary";
import GlobalMiniPlayer from "./GlobalMiniPlayer";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <SettingsProvider>
        <ToastProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
          <GlobalMiniPlayer />
        </ToastProvider>
      </SettingsProvider>
    </SessionProvider>
  );
}
