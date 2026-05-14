"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileMenu from "./ProfileMenu";
import SonataLogo from "./SonataLogo";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/your-music", label: "Your Music" },
  { href: "/stats", label: "Stats" },
  { href: "/explore", label: "Explore" },
];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
      <SonataLogo size={24} />
      <span>
        Son<span className="text-spotify">ata</span>
      </span>
    </Link>
  );
}

export default function Navbar({ session }) {
  const user = session?.user;
  const pathname = usePathname() || "";
  return (
    <header className="border-b border-neutral-900">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="flex items-center gap-6 text-sm">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`relative pb-1 transition-colors ${
                    active ? "text-spotify" : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {n.label}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-[14px] h-[2px] bg-spotify rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
