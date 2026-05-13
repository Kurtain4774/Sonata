import Link from "next/link";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import { FiRefreshCw } from "react-icons/fi";
import Navbar from "@/components/Navbar";
import TrackList from "@/components/TrackList";
import PlaylistSaveButton from "@/components/PlaylistSaveButton";

export const dynamic = "force-dynamic";

export default async function PlaylistDetail({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  if (!mongoose.isValidObjectId(params.id)) notFound();

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  if (!user) notFound();

  const p = await Prompt.findOne({ _id: params.id, userId: user._id }).lean();
  if (!p) notFound();

  const ctx = p.context ?? null;
  const contextParts = ctx
    ? [
        ctx.energy != null && ctx.energy !== 3
          ? `Energy: ${["Very Low", "Low", "Medium", "High", "Very High"][ctx.energy - 1]}`
          : null,
        ctx.decades?.length > 0 ? `Decades: ${ctx.decades.join(", ")}` : null,
        ctx.language && ctx.language !== "Any" ? `Language: ${ctx.language}` : null,
        ctx.activity && ctx.activity !== "Any" ? `Activity: ${ctx.activity}` : null,
      ].filter(Boolean)
    : [];

  const tracks = (p.recommendations || []).map((t) => ({
    spotifyTrackId: t.spotifyTrackId,
    uri: t.uri,
    title: t.title,
    artist: t.artist,
    albumArt: t.albumArt,
    previewUrl: t.previewUrl,
    spotifyUrl: t.spotifyUrl,
  }));

  return (
    <main className="min-h-screen">
      <Navbar session={session} />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/history" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Back to history
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm text-neutral-400">Prompt</div>
            <h1 className="text-3xl font-semibold">“{p.promptText}”</h1>
            <div className="text-sm text-neutral-500 mt-1">
              {tracks.length} tracks · {new Date(p.createdAt).toLocaleString()}
            </div>
            {contextParts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {contextParts.map((part) => (
                  <span
                    key={part}
                    className="px-2 py-0.5 rounded-full bg-neutral-800 text-xs text-neutral-400"
                  >
                    {part}
                  </span>
                ))}
              </div>
            )}
          </div>
          <PlaylistSaveButton
            promptId={p._id.toString()}
            name={p.playlistName}
            trackUris={tracks.map((t) => t.uri).filter(Boolean)}
            initialSaved={p.savedAsPlaylist}
            initialUrl={p.spotifyPlaylistUrl}
            initialShared={p.sharedToExplore ?? false}
          />
        </div>

        <div className="mt-8">
          <TrackList tracks={tracks} />
        </div>

        <div className="mt-8">
          <Link
            href={`/dashboard?prompt=${encodeURIComponent(p.promptText)}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-600 text-sm text-neutral-200 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Regenerate with this prompt
          </Link>
        </div>
      </div>
    </main>
  );
}
