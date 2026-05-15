"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBarChart2, FiDisc, FiHome } from "react-icons/fi";
import ProfileMenu from "./ProfileMenu";
import SonataLogo from "./SonataLogo";

const NAV = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: FiHome },
  { href: "/your-music", label: "Your Music", short: "Library", icon: FiDisc },
  { href: "/stats", label: "Stats", short: "Stats", icon: FiBarChart2 },
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
    <>
      <header className="border-b border-neutral-900">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6 text-sm">
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

      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-xl px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="grid grid-cols-3 gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-spotify/15 text-spotify"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{n.short}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
