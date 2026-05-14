"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import SonataLogo from "@/components/SonataLogo";

export default function LandingHeader() {
  const { data: session } = useSession();

  return (
    <header className="absolute top-0 inset-x-0 z-30">
      <div className="w-[min(92vw,1120px)] xl:w-[min(94vw,1240px)] min-[1500px]:w-[min(94vw,1780px)] min-[1800px]:w-[min(94vw,1880px)] mx-auto flex items-center justify-between gap-4 py-5 sm:py-7">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="inline-flex items-center justify-center w-9 h-9 group-hover:scale-105 transition">
            <SonataLogo size={36} />
          </span>
          <span className="text-xl sm:text-2xl font-bold tracking-tight">
            Son<span className="text-spotify">ata</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-full bg-spotify hover:brightness-110 text-black font-semibold text-sm transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <button
                onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
                className="hidden min-[420px]:inline-flex px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium text-neutral-200 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 backdrop-blur-md transition"
              >
                Sign in
              </button>
              <button
                onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
                className="px-4 sm:px-5 py-2.5 rounded-full bg-spotify hover:brightness-110 text-black font-semibold text-sm shadow-lg shadow-spotify/20 transition"
              >
                <span className="hidden sm:inline">Get started free</span>
                <span className="sm:hidden">Get started</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
