import { FaSpotify, FaInstagram, FaWhatsapp, FaTwitter, FaLink } from "react-icons/fa";
import Sparkline from "./Sparkline";

// Static right-rail for the landing-page dashboard mockup.
export default function DashboardPreviewRail() {
  return (
    <aside className="hidden min-[1800px]:block w-48 shrink-0 border-l border-neutral-800 bg-[#0a0a0a] p-3 space-y-3">
      <div className="rounded-md border border-neutral-800 p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-neutral-400">Your listening</span>
          <span className="text-[10px] text-neutral-500">This week ›</span>
        </div>
        <Sparkline />
        <div className="text-xl font-bold mt-1">1,248</div>
        <div className="text-[10px] text-neutral-500">Minutes listened</div>
        <div className="text-[10px] text-spotify mt-1">▲ 18% vs last week</div>
      </div>

      <div className="rounded-md border border-neutral-800 p-3">
        <div className="text-[11px] font-semibold mb-0.5">Save to Spotify</div>
        <div className="text-[10px] text-neutral-500 mb-2 leading-snug">
          Save your recommendations as a playlist in Spotify.
        </div>
        <button className="w-full py-1.5 rounded-full bg-spotify text-black text-[11px] font-semibold flex items-center justify-center gap-1.5">
          <FaSpotify /> Save all to Spotify
        </button>
      </div>

      <div className="rounded-md border border-neutral-800 p-3">
        <div className="text-[11px] font-semibold mb-0.5">Share your vibe</div>
        <div className="text-[10px] text-neutral-500 mb-2 leading-snug">
          Let friends discover this vibe and your playlist.
        </div>
        <div className="flex gap-1.5">
          {[FaLink, FaInstagram, FaTwitter, FaWhatsapp].map((Icon, i) => (
            <span key={i} className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center">
              <Icon className="text-[10px]" />
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-neutral-800 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-gradient-to-br from-purple-500 to-pink-500" />
          <span className="text-[11px] font-semibold">Preview</span>
          <span className="text-[10px] text-neutral-500">powered by Deezer</span>
        </div>
        <div className="text-[10px] text-neutral-500 mb-2 leading-snug">
          High-quality previews. Real tracks. Real vibe.
        </div>
        <div className="text-[10px] text-spotify">Learn more →</div>
      </div>
    </aside>
  );
}
