import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import {
  addTracksToPlaylist,
  removeTracksFromPlaylist,
  replacePlaylistTracks,
  SpotifyAuthError,
} from "@/lib/spotify";

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

  const {
    removeUris,
    appendTracks,
    replaceMap,
    refinement,
    replaceAll,
  } = body || {};

  try {
    await connectDB();
    const user = await User.findOne({ spotifyId: session.spotifyId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const doc = await Prompt.findOne({ _id: id, userId: user._id });
    if (!doc) return NextResponse.json({ error: "Playlist not found" }, { status: 404 });

    let recs = doc.recommendations.map((t) => t.toObject ? t.toObject() : t);

    if (Array.isArray(replaceAll)) {
      recs = replaceAll;
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
        if (Array.isArray(replaceAll) || replaceMap) {
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

    return NextResponse.json({ ok: true, recommendations: recs });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json({ error: "Spotify session expired" }, { status: 401 });
    }
    console.error("PATCH /api/playlist/[id]/tracks failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
