"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import SettingsModal from "./settings/SettingsModal";

export default function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="relative" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full hover:bg-neutral-900 px-1.5 py-1 transition-colors"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name || "user"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neutral-700" />
          )}
          <span className="hidden sm:inline text-sm text-neutral-300 pr-1">
            {user?.name}
          </span>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl py-1 z-50"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setShowSettings(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
            >
              <FiSettings className="w-4 h-4" />
              Settings
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
            >
              <FiLogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        )}
      </div>

      {showSettings && <SettingsModal user={user} onClose={() => setShowSettings(false)} />}
    </>
  );
}
