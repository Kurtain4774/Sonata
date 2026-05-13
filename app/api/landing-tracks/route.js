import { NextResponse } from "next/server";
import { searchTrackPublic } from "@/lib/spotifyApp";
import { SAMPLE_TRACKS } from "@/components/landing/tracks";

export const revalidate = 3600;

export async function GET() {
  try {
    const enriched = await Promise.all(
      SAMPLE_TRACKS.map(async (seed) => {
        const found = await searchTrackPublic(seed.title, seed.artist).catch(() => null);
        return {
          ...seed,
          albumArtUrl: found?.albumArt || seed.albumArtUrl || null,
          resolvedAlbum: found?.album || seed.album,
        };
      })
    );
    return NextResponse.json({ tracks: enriched });
  } catch (e) {
    return NextResponse.json({ tracks: SAMPLE_TRACKS, error: e.message }, { status: 200 });
  }
}
