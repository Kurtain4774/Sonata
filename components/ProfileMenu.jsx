"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import dynamic from "next/dynamic";

const SettingsModal = dynamic(() => import("./settings/SettingsModal"), { ssr: false });

export default function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const wasOpenRef = useRef(false);
  const suppressReturnRef = useRef(false);

  useEffect(() => {
    if (!open) {
      // Restore focus to trigger when closing, unless we're handing off to the modal.
      if (wasOpenRef.current && !suppressReturnRef.current) {
        triggerRef.current?.focus();
      }
      suppressReturnRef.current = false;
      wasOpenRef.current = false;
      return;
    }
    wasOpenRef.current = true;
    const firstItem = menuRef.current?.querySelector('[role="menuitem"]');
    firstItem?.focus();

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

  const handleMenuKeyDown = (e) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll('[role="menuitem"]') || []
    );
    if (!items.length) return;
    const currentIdx = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[(currentIdx + 1 + items.length) % items.length];
      next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[(currentIdx - 1 + items.length) % items.length];
      prev.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <>
      <div className="relative" ref={wrapRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full hover:bg-neutral-900 px-1.5 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-spotify focus:outline-none"
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
            ref={menuRef}
            role="menu"
            aria-label="Account menu"
            onKeyDown={handleMenuKeyDown}
            className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl py-1 z-50"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                suppressReturnRef.current = true;
                setOpen(false);
                setShowSettings(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 focus:bg-neutral-900 focus:outline-none"
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
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 focus:bg-neutral-900 focus:outline-none"
            >
              <FiLogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          returnFocusRef={triggerRef}
        />
      )}
    </>
  );
}
