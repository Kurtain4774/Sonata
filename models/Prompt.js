import mongoose from "mongoose";

const TrackSchema = new mongoose.Schema(
  {
    spotifyTrackId: String,
    uri: String,
    title: String,
    artist: String,
    album: String,
    albumArt: String,
    previewUrl: String,
    spotifyUrl: String,
    durationMs: Number,
    matchScore: Number,
    moodFit: String,
    hidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const ContextSchema = new mongoose.Schema(
  {
    energy: Number,
    decades: [String],
    language: String,
    activity: String,
  },
  { _id: false }
);

const RefinementHistorySchema = new mongoose.Schema(
  {
    followUp: String,
    appliedAt: { type: Date, default: Date.now },
    shortcutsApplied: [String],
    excludedArtists: [String],
  },
  { _id: false }
);

const PromptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  promptText: { type: String, required: true },
  playlistName: String,
  playlistDescription: String,
  context: ContextSchema,
  recommendations: [TrackSchema],
  excludedArtists: { type: [String], default: [] },
  refinementHistory: { type: [RefinementHistorySchema], default: [] },
  savedAsPlaylist: { type: Boolean, default: false },
  sharedToExplore: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  spotifyPlaylistId: String,
  spotifyPlaylistUrl: String,
  createdAt: { type: Date, default: Date.now, index: true },
});

export default mongoose.models.Prompt || mongoose.model("Prompt", PromptSchema);
