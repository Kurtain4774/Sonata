import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getActiveDevice, addToQueue, SpotifyAuthError } from "@/lib/spotify";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trackUris } = await req.json();
  if (!Array.isArray(trackUris) || trackUris.length === 0) {
    return NextResponse.json({ error: "trackUris required" }, { status: 400 });
  }

  try {
    const device = await getActiveDevice(session.accessToken);
    if (!device) {
      return NextResponse.json({ error: "NO_ACTIVE_DEVICE" }, { status: 409 });
    }

    for (const uri of trackUris) {
      await addToQueue(session.accessToken, uri);
    }

    return NextResponse.json({ queued: trackUris.length });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "PREMIUM_REQUIRED" || err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "PREMIUM_REQUIRED" }, { status: 403 });
    }
    console.error("Queue error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
