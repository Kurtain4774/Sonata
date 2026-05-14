import TrackCard from "./TrackCard";

export default function TrackList({
  tracks,
  autoplayFirst = false,
  onExcludeArtist,
  onExcludeSong,
  onSwap,
  onBuildAround,
  swappingKey = null,
  getTrackKey,
}) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {tracks.map((t, i) => {
        const key = getTrackKey ? getTrackKey(t) : null;
        return (
          <TrackCard
            key={t.spotifyTrackId || `${t.title}-${t.artist}-${i}`}
            track={t}
            autoplay={autoplayFirst && i === 0}
            onExcludeArtist={onExcludeArtist}
            onExcludeSong={onExcludeSong}
            onSwap={onSwap}
            onBuildAround={onBuildAround}
            swapping={swappingKey != null && key === swappingKey}
          />
        );
      })}
    </div>
  );
}
