export function promptThumbnails(recommendations = []) {
  return recommendations
    .slice(0, 5)
    .map((track) => track.albumArt)
    .filter(Boolean);
}

export function mapPromptSummary(prompt, { includeTracks = false, includeSpotifyUrl = true } = {}) {
  const recommendations = prompt.recommendations || [];
  const summary = {
    id: prompt._id.toString(),
    promptText: prompt.promptText,
    playlistName: prompt.playlistName,
    trackCount: recommendations.length,
    thumbnails: promptThumbnails(recommendations),
    savedAsPlaylist: prompt.savedAsPlaylist,
    createdAt: prompt.createdAt,
  };

  if (includeSpotifyUrl) {
    summary.spotifyPlaylistUrl = prompt.spotifyPlaylistUrl;
  }

  if (includeTracks) {
    summary.tracks = recommendations.map((track) => ({
      uri: track.uri || null,
      title: track.title,
      artist: track.artist,
      albumArt: track.albumArt || null,
    }));
  }

  return summary;
}

export function mapPromptApiDetail(prompt) {
  return {
    id: prompt._id.toString(),
    promptText: prompt.promptText,
    playlistName: prompt.playlistName,
    tracks: prompt.recommendations || [],
    savedAsPlaylist: prompt.savedAsPlaylist,
    spotifyPlaylistId: prompt.spotifyPlaylistId,
    spotifyPlaylistUrl: prompt.spotifyPlaylistUrl,
    createdAt: prompt.createdAt,
  };
}

export function mapPromptPlaylistDetail(prompt) {
  return {
    _id: prompt._id.toString(),
    promptText: prompt.promptText,
    playlistName: prompt.playlistName || prompt.promptText,
    playlistDescription: prompt.playlistDescription || "",
    createdAt: prompt.createdAt,
    savedAsPlaylist: !!prompt.savedAsPlaylist,
    spotifyPlaylistUrl: prompt.spotifyPlaylistUrl || null,
    excludedArtists: prompt.excludedArtists || [],
    refinementHistory: (prompt.refinementHistory || []).map((entry) => ({
      followUp: entry.followUp,
      shortcutsApplied: entry.shortcutsApplied || [],
      excludedArtists: entry.excludedArtists || [],
      appliedAt: entry.appliedAt,
    })),
    recommendations: (prompt.recommendations || []).map((track) => ({
      spotifyTrackId: track.spotifyTrackId,
      uri: track.uri,
      title: track.title,
      artist: track.artist,
      album: track.album || null,
      albumArt: track.albumArt,
      previewUrl: track.previewUrl,
      spotifyUrl: track.spotifyUrl,
      durationMs: track.durationMs ?? null,
      matchScore: track.matchScore ?? null,
      moodFit: track.moodFit || null,
    })),
  };
}
