import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import Navbar from "@/components/Navbar";
import PlaylistDetailClient from "@/components/playlist-detail/PlaylistDetailClient";

export const dynamic = "force-dynamic";

export default async function PlaylistDetail({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  if (!user) notFound();

  const doc = await Prompt.findOne({ _id: id, userId: user._id }).lean();
  if (!doc) notFound();

  const playlist = {
    _id: doc._id.toString(),
    promptText: doc.promptText,
    playlistName: doc.playlistName || doc.promptText,
    playlistDescription: doc.playlistDescription || "",
    createdAt: doc.createdAt,
    savedAsPlaylist: !!doc.savedAsPlaylist,
    spotifyPlaylistUrl: doc.spotifyPlaylistUrl || null,
    excludedArtists: doc.excludedArtists || [],
    refinementHistory: (doc.refinementHistory || []).map((h) => ({
      followUp: h.followUp,
      shortcutsApplied: h.shortcutsApplied || [],
      excludedArtists: h.excludedArtists || [],
      appliedAt: h.appliedAt,
    })),
    recommendations: (doc.recommendations || []).map((t) => ({
      spotifyTrackId: t.spotifyTrackId,
      uri: t.uri,
      title: t.title,
      artist: t.artist,
      album: t.album || null,
      albumArt: t.albumArt,
      previewUrl: t.previewUrl,
      spotifyUrl: t.spotifyUrl,
      durationMs: t.durationMs ?? null,
      matchScore: t.matchScore ?? null,
      moodFit: t.moodFit || null,
    })),
  };

  return (
    <main className="min-h-screen bg-neutral-950">
      <Navbar session={session} />
      <PlaylistDetailClient playlist={playlist} />
    </main>
  );
}
