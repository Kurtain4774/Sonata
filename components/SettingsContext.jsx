"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { ACCENT_COLORS, DEFAULT_SETTINGS, sanitizeSettingsPatch } from "@/lib/settings";
import { useToast } from "./ToastContext";

const STORAGE_KEY = "sonata-settings-cache";

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  ready: false,
});

function readCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return null;
  }
}

function writeCache(settings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : theme;
  document.documentElement.classList.toggle("light", resolved === "light");
}

function applyAccent(color) {
  if (typeof document === "undefined") return;
  const rgb = ACCENT_COLORS[color] || ACCENT_COLORS.green;
  document.documentElement.style.setProperty("--accent-rgb", rgb);
}

function applyDocumentSettings(settings) {
  applyTheme(settings.theme);
  applyAccent(settings.accentColor);
}

export function SettingsProvider({ children }) {
  const { status } = useSession();
  const toast = useToast();
  const [settings, setSettings] = useState(() => readCache() || DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const lastConfirmedRef = useRef(settings);
  const pendingPatchRef = useRef({});
  const flushTimerRef = useRef(null);
  const retryAttemptRef = useRef(0);

  // Apply on mount + whenever settings change
  useEffect(() => {
    applyDocumentSettings(settings);
    writeCache(settings);
  }, [settings]);

  // System-theme listener
  useEffect(() => {
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => applyTheme("system");
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [settings.theme]);

  // Fetch fresh settings when authed
  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "unauthenticated") setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;
        const merged = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
        lastConfirmedRef.current = merged;
        setSettings(merged);
      } catch {
        // keep cache/defaults
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const flush = useCallback(async () => {
    const patch = pendingPatchRef.current;
    pendingPatchRef.current = {};
    flushTimerRef.current = null;
    if (!Object.keys(patch).length) return;
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("save failed");
      const data = await res.json();
      const merged = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
      lastConfirmedRef.current = merged;
      retryAttemptRef.current = 0;
    } catch {
      if (retryAttemptRef.current < 1) {
        retryAttemptRef.current += 1;
        pendingPatchRef.current = { ...patch, ...pendingPatchRef.current };
        flushTimerRef.current = setTimeout(flush, 1500);
        return;
      }
      retryAttemptRef.current = 0;
      setSettings(lastConfirmedRef.current);
      toast({
        type: "error",
        message: "Couldn't save settings. Reverted to last saved values.",
      });
    }
  }, [toast]);

  const updateSettings = useCallback(
    (patch) => {
      const clean = sanitizeSettingsPatch(patch);
      if (!Object.keys(clean).length) return;
      setSettings((prev) => ({ ...prev, ...clean }));
      pendingPatchRef.current = { ...pendingPatchRef.current, ...clean };
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(flush, 300);
    },
    [flush]
  );

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, ready }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext).settings;
}

export function useUpdateSettings() {
  return useContext(SettingsContext).updateSettings;
}

export function useSettingsContext() {
  return useContext(SettingsContext);
}
