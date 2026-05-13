import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import Navbar from "@/components/Navbar";
import HistoryPageClient from "@/components/HistoryPageClient";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  const prompts = user
    ? await Prompt.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    : [];

  const items = prompts.map((p) => ({
    id: p._id.toString(),
    promptText: p.promptText,
    playlistName: p.playlistName,
    trackCount: p.recommendations?.length || 0,
    thumbnails: (p.recommendations || [])
      .slice(0, 5)
      .map((t) => t.albumArt)
      .filter(Boolean),
    tracks: (p.recommendations || []).map((t) => ({
      uri: t.uri || null,
      title: t.title,
      artist: t.artist,
      albumArt: t.albumArt || null,
    })),
    savedAsPlaylist: p.savedAsPlaylist,
    createdAt: p.createdAt,
  }));

  return (
    <main className="min-h-screen">
      <Navbar session={session} />
      <div className="max-w-3xl mx-auto px-6 py-10">
        {items.length === 0 ? (
          <>
            <h1 className="text-3xl font-semibold mb-6">Your History</h1>
            <p className="text-neutral-400">
              No playlists yet.{" "}
              <Link href="/dashboard" className="text-spotify hover:underline">
                Go generate your first one
              </Link>
              .
            </p>
          </>
        ) : (
          <HistoryPageClient items={items} />
        )}
      </div>
    </main>
  );
}
