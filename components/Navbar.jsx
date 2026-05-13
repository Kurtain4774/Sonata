import Link from "next/link";
import AuthButton from "./AuthButton";

export default function Navbar({ session }) {
  const user = session?.user;
  return (
    <header className="border-b border-neutral-900">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            Sound<span className="text-spotify">Sage</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-300">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/history" className="hover:text-white">History</Link>
            <Link href="/stats" className="hover:text-white">Stats</Link>
            <Link href="/explore" className="hover:text-white">Explore</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user?.image && (
            <img
              src={user.image}
              alt={user.name || "user"}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="hidden sm:inline text-sm text-neutral-300">
            {user?.name}
          </span>
          <AuthButton variant="logout" />
        </div>
      </div>
    </header>
  );
}
