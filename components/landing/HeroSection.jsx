"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { FaSpotify } from "react-icons/fa";
import DashboardPreview from "./DashboardPreview";
import { DEFAULT_TRACK_ID, SAMPLE_TRACKS } from "./tracks";

export default function HeroSection() {
  const [selectedTrackId, setSelectedTrackId] = useState(DEFAULT_TRACK_ID);
  const [tracks, setTracks] = useState(SAMPLE_TRACKS);
  const { data: session } = useSession();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/landing-tracks")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.tracks) return;
        setTracks(data.tracks);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const goToDashboard = (callbackUrl = "/dashboard") => {
    if (session) {
      window.location.href = callbackUrl;
    } else {
      signIn("spotify", { callbackUrl });
    }
  };

  return (
    <section className="relative overflow-hidden min-h-screen min-[1500px]:h-screen min-[1500px]:min-h-[820px] flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <picture>
          <source media="(max-width: 767px)" srcSet="/images/hero-bg-mobile.png" />
          <source media="(max-width: 1279px)" srcSet="/images/hero-bg-tablet.png" />
          <img
            src="/images/hero-bg-desktop.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 via-30% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div
          className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[760px] h-[760px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(29,185,84,0.35) 0%, rgba(29,185,84,0.08) 40%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-20 flex-1 flex items-center w-full">
        <div className="w-[min(92vw,1120px)] xl:w-[min(94vw,1240px)] min-[1500px]:w-[min(94vw,1780px)] min-[1800px]:w-[min(94vw,1880px)] mx-auto pt-28 sm:pt-32 pb-16 min-[1500px]:min-h-[calc(100vh-96px)] min-[1500px]:box-border min-[1500px]:pt-12 min-[1500px]:pb-32 grid min-[1500px]:grid-cols-[minmax(560px,0.84fr)_minmax(720px,1.16fr)] gap-14 min-[1500px]:gap-[clamp(48px,4vw,78px)] items-center">
          <div className="relative max-w-[760px] min-[1500px]:max-w-[720px] min-[1500px]:translate-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-spotify/40 bg-spotify/10 backdrop-blur-sm text-[11px] font-semibold tracking-[0.15em]">
              <span className="w-1.5 h-1.5 rounded-full bg-spotify shadow-[0_0_8px_rgba(29,185,84,0.8)]" />
              AI-POWERED MUSIC DISCOVERY
            </span>

            <h1 className="mt-8 max-w-[760px] font-extrabold text-[clamp(2.65rem,12vw,4.8rem)] leading-[0.98] tracking-[-0.05em] min-[1500px]:text-[clamp(4.2rem,4.55vw,5.9rem)] min-[1500px]:tracking-[-0.065em]">
              <span className="block md:whitespace-nowrap">Describe the vibe.</span>
              <span className="block md:whitespace-nowrap">Discover your</span>
              <span className="block md:whitespace-nowrap">
                next <span className="text-spotify">obsession.</span>
              </span>
            </h1>

            <p className="mt-7 text-lg md:text-xl text-neutral-300 max-w-[620px] leading-relaxed">
              Turn a mood, activity, or memory into personalized{" "}
              <span className="text-spotify font-medium">Spotify</span>{" "}
              recommendations with quick previews and one-click playlist saving.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <button
                onClick={() => goToDashboard()}
                className="inline-flex w-full min-[420px]:w-auto justify-center items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-full bg-spotify hover:brightness-110 text-black font-semibold text-base shadow-lg shadow-spotify/30 transition"
              >
                <FaSpotify className="text-xl" />
                Continue with Spotify
              </button>
            </div>

            <div className="mt-10 flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-spotify/30 bg-spotify/10">
                <FaSpotify className="text-spotify" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-neutral-100">
                  Spotify-ready mixes in seconds
                </div>
                <div className="text-neutral-400 text-xs">
                  Preview, refine, save, and share.
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-[980px] min-[1500px]:max-w-none min-[1500px]:w-[clamp(720px,43vw,940px)] min-[1800px]:w-[clamp(800px,44vw,980px)] min-[1500px]:translate-y-8 justify-self-center min-[1500px]:justify-self-end flex justify-center min-[1500px]:justify-end">
            <DashboardPreview
              selectedTrackId={selectedTrackId}
              onSelectTrack={setSelectedTrackId}
              tracks={tracks}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
