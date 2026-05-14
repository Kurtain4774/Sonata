import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import {
  addTracksToPlaylist,
  removeTracksFromPlaylist,
  replacePlaylistTracks,
  SpotifyAuthError,
} from "@/lib/spotify";
import { jsonError, jsonOk, readJsonBody, requireApiSession, spotifySessionExpiredResponse } from "@/lib/api";

export async function PATCH(req, { params }) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { id } = await params;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const {
    removeUris,
    appendTracks,
    replaceMap,
    refinement,
    replaceAll,
    reorderUris,
  } = body || {};

  try {
    await connectDB();
    const user = await User.findOne({ spotifyId: session.spotifyId });
    if (!user) return jsonError("User not found", 404);

    const doc = await Prompt.findOne({ _id: id, userId: user._id });
    if (!doc) return jsonError("Playlist not found", 404);

    let recs = doc.recommendations.map((t) => t.toObject ? t.toObject() : t);

    if (Array.isArray(replaceAll)) {
      recs = replaceAll;
    } else if (Array.isArray(reorderUris)) {
      const byUri = new Map(recs.map((t) => [t.uri, t]));
      const reordered = [];
      const seen = new Set();
      for (const uri of reorderUris) {
        const t = byUri.get(uri);
        if (t && !seen.has(uri)) {
          reordered.push(t);
          seen.add(uri);
        }
      }
      for (const t of recs) {
        if (t.uri && !seen.has(t.uri)) reordered.push(t);
      }
      recs = reordered;
    } else {
      if (Array.isArray(removeUris) && removeUris.length) {
        const set = new Set(removeUris);
        recs = recs.filter((t) => !set.has(t.uri));
      }
      if (replaceMap && typeof replaceMap === "object") {
        recs = recs.map((t) => (replaceMap[t.uri] ? replaceMap[t.uri] : t));
      }
      if (Array.isArray(appendTracks) && appendTracks.length) {
        const existing = new Set(recs.map((t) => t.uri).filter(Boolean));
        for (const tr of appendTracks) {
          if (tr?.uri && !existing.has(tr.uri)) {
            recs.push(tr);
            existing.add(tr.uri);
          }
        }
      }
    }

    doc.recommendations = recs;

    if (refinement && typeof refinement === "object") {
      doc.refinementHistory.push({
        followUp: String(refinement.followUp || "").slice(0, 500),
        shortcutsApplied: Array.isArray(refinement.shortcutsApplied)
          ? refinement.shortcutsApplied.slice(0, 20)
          : [],
        excludedArtists: Array.isArray(refinement.excludedArtists)
          ? refinement.excludedArtists.slice(0, 50)
          : [],
        appliedAt: new Date(),
      });
    }

    await doc.save();

    if (doc.savedAsPlaylist && doc.spotifyPlaylistId) {
      try {
        if (Array.isArray(replaceAll) || replaceMap || Array.isArray(reorderUris)) {
          const uris = recs.map((t) => t.uri).filter(Boolean);
          await replacePlaylistTracks(session.accessToken, doc.spotifyPlaylistId, uris);
        } else {
          if (Array.isArray(removeUris) && removeUris.length) {
            await removeTracksFromPlaylist(session.accessToken, doc.spotifyPlaylistId, removeUris);
          }
          if (Array.isArray(appendTracks) && appendTracks.length) {
            const uris = appendTracks.map((t) => t.uri).filter(Boolean);
            if (uris.length) {
              await addTracksToPlaylist(session.accessToken, doc.spotifyPlaylistId, uris);
            }
          }
        }
      } catch (err) {
        console.warn("Spotify playlist sync failed:", err?.message || err);
      }
    }

    return jsonOk({ ok: true, recommendations: recs });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse("Spotify session expired");
    }
    console.error("PATCH /api/playlist/[id]/tracks failed", err);
    return jsonError("Update failed", 500);
  }
}
