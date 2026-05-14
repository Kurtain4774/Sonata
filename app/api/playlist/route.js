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
import { jsonError, jsonOk, readJsonBody, requireApiSession, spotifySessionExpiredResponse } from "@/lib/api";

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
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const { promptId, name, description, trackUris, tracks } = body || {};

  try {
    await connectDB();
    const user = await User.findOne({ spotifyId: session.spotifyId });
    if (!user) return jsonError("User not found", 404);

    let promptDoc = null;
    let finalName = name;
    let finalUris = trackUris;

    if (promptId) {
      promptDoc = await Prompt.findOne({ _id: promptId, userId: user._id });
      if (!promptDoc) {
        return jsonError("Prompt not found", 404);
      }
      finalName = finalName || promptDoc.playlistName || "Sonata Mix";
      if (!finalUris) {
        finalUris = promptDoc.recommendations
          .map((t) => t.uri)
          .filter(Boolean);
      }
    }

    if (!finalName || !Array.isArray(finalUris) || finalUris.length === 0) {
      return jsonError("Missing playlist name or tracks", 400);
    }

    const playlist = await withSpotifyRetry(session, (accessToken) =>
      createPlaylist(accessToken, finalName, description)
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

    return jsonOk({
      playlistId: playlist.id,
      playlistUrl: playlist.external_urls?.spotify,
    });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse("Spotify session expired - please log in again.");
    }

    if (err instanceof SpotifyApiError && err.status === 403) {
      console.warn("Spotify playlist save forbidden:", err.spotifyMessage || err.message);
      return jsonError(spotifyForbiddenMessage(err), 403);
    }

    console.error("/api/playlist failed", err);
    return jsonError("Playlist save failed", 500);
  }
}
