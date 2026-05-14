import mongoose from "mongoose";

const PlayHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  trackId: { type: String, required: true },
  playedAt: { type: Date, required: true },
  durationMs: { type: Number, default: 0 },
  title: String,
  artist: String,
});

PlayHistorySchema.index({ userId: 1, playedAt: -1 }, { unique: true });
PlayHistorySchema.index({ playedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export default mongoose.models.PlayHistory || mongoose.model("PlayHistory", PlayHistorySchema);
