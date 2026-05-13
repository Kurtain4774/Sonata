import TrackCard from "./TrackCard";

export default function TrackList({ tracks }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {tracks.map((t) => (
        <TrackCard key={t.spotifyTrackId} track={t} />
      ))}
    </div>
  );
}
