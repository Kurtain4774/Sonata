import {
  FaCompass,
  FaHome,
  FaBookOpen,
  FaHistory,
  FaHeart,
  FaUser,
} from "react-icons/fa";

const NAV_ITEMS = [
  { icon: FaHome, label: "Discover", active: true },
  { icon: FaCompass, label: "Explore" },
  { icon: FaBookOpen, label: "Library" },
  { icon: FaHistory, label: "History" },
  { icon: FaHeart, label: "Liked" },
];

const PLAYLISTS = [
  ["🚗", "Late Night Drive"],
  ["🎯", "Focus Flow"],
  ["😊", "Feel Good Hits"],
  ["💪", "Workout Mix"],
  ["☀️", "Chill Sundays"],
];

// Static sidebar for the landing-page dashboard mockup.
export default function DashboardPreviewSidebar() {
  return (
    <aside className="hidden md:flex md:w-36 lg:w-40 min-[1800px]:w-44 shrink-0 border-r border-neutral-800 bg-[#0a0a0a] flex-col">
      <div className="px-4 py-4 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gradient-to-br from-spotify to-emerald-700">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-black" fill="currentColor">
            <path d="M3 12h2v4H3zM7 8h2v12H7zM11 4h2v20h-2zM15 8h2v12h-2zM19 12h2v4h-2z" />
          </svg>
        </span>
        <span className="text-sm font-bold">Sonata</span>
      </div>
      <nav className="px-2 space-y-1 text-sm">
        {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md ${
              active
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Icon className="text-xs" />
            {label}
          </div>
        ))}
      </nav>
      <div className="px-4 pt-5 pb-2 text-[10px] uppercase tracking-wider text-neutral-500">
        Playlists
      </div>
      <div className="px-2 space-y-1 text-xs text-neutral-300 flex-1">
        {PLAYLISTS.map(([emoji, name]) => (
          <div key={name} className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-900">
            <span className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center text-[10px]">
              {emoji}
            </span>
            {name}
          </div>
        ))}
      </div>
      <div className="px-3 py-3 border-t border-neutral-800 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center">
          <FaUser className="text-neutral-300 text-xs" />
        </div>
        <div className="text-xs">
          <div className="font-medium">Aria</div>
        </div>
      </div>
    </aside>
  );
}
