'use client'

import { motion } from 'framer-motion'
import { FaPlay } from 'react-icons/fa'

const demoTracks = [
  { title: 'Midnight City', artist: 'M83', duration: '4:03', from: 'from-indigo-500', to: 'to-purple-600' },
  { title: 'Intro', artist: 'The xx', duration: '2:07', from: 'from-slate-500', to: 'to-gray-700' },
  { title: 'Weightless', artist: 'Marconi Union', duration: '5:54', from: 'from-teal-500', to: 'to-cyan-700' },
  { title: 'Breathe', artist: 'Télépopmusik', duration: '4:40', from: 'from-rose-500', to: 'to-orange-600' },
  { title: 'Sunset Lover', artist: 'Petit Biscuit', duration: '3:30', from: 'from-amber-400', to: 'to-yellow-600' },
]

export default function DemoSection() {
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
            Live Preview
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            See It In Action
          </h2>
          <p className="mt-4 text-neutral-400 max-w-xl mx-auto">
            Here's what Sonata returns for a real prompt — personalized to your taste.
          </p>
        </div>

        {/* Demo card */}
        <motion.div
          className="max-w-2xl mx-auto rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
          {/* Prompt bar */}
          <div className="px-6 py-5 border-b border-white/10 bg-white/[0.03]">
            <p className="text-[11px] font-semibold tracking-widest text-[#1DB954] uppercase mb-2">
              Your prompt
            </p>
            <p className="text-white text-sm leading-relaxed">
              "late night coding session — lo-fi beats with ambient synths and minimal vocals"
            </p>
          </div>

          {/* Track list */}
          <div className="divide-y divide-white/[0.06]">
            {demoTracks.map((track, i) => (
              <div
                key={track.title}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.04] transition-colors group"
              >
                {/* Track number */}
                <span className="w-5 text-center text-xs text-neutral-600 group-hover:hidden font-mono">
                  {i + 1}
                </span>
                <button className="w-5 hidden group-hover:flex items-center justify-center text-[#1DB954]">
                  <FaPlay className="text-[10px]" />
                </button>

                {/* Album art placeholder */}
                <div
                  className={`w-9 h-9 rounded-md bg-gradient-to-br ${track.from} ${track.to} flex-shrink-0`}
                />

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{track.title}</p>
                  <p className="text-neutral-500 text-xs truncate">{track.artist}</p>
                </div>

                {/* Duration */}
                <span className="text-neutral-600 text-xs font-mono flex-shrink-0">
                  {track.duration}
                </span>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 border-t border-white/10 text-center">
            <p className="text-neutral-600 text-xs">
              Example only — your results are personalized to your Spotify taste.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
