import { FaSpotify } from "react-icons/fa";
import AudioPreview from "./AudioPreview";

export default function TrackCard({ track, autoplay = false }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
      {track.albumArt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.albumArt}
          alt=""
          className="w-14 h-14 rounded object-cover"
        />
      ) : (
        <div className="w-14 h-14 rounded bg-neutral-800" />
      )}
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{track.title}</div>
        <div className="truncate text-sm text-neutral-400">{track.artist}</div>
      </div>
      <AudioPreview
        url={track.previewUrl}
        spotifyUrl={track.spotifyUrl}
        uri={track.uri}
        title={track.title}
        artist={track.artist}
        albumArt={track.albumArt}
        autoplay={autoplay}
      />
      {track.spotifyUrl && (
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="text-neutral-400 hover:text-spotify"
          title="Open in Spotify"
        >
          <FaSpotify className="text-xl" />
        </a>
      )}
    </div>
  );
}
