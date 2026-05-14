"use client";

import { useEffect, useRef, useState } from "react";
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

export default function SettingsModal({ user, onClose, returnFocusRef }) {
  const [tab, setTab] = useState("playback");
  const [mounted, setMounted] = useState(false);
  const tablistMobileRef = useRef(null);
  const tablistDesktopRef = useRef(null);

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
      returnFocusRef?.current?.focus?.();
    };
  }, [onClose, returnFocusRef]);

  useEffect(() => {
    if (!mounted) return;
    const list = tablistDesktopRef.current || tablistMobileRef.current;
    const btn = list?.querySelector(`[data-tab-id="${tab}"]`);
    btn?.focus();
    // Only on first mount; subsequent tab changes manage focus inside onKeyDown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const handleTabKeyDown = (e, orientation) => {
    const horizontal = orientation === "horizontal";
    const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
    if (![nextKey, prevKey, "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const idx = TABS.findIndex((t) => t.id === tab);
    let nextIdx = idx;
    if (e.key === nextKey) nextIdx = (idx + 1) % TABS.length;
    else if (e.key === prevKey) nextIdx = (idx - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = TABS.length - 1;
    const nextId = TABS[nextIdx].id;
    setTab(nextId);
    const list = e.currentTarget;
    requestAnimationFrame(() => {
      list.querySelector(`[data-tab-id="${nextId}"]`)?.focus();
    });
  };

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
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center focus-visible:ring-2 focus-visible:ring-spotify focus:outline-none"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Mobile: horizontal scrollable tab strip */}
        <nav
          ref={tablistMobileRef}
          role="tablist"
          aria-label="Settings sections"
          aria-orientation="horizontal"
          onKeyDown={(e) => handleTabKeyDown(e, "horizontal")}
          className="sm:hidden flex gap-1 px-3 pt-3 pb-1 pr-12 border-b border-neutral-800 overflow-x-auto bg-neutral-900/40"
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`settings-tab-m-${t.id}`}
                data-tab-id={t.id}
                aria-selected={active}
                aria-controls="settings-tabpanel"
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={`shrink-0 px-3 py-2 rounded-full text-sm transition-colors focus-visible:ring-2 focus-visible:ring-spotify focus:outline-none ${
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
          <nav
            ref={tablistDesktopRef}
            role="tablist"
            aria-label="Settings sections"
            aria-orientation="vertical"
            onKeyDown={(e) => handleTabKeyDown(e, "vertical")}
            className="flex flex-col gap-0.5"
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`settings-tab-d-${t.id}`}
                  data-tab-id={t.id}
                  aria-selected={active}
                  aria-controls="settings-tabpanel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  className={`text-left px-3 py-2 rounded-md text-sm transition-colors focus-visible:ring-2 focus-visible:ring-spotify focus:outline-none ${
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

        <div
          role="tabpanel"
          id="settings-tabpanel"
          aria-labelledby={`settings-tab-d-${tab}`}
          tabIndex={0}
          className="flex-1 overflow-y-auto p-4 sm:p-6 sm:pt-12 focus:outline-none"
        >
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
