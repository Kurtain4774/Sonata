'use client'

import { motion } from 'framer-motion'
import { FaUser, FaMusic, FaBolt } from 'react-icons/fa'

const cards = [
  {
    icon: FaUser,
    title: 'Taste-Aware',
    description:
      'Sonata learns from your Spotify listening history to recommend tracks you\'ll actually love — not generic top-40 filler.',
  },
  {
    icon: FaMusic,
    title: 'Real Tracks Only',
    description:
      'Every recommendation is a real song on Spotify. No hallucinated artists, no fake tracks, no dead links.',
  },
  {
    icon: FaBolt,
    title: 'One-Click Save',
    description:
      'Love what you hear? Save individual tracks or entire playlists to your Spotify library instantly. No copy-pasting.',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function WhySonata() {
  return (
    <motion.section
      className="bg-[#0a0a0a] py-24 px-6"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#1DB954] uppercase mb-4 px-3.5 py-1.5 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10">
            Why Sonata
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Not Just Another Playlist Generator
          </h2>
        </div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                variants={item}
                className="flex flex-col p-8 rounded-2xl bg-white/[0.05] border border-white/10 border-t-2 border-t-[#1DB954] backdrop-blur-sm hover:bg-white/[0.08] transition-colors"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center mb-5">
                  <Icon className="text-xl text-[#1DB954]" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{card.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
