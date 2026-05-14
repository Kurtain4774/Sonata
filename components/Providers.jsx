"use client";

import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "./SettingsContext";
import { ToastProvider } from "./ToastContext";
import AudioPreviewProvider from "./AudioPreviewProvider";
import ErrorBoundary from "./ErrorBoundary";
import GlobalMiniPlayer from "./GlobalMiniPlayer";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <SettingsProvider>
          <AudioPreviewProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
            <GlobalMiniPlayer />
          </AudioPreviewProvider>
        </SettingsProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
