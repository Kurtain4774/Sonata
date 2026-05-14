"use client";

import { memo } from "react";
import ErrorBoundary from "../ErrorBoundary";
import RecentHistoryWidget from "./RecentHistoryWidget";
import TrendingMoods from "./TrendingMoods";
import CommunityPicks from "./CommunityPicks";

function WidgetGroup({ onPickMood, historyData, historyLoading, exploreData, exploreLoading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ErrorBoundary compact label="Recent history">
        <RecentHistoryWidget data={historyData} loading={historyLoading} />
      </ErrorBoundary>
      <ErrorBoundary compact label="Trending moods">
        <TrendingMoods onPickMood={onPickMood} />
      </ErrorBoundary>
      <ErrorBoundary compact label="Community picks">
        <CommunityPicks data={exploreData} loading={exploreLoading} />
      </ErrorBoundary>
    </div>
  );
}

export default memo(WidgetGroup);
