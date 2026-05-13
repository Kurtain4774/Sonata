import Link from 'next/link'
import { FaTwitter, FaDiscord, FaGithub } from 'react-icons/fa'

const navLinks = [
  { label: 'About', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Contact', href: '#' },
]

const socials = [
  { icon: FaTwitter, label: 'Twitter', href: '#' },
  { icon: FaDiscord, label: 'Discord', href: '#' },
  { icon: FaGithub, label: 'GitHub', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Top row: logo + nav links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1DB954] to-emerald-700 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="4" width="2.5" height="8" rx="1.25" fill="white" />
                <rect x="6.5" y="2" width="2.5" height="12" rx="1.25" fill="white" />
                <rect x="11" y="5" width="2.5" height="7" rx="1.25" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Sonata</span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-neutral-500 hover:text-white text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.07] mb-10" />

        {/* Middle row: socials + attribution */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          {/* Social icons */}
          <div className="flex items-center gap-4">
            {socials.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.05] flex items-center justify-center text-neutral-500 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all"
              >
                <Icon className="text-sm" />
              </Link>
            ))}
          </div>

          {/* Attribution */}
          <p className="text-neutral-600 text-sm text-center md:text-right">
            Built for music lovers. Backed by AI.{' '}
            <span className="text-neutral-700">· Spotify · Google Gemini</span>
          </p>
        </div>

        {/* Bottom row: copyright */}
        <div className="text-center">
          <p className="text-neutral-700 text-xs">© 2026 Sonata. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
