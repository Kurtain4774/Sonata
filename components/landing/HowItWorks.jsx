'use client'

import { motion } from 'framer-motion'
import { FaCommentAlt, FaMusic, FaSpotify } from 'react-icons/fa'

const steps = [
  {
    number: '01',
    icon: FaCommentAlt,
    title: 'Describe Your Vibe',
    description:
      'Tell Sonata what you\'re in the mood for using plain English. Be as specific or abstract as you want.',
  },
  {
    number: '02',
    icon: FaMusic,
    title: 'Get Matched Tracks',
    description:
      'Our AI analyzes your prompt and taste profile to find real tracks that match your vibe perfectly.',
  },
  {
    number: '03',
    icon: FaSpotify,
    title: 'Save & Listen',
    description:
      'Preview tracks instantly, then save your favorites or the entire playlist directly to Spotify with one click.',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
}

const item = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

export default function HowItWorks() {
  return (
    <motion.section
      className="bg-[#0a0a0a] py-24 px-6"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Labels */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#1DB954] uppercase mb-4 px-3.5 py-1.5 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10">
            Simple as 1-2-3
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <motion.div
          className="relative grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px border-t border-dashed border-white/20 z-0" />

          {steps.map((step) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                variants={item}
                className="relative z-10 flex flex-col items-center text-center p-8 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm"
              >
                {/* Number badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/40 text-[#1DB954] text-xs font-bold tracking-widest">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mt-3 w-14 h-14 rounded-2xl bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center mb-5">
                  <Icon className="text-2xl text-[#1DB954]" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
