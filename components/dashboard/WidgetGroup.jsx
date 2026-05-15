"use client";

import { memo } from "react";
import ErrorBoundary from "../ErrorBoundary";
import RecentHistoryWidget from "./RecentHistoryWidget";
import TrendingMoods from "./TrendingMoods";

function WidgetGroup({ onPickMood, historyData, historyLoading, moodsData, moodsLoading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ErrorBoundary compact label="Recent history">
        <RecentHistoryWidget data={historyData} loading={historyLoading} />
      </ErrorBoundary>
      <ErrorBoundary compact label="Trending moods">
        <TrendingMoods onPickMood={onPickMood} data={moodsData} loading={moodsLoading} />
      </ErrorBoundary>
    </div>
  );
}

export default memo(WidgetGroup);
