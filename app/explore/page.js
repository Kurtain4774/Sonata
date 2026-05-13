import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ExploreClient from "@/components/ExploreClient";

export const metadata = {
  title: "Explore — Sonata",
  description: "Discover playlists that other users have shared",
};

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen">
      <Navbar session={session} />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Explore</h1>
          <p className="text-neutral-400 mt-1">
            Vibes other people have been listening to. Click any card to generate your own version.
          </p>
          {!session && (
            <p className="text-sm text-neutral-500 mt-2">
              Sign in to generate a playlist from any vibe.
            </p>
          )}
        </div>
        <ExploreClient />
      </div>
    </main>
  );
}
