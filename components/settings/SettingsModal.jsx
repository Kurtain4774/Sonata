"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import PlaybackTab from "./tabs/PlaybackTab";
import PersonalizationTab from "./tabs/PersonalizationTab";
import AppearanceTab from "./tabs/AppearanceTab";
import DataPrivacyTab from "./tabs/DataPrivacyTab";

const TABS = [
  { id: "playback", label: "Playback" },
  { id: "personalization", label: "Personalization" },
  { id: "appearance", label: "Appearance" },
  { id: "data", label: "Data & Privacy" },
];

export default function SettingsModal({ user, onClose }) {
  const [tab, setTab] = useState("playback");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl h-[min(640px,calc(100vh-2rem))] rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl flex flex-col sm:flex-row overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Mobile: horizontal scrollable tab strip */}
        <nav className="sm:hidden flex gap-1 px-3 pt-3 pb-1 pr-12 border-b border-neutral-800 overflow-x-auto bg-neutral-900/40">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 px-3 py-2 rounded-full text-sm transition-colors ${
                  active
                    ? "bg-spotify text-black font-medium"
                    : "text-neutral-300 hover:text-white hover:bg-neutral-800/60"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop: vertical sidebar */}
        <aside className="hidden sm:block w-52 shrink-0 border-r border-neutral-800 bg-neutral-900/40 py-5 px-3">
          <div className="px-3 mb-4 text-xs uppercase tracking-wider text-neutral-500">
            Settings
          </div>
          <nav className="flex flex-col gap-0.5">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:pt-12">
          {tab === "playback" && <PlaybackTab />}
          {tab === "personalization" && <PersonalizationTab />}
          {tab === "appearance" && <AppearanceTab />}
          {tab === "data" && <DataPrivacyTab user={user} onClose={onClose} />}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
