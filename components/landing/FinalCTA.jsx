'use client'

import { motion } from 'framer-motion'
import { signIn, useSession } from 'next-auth/react'
import { FaSpotify } from 'react-icons/fa'

export default function FinalCTA() {
  const { data: session } = useSession()

  const handleCta = () => {
    if (session) {
      window.location.href = '/dashboard'
    } else {
      signIn('spotify', { callbackUrl: '/dashboard' })
    }
  }

  return (
    <motion.section
      className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0d1a0f] to-[#0a0a0a] py-32 px-6 overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Pulsing green glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-25 blur-3xl animate-pulse pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(29,185,84,0.5) 0%, rgba(29,185,84,0.1) 55%, transparent 75%)',
        }}
      />

      {/* Border top accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1DB954]/40 to-transparent" />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.08]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          Your perfect playlist is{' '}
          <span className="text-[#1DB954]">one vibe away.</span>
        </motion.h2>

        <motion.p
          className="mt-6 text-neutral-400 text-lg md:text-xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          Connect your Spotify account and let Sonata handle the rest.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.3 }}
        >
          <button
            onClick={handleCta}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#1DB954] hover:brightness-110 text-black font-semibold text-base shadow-lg shadow-[#1DB954]/30 transition"
          >
            <FaSpotify className="text-xl" />
            Continue with Spotify
          </button>
          <button
            onClick={handleCta}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 backdrop-blur-md font-medium text-base transition"
          >
            <span className="text-[#1DB954]">✨</span> Try an example
          </button>
        </motion.div>
      </div>
    </motion.section>
  )
}
