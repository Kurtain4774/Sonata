"use client";

import AlbumArt from "./AlbumArt";
import { FaPlay, FaPlus, FaCheckCircle, FaBell, FaPaperPlane } from "react-icons/fa";
import { SAMPLE_TRACKS } from "./tracks";
import DashboardPreviewSidebar from "./DashboardPreviewSidebar";
import DashboardPreviewRail from "./DashboardPreviewRail";

export default function DashboardPreview({ selectedTrackId, onSelectTrack, tracks = SAMPLE_TRACKS }) {
  return (
    <div className="relative w-full max-w-full rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-[#0b0b0d]/95 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-20px_rgba(29,185,84,0.15)] ring-1 ring-white/5">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#141416] border-b border-white/5">
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
        <div className="hidden min-[420px]:block flex-1 mx-2 sm:mx-4 px-3 py-1 rounded-md bg-[#0a0a0a] text-center text-[10px] sm:text-xs text-neutral-400">
          🔒 app.sonata.live
        </div>
        <FaBell className="ml-auto min-[420px]:ml-0 text-neutral-500 text-xs sm:text-sm" />
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-pink-400 to-orange-400" />
      </div>

      {/* App body */}
      <div className="flex h-[430px] sm:h-[500px] min-[1500px]:h-[540px] min-[1800px]:h-[560px]">
        <DashboardPreviewSidebar />

        {/* Main panel */}
        <div className="flex-1 min-w-0 p-3 sm:p-4 min-[1500px]:p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-spotify">✨</span>
            <h3 className="text-sm sm:text-base font-semibold">What's the vibe today?</h3>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-500 mb-3">
            Describe your mood in plain English. Sonata will handle the rest.
          </p>
          <div className="rounded-lg border border-spotify/40 bg-neutral-900/60 p-3 mb-3">
            <div className="text-xs sm:text-sm text-neutral-100 leading-relaxed">
              midnight drive through the city, nostalgic and dreamy<span className="inline-block w-px h-3 bg-spotify align-middle ml-0.5 animate-pulse" />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-neutral-500">47/200</span>
              <button className="w-7 h-7 rounded-full bg-spotify text-black flex items-center justify-center">
                <FaPaperPlane className="text-xs" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 text-[10px]">
            <span className="text-neutral-500">Examples:</span>
            {["chill study session", "rainy day vibes", "90s r&b", "confidence boost"].map((e, i) => (
              <span key={e} className={`px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 ${i > 1 ? "hidden sm:inline" : ""}`}>
                {e}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 mb-2">
            <h4 className="text-sm font-semibold">Recommended for you</h4>
            <span className="hidden sm:flex text-[10px] text-neutral-500 items-center gap-1">
              <span className="text-spotify">✨</span> AI powered by Google Gemini
            </span>
          </div>

          <div className="space-y-1.5">
            {tracks.slice(0, 5).map((t) => {
              const active = t.id === selectedTrackId;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTrack(t.id)}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-2 py-1.5 rounded-md text-left transition ${
                    active ? "bg-neutral-800/80" : "hover:bg-neutral-900"
                  }`}
                >
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded overflow-hidden bg-neutral-800">
                    <AlbumArt track={t} fill />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{t.title}</div>
                    <div className="text-[10px] text-neutral-500 truncate">{t.artist}</div>
                  </div>
                  <div className="hidden lg:block text-[10px] text-neutral-500 w-20 truncate">{t.album}</div>
                  <div className="hidden sm:block text-[10px] text-neutral-500 w-8">{t.durationLabel}</div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
                      <FaPlay className="text-[8px] text-neutral-300" />
                    </span>
                    {active ? (
                      <FaCheckCircle className="text-spotify text-base" />
                    ) : (
                      <span className="hidden min-[420px]:flex w-6 h-6 rounded-full bg-neutral-800 items-center justify-center">
                        <FaPlus className="text-[10px] text-neutral-300" />
                      </span>
                    )}
                    <span className="hidden sm:inline text-neutral-500">⋯</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-neutral-800">
            <button className="text-[10px] text-neutral-400 flex items-center gap-1.5">
              <span>↻</span> Refine this prompt
            </button>
            <span className="hidden min-[420px]:inline text-[10px] text-neutral-400">More like this ›</span>
          </div>
        </div>

        <DashboardPreviewRail />
      </div>
    </div>
  );
}
