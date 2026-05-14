import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import {
  createPlaylist,
  addTracksToPlaylist,
  SpotifyAuthError,
  SpotifyApiError,
} from "@/lib/spotify";
import { withSpotifyRetry } from "@/lib/spotifyAuth";
import { uploadPlaylistCover } from "@/lib/playlistCover";

function spotifyForbiddenMessage(err) {
  const detail = `${err.spotifyMessage || err.message || ""}`.toLowerCase();

  if (detail.includes("insufficient client scope")) {
    return "Spotify refused the request because your login is missing playlist write permission. Sign out, then sign back in so Spotify can ask for the updated permissions.";
  }

  if (
    detail.includes("user may not be registered") ||
    detail.includes("not registered") ||
    detail.includes("development mode")
  ) {
    return "Spotify refused the request because this app is in Development Mode and this Spotify account is not allowlisted. Add the account under Spotify Developer Dashboard > User Management, or request Extended Quota Mode.";
  }

  return `Spotify refused the playlist save${err.spotifyMessage ? `: ${err.spotifyMessage}` : "."}`;
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { promptId, name, description, trackUris, tracks } = body || {};

  try {
    await connectDB();
    const user = await User.findOne({ spotifyId: session.spotifyId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let promptDoc = null;
    let finalName = name;
    let finalUris = trackUris;

    if (promptId) {
      promptDoc = await Prompt.findOne({ _id: promptId, userId: user._id });
      if (!promptDoc) {
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
      }
      finalName = finalName || promptDoc.playlistName || "Sonata Mix";
      if (!finalUris) {
        finalUris = promptDoc.recommendations
          .map((t) => t.uri)
          .filter(Boolean);
      }
    }

    if (!finalName || !Array.isArray(finalUris) || finalUris.length === 0) {
      return NextResponse.json(
        { error: "Missing playlist name or tracks" },
        { status: 400 }
      );
    }

    const playlist = await withSpotifyRetry(session, (accessToken) =>
      createPlaylist(
        accessToken,
        session.spotifyId,
        finalName,
        description
      )
    );
    if (!playlist?.id) {
      throw new Error(`Playlist created but missing id - full response: ${JSON.stringify(playlist)}`);
    }

    await withSpotifyRetry(session, (accessToken) =>
      addTracksToPlaylist(accessToken, playlist.id, finalUris)
    );

    // Fire-and-forget: generate + upload 2x2 mosaic cover from first 4 album art images.
    const albumArtUrls = (tracks || promptDoc?.recommendations || [])
      .map((t) => t.albumArt)
      .filter(Boolean)
      .slice(0, 4);
    uploadPlaylistCover(session.accessToken, playlist.id, albumArtUrls).catch(() => {});

    if (promptDoc) {
      promptDoc.savedAsPlaylist = true;
      promptDoc.spotifyPlaylistId = playlist.id;
      promptDoc.spotifyPlaylistUrl = playlist.external_urls?.spotify;
      if (Array.isArray(tracks) && tracks.length > 0) {
        promptDoc.recommendations = tracks;
      }
      await promptDoc.save();
    }

    return NextResponse.json({
      playlistId: playlist.id,
      playlistUrl: playlist.external_urls?.spotify,
    });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json(
        { error: "Spotify session expired - please log in again." },
        { status: 401 }
      );
    }

    if (err instanceof SpotifyApiError && err.status === 403) {
      console.warn("Spotify playlist save forbidden:", err.spotifyMessage || err.message);
      return NextResponse.json(
        { error: spotifyForbiddenMessage(err) },
        { status: 403 }
      );
    }

    console.error("/api/playlist failed", err);
    return NextResponse.json({ error: "Playlist save failed" }, { status: 500 });
  }
}
