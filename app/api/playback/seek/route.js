import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { seekPlayback, SpotifyAuthError } from "@/lib/spotify";

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

  const positionMs = Number(body?.positionMs);
  if (!Number.isFinite(positionMs)) {
    return NextResponse.json({ error: "positionMs required" }, { status: 400 });
  }

  try {
    const result = await seekPlayback(session.accessToken, positionMs);
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
    console.error("/api/playback/seek failed", err);
    return NextResponse.json({ error: "Failed to seek" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
