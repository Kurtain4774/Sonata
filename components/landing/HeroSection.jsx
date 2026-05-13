"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { FaSpotify } from "react-icons/fa";
import DashboardPreview from "./DashboardPreview";
import FloatingAlbums from "./FloatingAlbums";
import FeatureCards from "./FeatureCards";
import { DEFAULT_TRACK_ID, SAMPLE_TRACKS } from "./tracks";

export default function HeroSection() {
  const [selectedTrackId, setSelectedTrackId] = useState(DEFAULT_TRACK_ID);
  const [tracks, setTracks] = useState(SAMPLE_TRACKS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/landing-tracks")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled || !data?.tracks) return;
        setTracks(data.tracks);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const { data: session } = useSession();

  const handleCta = () => {
    if (session) {
      window.location.href = "/dashboard";
    } else {
      signIn("spotify", { callbackUrl: "/dashboard" });
    }
  };

  return (
    <section className="relative overflow-hidden min-h-screen min-[1500px]:h-screen min-[1500px]:min-h-[820px] flex flex-col">
      {/* Layered background */}
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
        {/* Strong left dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 via-30% to-transparent" />
        {/* Top + bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        {/* Soft green radial glow behind the dashboard */}
        <div
          className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[760px] h-[760px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(29,185,84,0.35) 0%, rgba(29,185,84,0.08) 40%, transparent 70%)",
          }}
        />
      </div>

      <FloatingAlbums selectedTrackId={selectedTrackId} tracks={tracks} />

      <div className="relative z-20 flex-1 flex items-center w-full">
        <div className="w-[min(92vw,1120px)] xl:w-[min(94vw,1240px)] min-[1500px]:w-[min(94vw,1780px)] min-[1800px]:w-[min(94vw,1880px)] mx-auto pt-28 sm:pt-32 pb-16 min-[1500px]:min-h-[calc(100vh-96px)] min-[1500px]:box-border min-[1500px]:pt-12 min-[1500px]:pb-32 grid min-[1500px]:grid-cols-[minmax(560px,0.84fr)_minmax(720px,1.16fr)] gap-14 min-[1500px]:gap-[clamp(48px,4vw,78px)] items-center">
          {/* Left column */}
          <div className="relative max-w-[760px] min-[1500px]:max-w-[720px] min-[1500px]:translate-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-spotify/40 bg-spotify/10 backdrop-blur-sm text-[11px] font-semibold tracking-[0.15em]">
              <span className="w-1.5 h-1.5 rounded-full bg-spotify shadow-[0_0_8px_rgba(29,185,84,0.8)]" />
              AI-POWERED MUSIC DISCOVERY
            </span>

            <h1 className="mt-8 max-w-[760px] font-extrabold text-[clamp(2.85rem,13vw,4.8rem)] leading-[0.98] tracking-[-0.05em] min-[1500px]:text-[clamp(4.2rem,4.55vw,5.9rem)] min-[1500px]:tracking-[-0.065em]">
              <span className="block md:whitespace-nowrap">Describe the vibe.</span>
              <span className="block md:whitespace-nowrap">Discover your</span>
              <span className="block md:whitespace-nowrap">
                next <span className="text-spotify">obsession.</span>
              </span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-neutral-300 max-w-[680px] leading-relaxed">
              Sonata uses <span className="text-spotify font-medium">Google Gemini</span> to
              turn your mood or vibe into personalized song recommendations—matched to real{" "}
              <span className="text-spotify font-medium">Spotify</span> tracks with{" "}
              <span className="text-spotify font-medium">Deezer</span> audio previews. Save
              your favorites directly to Spotify and build the perfect soundtrack for any
              moment.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={handleCta}
                className="inline-flex w-full min-[420px]:w-auto justify-center items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-full bg-spotify hover:brightness-110 text-black font-semibold text-base shadow-lg shadow-spotify/30 transition"
              >
                <FaSpotify className="text-xl" />
                Continue with Spotify
              </button>
              <button
                onClick={handleCta}
                className="inline-flex w-full min-[420px]:w-auto justify-center items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-full border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 backdrop-blur-md font-medium text-base transition"
              >
                <span className="text-spotify">✨</span> Try an example
              </button>
            </div>

            <div className="mt-10 flex items-center gap-3.5">
              <div className="flex -space-x-2.5">
                {[
                  "from-pink-400 to-orange-400",
                  "from-blue-400 to-cyan-400",
                  "from-purple-400 to-pink-400",
                  "from-emerald-400 to-teal-400",
                ].map((g, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${g} ring-2 ring-black`}
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="font-medium text-neutral-100">Loved by music explorers</div>
                <div className="text-neutral-400 text-xs">
                  Join 24,892+ discovering with Sonata
                </div>
              </div>
            </div>

            <div className="mt-12">
              <FeatureCards />
            </div>
          </div>

          {/* Right column — dashboard preview */}
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
