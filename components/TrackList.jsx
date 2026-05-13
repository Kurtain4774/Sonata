import TrackCard from "./TrackCard";

export default function TrackList({ tracks, autoplayFirst = false }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {tracks.map((t, i) => (
        <TrackCard key={t.spotifyTrackId} track={t} autoplay={autoplayFirst && i === 0} />
      ))}
    </div>
  );
}
