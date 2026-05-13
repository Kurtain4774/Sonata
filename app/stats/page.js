import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import StatsClient from "@/components/StatsClient";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <main className="min-h-screen">
      <Navbar session={session} />
      <StatsClient />
    </main>
  );
}
