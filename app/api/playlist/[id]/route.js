import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import { updatePlaylistDetails, SpotifyAuthError } from "@/lib/spotify";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { playlistName, playlistDescription, excludedArtists } = body || {};

  try {
    await connectDB();
    const user = await User.findOne({ spotifyId: session.spotifyId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const doc = await Prompt.findOne({ _id: id, userId: user._id });
    if (!doc) return NextResponse.json({ error: "Playlist not found" }, { status: 404 });

    if (typeof playlistName === "string") doc.playlistName = playlistName.slice(0, 120);
    if (typeof playlistDescription === "string") doc.playlistDescription = playlistDescription.slice(0, 500);
    if (Array.isArray(excludedArtists)) {
      doc.excludedArtists = excludedArtists.map((a) => String(a).slice(0, 80)).slice(0, 50);
    }
    await doc.save();

    if (doc.savedAsPlaylist && doc.spotifyPlaylistId && (playlistName || playlistDescription)) {
      try {
        await updatePlaylistDetails(session.accessToken, doc.spotifyPlaylistId, {
          name: playlistName,
          description: playlistDescription,
        });
      } catch (err) {
        console.warn("Spotify playlist details update failed:", err?.message || err);
      }
    }

    return NextResponse.json({ ok: true, playlist: doc });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json({ error: "Spotify session expired" }, { status: 401 });
    }
    console.error("PATCH /api/playlist/[id] failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await connectDB();
    const user = await User.findOne({ spotifyId: session.spotifyId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const res = await Prompt.deleteOne({ _id: id, userId: user._id });
    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/playlist/[id] failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
