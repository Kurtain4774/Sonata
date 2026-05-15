"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "Is Sonata free to use?",
    a: "Yes. Connect a Spotify account and you can generate, preview, refine, and save playlists.",
  },
  {
    q: "Do I need Spotify Premium?",
    a: "No. Free accounts can generate and save playlists. Premium improves playback controls inside the app.",
  },
  {
    q: "How does Sonata pick songs?",
    a: "Sonata uses your prompt, optional taste personalization, Gemini, Spotify matching, and preview fallback data to find real tracks.",
  },
  {
    q: "What Spotify data do you access?",
    a: "Sonata reads profile, top artists, top tracks, recent plays, playlists, and playback state when needed. It only writes playlists when you save.",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const rowVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={rowVariant}
      className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden"
    >
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
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-neutral-400 text-sm leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <motion.section
      className="bg-[#0a0a0a] py-20 px-6"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#1DB954] uppercase mb-4 px-3.5 py-1.5 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Questions, Answered
          </h2>
        </div>

        <motion.div
          className="flex flex-col gap-3"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {faqs.map((faq) => (
            <FAQItem key={faq.q} faq={faq} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
