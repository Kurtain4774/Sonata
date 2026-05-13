import {
  FaUser,
  FaMagic,
  FaShareAlt,
  FaPlayCircle,
  FaGlobe,
} from "react-icons/fa";

const FEATURES = [
  {
    icon: FaUser,
    title: "Personalized suggestions",
    text: "Tailored to your taste and listening habits.",
  },
  {
    icon: FaMagic,
    title: "Refine your prompt",
    text: "Iterate and get even better matches.",
  },
  {
    icon: FaShareAlt,
    title: "Share with friends",
    text: "Share playlists and vibes instantly.",
  },
  {
    icon: FaPlayCircle,
    title: "Full playback integration",
    text: "Play on Deezer. Save on Spotify.",
  },
  {
    icon: FaGlobe,
    title: "Explore the community",
    text: "Discover public prompts and playlists.",
  },
];

export default function FeatureCards() {
  return (
    <div className="grid w-full max-w-[760px] grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 min-[1500px]:grid-cols-5 gap-3 min-[1500px]:gap-2.5 min-[1800px]:gap-3">
      {FEATURES.map(({ icon: Icon, title, text }) => (
        <div
          key={title}
          className="min-h-[116px] sm:min-h-[132px] rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.025] backdrop-blur-xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_45px_-32px_rgba(29,185,84,0.45)] hover:from-white/[0.085] hover:to-white/[0.035] hover:border-white/20 transition"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-spotify/15 border border-spotify/30 mb-3">
            <Icon className="text-spotify text-sm" />
          </div>
          <div className="text-sm font-semibold leading-tight mb-1.5">
            {title}
          </div>
          <div className="text-[11px] text-neutral-400 leading-snug">
            {text}
          </div>
        </div>
      ))}
    </div>
  );
}
