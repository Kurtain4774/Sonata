import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import { updatePlaylistDetails, SpotifyAuthError } from "@/lib/spotify";
import { jsonError, jsonOk, readJsonBody, requireApiSession, spotifySessionExpiredResponse } from "@/lib/api";

export async function PATCH(req, { params }) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { id } = await params;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const { playlistName, playlistDescription, excludedArtists } = body || {};

  try {
    await connectDB();
    const user = await User.findOne({ spotifyId: session.spotifyId });
    if (!user) return jsonError("User not found", 404);

    const doc = await Prompt.findOne({ _id: id, userId: user._id });
    if (!doc) return jsonError("Playlist not found", 404);

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

    return jsonOk({ ok: true, playlist: doc });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse("Spotify session expired");
    }
    console.error("PATCH /api/playlist/[id] failed", err);
    return jsonError("Update failed", 500);
  }
}

export async function DELETE(req, { params }) {
  const { session, response } = await requireApiSession();
  if (response) return response;
  const { id } = await params;
  try {
    await connectDB();
    const user = await User.findOne({ spotifyId: session.spotifyId });
    if (!user) return jsonError("User not found", 404);
    const res = await Prompt.deleteOne({ _id: id, userId: user._id });
    if (res.deletedCount === 0) {
      return jsonError("Playlist not found", 404);
    }
    return jsonOk({ ok: true });
  } catch (err) {
    console.error("DELETE /api/playlist/[id] failed", err);
    return jsonError("Delete failed", 500);
  }
}
