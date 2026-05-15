"use client";

import { memo } from "react";
import Link from "next/link";
import { HiSparkles } from "react-icons/hi";
import LoadingSpinner from "./LoadingSpinner";

function ListeningInsights({ data, loading }) {
  if (loading && !data) {
    return (
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <HiSparkles className="text-spotify" />
          <h3 className="text-sm font-semibold">Your Listening Insights</h3>
        </div>
        <LoadingSpinner label="Analyzing your top genres…" />
      </section>
    );
  }

  const topGenres = data?.topGenres || [];
  const dominant = topGenres[0];

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashShown = dominant ? (dominant.percent / 100) * circumference : 0;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiSparkles className="text-spotify" />
          <h3 className="text-sm font-semibold">Your Listening Insights</h3>
        </div>
        <Link href="/stats" className="text-xs text-neutral-400 hover:text-white">
          View full stats
        </Link>
      </div>

      <div className="text-xs text-neutral-400 mb-2">Top Genres</div>
      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <ul className="space-y-1.5">
          {topGenres.length === 0 && (
            <li className="text-xs text-neutral-500">Not enough listening data yet.</li>
          )}
          {topGenres.map((g) => (
            <li key={g.name}>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="truncate">{g.name}</span>
                <span className="text-neutral-400 tabular-nums">{g.percent}%</span>
              </div>
              <div className="h-1 bg-neutral-800 rounded">
                <div
                  className="h-full rounded bg-spotify"
                  style={{ width: `${Math.min(100, g.percent)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="relative">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke="#262626"
              strokeWidth="10"
            />
            {dominant && (
              <circle
                cx="55"
                cy="55"
                r={radius}
                fill="none"
                stroke="#1DB954"
                strokeWidth="10"
                strokeDasharray={`${dashShown} ${circumference}`}
                strokeDashoffset={circumference / 4}
                transform="rotate(-90 55 55)"
                strokeLinecap="round"
              />
            )}
          </svg>
          {dominant && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-base font-bold text-spotify leading-none">
                {dominant.percent}%
              </div>
              <div className="text-[9px] text-neutral-400 max-w-[80px] text-center mt-0.5 leading-tight">
                {dominant.name}
              </div>
              <div className="text-[8px] text-neutral-500">Your top genre</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(ListeningInsights);
