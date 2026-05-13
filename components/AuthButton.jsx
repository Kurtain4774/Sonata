"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { FaSpotify } from "react-icons/fa";
import Link from "next/link";

export default function AuthButton({ variant = "login" }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button
        disabled
        className="px-6 py-3 rounded-full bg-neutral-800 text-neutral-400"
      >
        Loading…
      </button>
    );
  }

  if (session) {
    if (variant === "logout") {
      return (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-sm"
        >
          Log out
        </button>
      );
    }
    return (
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-spotify hover:bg-green-500 text-black font-semibold"
      >
        Go to Dashboard
      </Link>
    );
  }

  return (
    <button
      onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-spotify hover:bg-green-500 text-black font-semibold"
    >
      <FaSpotify className="text-xl" />
      Login with Spotify
    </button>
  );
}
