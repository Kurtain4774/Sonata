"use client";

import { useEffect, useState } from "react";
import { FaMusic, FaHeart, FaFire, FaWaveSquare } from "react-icons/fa";
import { FiClock } from "react-icons/fi";

function formatHours(ms) {
  if (!ms) return "0h";
  const total = Math.floor(ms / (60 * 1000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m}m`;
  return `${h}h ${m}m`;
}

const Tile = ({ icon, iconBg, label, value, sub, subTone = "spotify" }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-[11px] text-neutral-400 truncate">{label}</div>
      <div className="text-lg font-semibold leading-tight truncate">{value}</div>
      <div className={`text-[11px] ${subTone === "spotify" ? "text-spotify" : "text-neutral-500"} truncate`}>
        {sub}
      </div>
    </div>
  </div>
);

export default function StatTiles() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/stats/summary")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const d = data || {
    playlistsGenerated: 0,
    playlistsGeneratedThisWeek: 0,
    savedPlaylists: 0,
    savedPlaylistsThisWeek: 0,
    topGenre: { name: "—", percent: 0 },
    listeningStreak: { current: 0, best: 0 },
    timeListened: { totalMs: 0, weekMs: 0 },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <Tile
        icon={<FaMusic className="text-spotify" />}
        iconBg="bg-spotify/10"
        label="Playlists Generated"
        value={d.playlistsGenerated}
        sub={`+${d.playlistsGeneratedThisWeek} this week`}
      />
      <Tile
        icon={<FaHeart className="text-pink-400" />}
        iconBg="bg-pink-500/10"
        label="Saved Playlists"
        value={d.savedPlaylists}
        sub={`+${d.savedPlaylistsThisWeek} this week`}
      />
      <Tile
        icon={<FaWaveSquare className="text-amber-400" />}
        iconBg="bg-amber-500/10"
        label="Top Genre"
        value={d.topGenre?.name || "—"}
        sub={d.topGenre?.percent ? `${d.topGenre.percent}% of your listening` : "Not enough data"}
        subTone="neutral"
      />
      <Tile
        icon={<FaFire className="text-orange-400" />}
        iconBg="bg-orange-500/10"
        label="Listening Streak"
        value={`${d.listeningStreak?.current || 0} days`}
        sub={`Best: ${d.listeningStreak?.best || 0} days`}
        subTone="neutral"
      />
      <Tile
        icon={<FiClock className="text-spotify" />}
        iconBg="bg-spotify/10"
        label="Time Listened"
        value={formatHours(d.timeListened?.totalMs || 0)}
        sub={`+${formatHours(d.timeListened?.weekMs || 0)} this week`}
      />
    </div>
  );
}
