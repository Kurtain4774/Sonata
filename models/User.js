import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true, index: true },
  displayName: String,
  email: String,
  profileImage: String,
  accessToken: String,
  refreshToken: String,
  tokenExpiry: Date,
  createdAt: { type: Date, default: Date.now },
  cachedTopGenres: [{ _id: false, name: String, percent: Number }],
  cachedTasteTags: [String],
  cachedTopGenresAt: Date,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
