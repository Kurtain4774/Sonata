import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setPlaybackVolume, SpotifyAuthError } from "@/lib/spotify";

export async function PUT(req) {
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

  const percent = Number(body?.percent);
  if (!Number.isFinite(percent)) {
    return NextResponse.json({ error: "percent required" }, { status: 400 });
  }

  try {
    const result = await setPlaybackVolume(session.accessToken, percent, body?.deviceId);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json(
        { error: "Spotify session expired — please log in again." },
        { status: 401 }
      );
    }
    console.error("/api/playback/volume failed", err);
    return NextResponse.json({ error: "Failed to set volume" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
