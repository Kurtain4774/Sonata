import {
  FiBarChart2,
  FiCheck,
  FiCompass,
  FiDisc,
  FiHeart,
  FiHome,
  FiMusic,
  FiPlay,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import SonataLogo from "@/components/SonataLogo";

const frameMap = {
  logo: "logo",
  "empty-input": "empty-input",
  "filled-input": "filled-input",
  results: "results",
  saved: "saved",
  cta: "cta",
};

const chips = [
  "Rainy night R&B",
  "Golden hour indie",
  "Deep focus",
  "Late-night drive",
  "Warm synthwave",
];

const tracks = [
  {
    title: "Nightcall",
    artist: "Kavinsky",
    duration: "4:18",
    gradient: "from-[#25233f] via-[#4267a3] to-[#f56b3b]",
    tag: "NC",
  },
  {
    title: "Midnight City",
    artist: "M83",
    duration: "4:03",
    gradient: "from-[#121b2f] via-[#6a55cc] to-[#ff6aa2]",
    tag: "MC",
    active: true,
  },
  {
    title: "Sweet Disposition",
    artist: "The Temper Trap",
    duration: "3:51",
    gradient: "from-[#162b2f] via-[#2f9e89] to-[#ffcc70]",
    tag: "SD",
  },
  {
    title: "Space Song",
    artist: "Beach House",
    duration: "5:20",
    gradient: "from-[#20162d] via-[#48506f] to-[#d7b8ff]",
    tag: "SS",
  },
  {
    title: "The Less I Know The Better",
    artist: "Tame Impala",
    duration: "3:36",
    gradient: "from-[#2b1526] via-[#e05f66] to-[#f2c14e]",
    tag: "TL",
  },
];

function BrandLockup({ size = 64, compact = false }) {
  return (
    <div className="flex items-center gap-4">
      <SonataLogo size={size} />
      <div className={compact ? "text-2xl font-bold tracking-normal" : "text-6xl font-bold tracking-normal"}>
        Son<span className="text-spotify">ata</span>
      </div>
    </div>
  );
}

function CenterBrandFrame() {
  return (
    <main
      className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center"
      data-sonata-frame-ready="true"
    >
      <BrandLockup size={82} />
    </main>
  );
}

function ClosingCtaFrame() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white flex items-center justify-center"
      data-sonata-frame-ready="true"
    >
      <div className="absolute w-[420px] h-[420px] rounded-full bg-spotify/20 blur-[120px]" />
      <div className="relative flex flex-col items-center text-center">
        <BrandLockup size={76} />
        <p className="mt-6 text-2xl text-neutral-200">
          Your perfect playlist is one vibe away.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <button className="h-12 px-7 rounded-full bg-spotify text-black text-sm font-semibold shadow-spotify-glow">
            Start building
          </button>
          <button className="h-12 px-7 rounded-full border border-white/15 bg-white/[0.04] text-sm font-semibold text-white">
            Explore vibes
          </button>
        </div>
      </div>
    </main>
  );
}

function Sidebar() {
  const nav = [
    { label: "Dashboard", icon: FiHome, active: true },
    { label: "Your Music", icon: FiDisc },
    { label: "Stats", icon: FiBarChart2 },
    { label: "Explore", icon: FiCompass },
  ];

  return (
    <aside className="w-[260px] shrink-0 border-r border-white/[0.08] bg-[#0d0d0f] px-5 py-6">
      <BrandLockup size={30} compact />
      <nav className="mt-10 space-y-2">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm ${
                item.active
                  ? "bg-spotify/15 text-spotify ring-1 ring-spotify/25"
                  : "text-neutral-400"
              }`}
            >
              <Icon className="text-lg" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div className="mt-10 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
          Now tuning
        </div>
        <div className="mt-3 text-sm font-medium text-white">
          Midnight Drive
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          15-song AI mix
        </div>
      </div>
    </aside>
  );
}

function AppShell({ children }) {
  return (
    <main
      className="min-h-screen bg-[#0a0a0a] text-white"
      data-sonata-frame-ready="true"
    >
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 overflow-hidden">
          <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-8">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                Sonata dashboard
              </div>
              <div className="text-sm text-neutral-300">
                Describe a vibe. Get a playlist.
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-spotify to-emerald-300" />
              <span className="text-sm font-medium">Kurtis</span>
            </div>
          </div>
          <div className="px-10 py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

function VibeInputFrame({ filled = false }) {
  return (
    <AppShell>
      <div className="max-w-[920px]">
        <section className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-neutral-950 via-neutral-900 to-emerald-950/30 p-8 shadow-spotify-glow">
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-spotify/25 bg-spotify/10 px-3 py-1 text-xs font-medium text-spotify">
                <FiMusic />
                AI playlist builder
              </div>
              <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-normal">
                What are you in the mood for?
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-neutral-400">
                Sonata turns a moment, mood, or memory into a Spotify-ready mix.
              </p>
            </div>
            <div className="w-[410px] shrink-0 rounded-xl border border-white/[0.08] bg-black/35 p-4">
              <textarea
                readOnly
                value={
                  filled
                    ? "midnight drive through the city, nostalgic and dreamy"
                    : ""
                }
                placeholder="What's the vibe today?"
                className="h-[142px] w-full resize-none rounded-lg border border-white/[0.08] bg-[#101012] p-4 text-base leading-7 text-white outline-none placeholder:text-neutral-500"
              />
              <button className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-spotify text-sm font-semibold text-black">
                <FiMusic />
                Generate playlist
              </button>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-neutral-300"
              >
                {chip}
              </span>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Waveform() {
  const bars = [18, 28, 14, 34, 22, 30, 16, 26, 20];
  return (
    <div className="flex h-9 items-center gap-1" aria-label="Active playing waveform">
      {bars.map((height, index) => (
        <span
          key={index}
          className="w-1.5 rounded-full bg-spotify"
          style={{ height }}
        />
      ))}
    </div>
  );
}

function AlbumArt({ track }) {
  return (
    <div
      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${track.gradient} shadow-lg`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.35),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(0,0,0,0.35),transparent_30%)]" />
      <div className="absolute bottom-2 left-2 text-sm font-black tracking-normal text-white/90">
        {track.tag}
      </div>
    </div>
  );
}

function TrackRow({ track, index }) {
  return (
    <div
      className={`grid grid-cols-[34px_1fr_86px_86px_92px] items-center gap-4 rounded-lg border p-3 ${
        track.active
          ? "border-spotify/35 bg-spotify/[0.08]"
          : "border-white/[0.07] bg-white/[0.035]"
      }`}
    >
      <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
        <FiPlay className="ml-0.5" />
      </button>
      <div className="flex min-w-0 items-center gap-4">
        <AlbumArt track={track} />
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-white">
            {track.title}
          </div>
          <div className="mt-1 truncate text-sm text-neutral-400">
            {track.artist}
          </div>
        </div>
      </div>
      <div className="text-sm tabular-nums text-neutral-400">{track.duration}</div>
      <div>{track.active ? <Waveform /> : <div className="h-9" />}</div>
      <button className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 text-sm font-medium text-neutral-200">
        <FiHeart />
        Save
      </button>
    </div>
  );
}

function ResultsFrame({ saved = false }) {
  return (
    <AppShell>
      {saved && (
        <div className="fixed left-1/2 top-6 z-20 -translate-x-1/2 rounded-xl border border-spotify/35 bg-[#111914]/95 px-5 py-3 shadow-spotify-glow backdrop-blur">
          <div className="flex items-center gap-3 text-sm text-neutral-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-spotify text-black">
              <FiCheck />
            </span>
            Playlist saved to Spotify
          </div>
        </div>
      )}
      <section className="max-w-[1040px] rounded-xl border border-white/[0.08] bg-neutral-950/80 p-6 shadow-spotify-glow">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-spotify">
              Generated from your vibe
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal">
              Midnight Drive Through the City
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Nostalgic, dreamy, neon-lit songs for late streets and quiet thoughts.
            </p>
          </div>
          <button
            className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold ${
              saved
                ? "bg-white text-black"
                : "bg-spotify text-black shadow-spotify-glow"
            }`}
          >
            {saved ? "✓ Saved to Spotify" : "Save all to Spotify"}
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {tracks.map((track, index) => (
            <TrackRow key={track.title} track={track} index={index} />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-neutral-400">
          <span>5 of 15 tracks previewed</span>
          <span className="inline-flex items-center gap-2 text-spotify">
            <FiPlus />
            Refine this vibe
          </span>
        </div>
      </section>
    </AppShell>
  );
}

export default function SonataFrames({ frame }) {
  const normalized = frameMap[frame] || "logo";

  if (normalized === "logo") return <CenterBrandFrame />;
  if (normalized === "empty-input") return <VibeInputFrame />;
  if (normalized === "filled-input") return <VibeInputFrame filled />;
  if (normalized === "results") return <ResultsFrame />;
  if (normalized === "saved") return <ResultsFrame saved />;
  if (normalized === "cta") return <ClosingCtaFrame />;

  return <CenterBrandFrame />;
}
