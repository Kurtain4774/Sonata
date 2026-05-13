'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    q: 'Is Sonata free to use?',
    a: 'Yes! Sonata is completely free. You just need a Spotify account to connect and start discovering music.',
  },
  {
    q: 'Do I need Spotify Premium?',
    a: 'No, Sonata works with both free and Premium Spotify accounts. However, Premium users get full track previews and a smoother playback experience.',
  },
  {
    q: 'How does the AI pick songs?',
    a: 'Sonata uses Google Gemini to understand your vibe description, then cross-references it with your Spotify listening history and our music database to find tracks that match both the mood and your personal taste.',
  },
  {
    q: 'What data do you access from my Spotify?',
    a: 'We access your top artists, top tracks, and listening history to build your taste profile. We never post to your account, and we never share your data with third parties.',
  },
  {
    q: 'Will Apple Music be supported?',
    a: "Not yet, but it's on our roadmap. For now, Sonata is built exclusively around the Spotify ecosystem.",
  },
  {
    q: 'Can I share my vibes with friends?',
    a: 'Soon! Community features including public vibe sharing and collaborative playlists are in development.',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const rowVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div variants={rowVariant} className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.04] transition-colors"
      >
        <span className="text-white font-medium pr-4">{faq.q}</span>
        <motion.span
          className="flex-shrink-0 w-7 h-7 rounded-full border border-[#1DB954]/50 bg-[#1DB954]/10 flex items-center justify-center text-[#1DB954] text-lg font-light leading-none"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-neutral-400 text-sm leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQSection() {
  return (
    <motion.section
      className="bg-[#0a0a0a] py-24 px-6"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#1DB954] uppercase mb-4 px-3.5 py-1.5 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <motion.div
          className="flex flex-col gap-3"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {faqs.map((faq) => (
            <FAQItem key={faq.q} faq={faq} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
