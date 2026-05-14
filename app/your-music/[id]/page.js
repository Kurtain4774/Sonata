import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import Navbar from "@/components/Navbar";
import PlaylistDetailClient from "@/components/playlist-detail/PlaylistDetailClient";
import { mapPromptPlaylistDetail } from "@/lib/promptMappers";

export const dynamic = "force-dynamic";

export default async function PlaylistDetail({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  if (!user) notFound();

  const doc = await Prompt.findOne({ _id: id, userId: user._id }).lean();
  if (!doc) notFound();

  const playlist = mapPromptPlaylistDetail(doc);

  return (
    <main className="min-h-screen bg-neutral-950">
      <Navbar session={session} />
      <PlaylistDetailClient playlist={playlist} />
    </main>
  );
}
