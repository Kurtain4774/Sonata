"use client";

import { useEffect, useState } from "react";

// Loads the three independent dashboard widget payloads (stats, history, moods).
// Each resolves on its own so a slow or failed section never blocks the others.
export function useDashboardData() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [moods, setMoods] = useState(null);
  const [moodsLoading, setMoodsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = (url, setData, setLoading) => {
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!active) return;
          setData(d?.data ?? null);
          setLoading(false);
        })
        .catch(() => {
          if (active) setLoading(false);
        });
    };
    load("/api/dashboard/stats", setStats, setStatsLoading);
    load("/api/dashboard/history", setHistory, setHistoryLoading);
    load("/api/dashboard/moods", setMoods, setMoodsLoading);
    return () => {
      active = false;
    };
  }, []);

  return { stats, statsLoading, history, historyLoading, moods, moodsLoading };
}
