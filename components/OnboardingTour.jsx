"use client";

import { useState } from "react";
import { FiX, FiArrowRight, FiArrowLeft, FiCheck } from "react-icons/fi";
import { FaSpotify } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useSettingsContext, useUpdateSettings } from "./SettingsContext";

const STEPS = [
  {
    title: "Welcome to Sonata",
    body: "Build Spotify playlists by describing the vibe — moods, eras, activities, anything. Our AI translates it into a 20-track playlist tailored for you.",
    icon: HiSparkles,
  },
  {
    title: "Describe your vibe",
    body: 'Type prompts like "rainy Sunday morning with coffee" or "high-energy gym set from the 2010s". Tap the vibe chips for inspiration or use Fine-tune controls for energy, era, and activity.',
    icon: HiSparkles,
  },
  {
    title: "Refine & save to Spotify",
    body: "After generation, refine the playlist (swap tracks, exclude artists, add ambient vibes) — then save it to your Spotify with one click.",
    icon: FaSpotify,
  },
  {
    title: "Make it your own",
    body: "Visit Settings (your avatar) to enable auto-save to Spotify, customize your accent color, and toggle preview audio. Your past playlists live under Your Music.",
    icon: FiCheck,
  },
];

export default function OnboardingTour() {
  const { settings, ready } = useSettingsContext();
  const update = useUpdateSettings();
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (!ready) return null;
  if (settings.hasCompletedOnboarding) return null;
  if (dismissed) return null;

  const finish = () => {
    setDismissed(true);
    update({ hasCompletedOnboarding: true });
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl p-6"
      >
        <button
          onClick={finish}
          className="absolute top-3 right-3 p-1.5 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"
          aria-label="Skip tour"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-full bg-spotify/15 border border-spotify/40 flex items-center justify-center mb-4">
          <Icon className="text-spotify w-5 h-5" />
        </div>

        <h2 id="onboarding-title" className="text-xl font-semibold text-white mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-neutral-300 leading-relaxed mb-6">
          {current.body}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-spotify"
                    : i < step
                      ? "w-1.5 bg-spotify/60"
                      : "w-1.5 bg-neutral-700"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-200 text-sm hover:bg-neutral-800"
              >
                <FiArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={finish}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-spotify text-black text-sm font-semibold hover:brightness-110"
              >
                <FiCheck className="w-3.5 h-3.5" /> Got it
              </button>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-spotify text-black text-sm font-semibold hover:brightness-110"
              >
                Next <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
