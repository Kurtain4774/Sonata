import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import Navbar from "@/components/Navbar";
import YourMusicClient from "@/components/YourMusicClient";
import { mapPromptSummary } from "@/lib/promptMappers";

export const dynamic = "force-dynamic";

export default async function YourMusicPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  const prompts = user
    ? await Prompt.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    : [];

  const items = prompts.map((prompt) =>
    mapPromptSummary(prompt, { includeTracks: true, includeSpotifyUrl: false })
  );

  return (
    <main className="min-h-screen">
      <Navbar session={session} />
      <div className="max-w-3xl mx-auto px-6 py-10 pb-28 md:pb-10">
        <YourMusicClient generated={items} />
      </div>
    </main>
  );
}
