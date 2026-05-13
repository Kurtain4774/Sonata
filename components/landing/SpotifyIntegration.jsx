'use client'

import { motion } from 'framer-motion'
import { FaSpotify, FaBrain, FaHeadphones, FaChevronRight } from 'react-icons/fa'

const nodes = [
  { icon: FaSpotify, label: 'Your Spotify Library', color: 'from-[#1DB954]/20 to-[#1DB954]/5' },
  { icon: FaBrain, label: 'Sonata AI Engine', color: 'from-purple-500/20 to-purple-500/5' },
  { icon: FaHeadphones, label: 'Personalized Vibes', color: 'from-blue-500/20 to-blue-500/5' },
  { icon: FaSpotify, label: 'Saved to Spotify', color: 'from-[#1DB954]/20 to-[#1DB954]/5' },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
}

const nodeVariant = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function SpotifyIntegration() {
  return (
    <motion.section
      className="relative bg-[#0a0a0a] py-24 px-6 overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Background green radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(29,185,84,0.4) 0%, rgba(29,185,84,0.08) 50%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#1DB954] uppercase mb-4 px-3.5 py-1.5 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10">
            Spotify Integration
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Deeply Integrated with Spotify
          </h2>
          <p className="mt-5 text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Sonata connects securely to your Spotify account to understand your taste. We analyze
            your top artists, genres, and listening patterns to deliver recommendations that feel
            like they were made just for you.
          </p>
        </div>

        {/* Flow diagram */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {nodes.map((node, i) => {
            const Icon = node.icon
            return (
              <div key={node.label} className="flex flex-col md:flex-row items-center">
                {/* Node card */}
                <motion.div
                  variants={nodeVariant}
                  className={`flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-gradient-to-b ${node.color} border border-white/10 backdrop-blur-sm w-44 text-center`}
                >
                  <div className="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center">
                    <Icon className="text-xl text-[#1DB954]" />
                  </div>
                  <p className="text-white text-xs font-medium leading-snug">{node.label}</p>
                </motion.div>

                {/* Connector arrow — shown between nodes */}
                {i < nodes.length - 1 && (
                  <div className="flex flex-col md:flex-row items-center mx-2 my-2 md:my-0 text-[#1DB954]/40">
                    <div className="hidden md:block w-10 border-t border-dashed border-[#1DB954]/30" />
                    <FaChevronRight className="text-[#1DB954]/50 text-xs rotate-90 md:rotate-0" />
                    <div className="hidden md:block w-10 border-t border-dashed border-[#1DB954]/30" />
                  </div>
                )}
              </div>
            )
          })}
        </motion.div>

        {/* Privacy note */}
        <motion.p
          className="mt-10 text-center text-neutral-600 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          🔒 We only read your listening data. We never modify your library without your permission.
        </motion.p>
      </div>
    </motion.section>
  )
}
