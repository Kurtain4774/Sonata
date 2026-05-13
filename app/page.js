import AuthButton from "@/components/AuthButton";

const EXAMPLES = [
  "late night drive",
  "coffee shop jazz",
  "anime training arc energy",
];

const STEPS = [
  { title: "Describe", text: "Type any mood, vibe, or activity." },
  { title: "Discover", text: "AI picks 15 songs that match the feel." },
  { title: "Save", text: "One click to save it to your Spotify." },
];

export default function Landing() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Sound<span className="text-spotify">Sage</span>
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-neutral-300">
          Describe a vibe. Get a playlist.
        </p>

        <div className="mt-10">
          <AuthButton />
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((e) => (
            <span
              key={e}
              className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-sm"
            >
              “{e}”
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 border-t border-neutral-900">
        <h2 className="text-2xl font-semibold text-center mb-10">How it works</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="p-6 rounded-xl bg-neutral-900 border border-neutral-800"
            >
              <div className="text-spotify font-bold mb-2">Step {i + 1}</div>
              <div className="text-lg font-semibold">{s.title}</div>
              <p className="text-neutral-400 mt-1">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-neutral-500 text-sm border-t border-neutral-900">
        Built by Kurtis · <a href="https://github.com" className="hover:text-neutral-300">GitHub</a>
      </footer>
    </main>
  );
}
