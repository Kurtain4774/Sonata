import mongoose from "mongoose";

const ArtistGenreSchema = new mongoose.Schema({
  spotifyArtistId: { type: String, required: true, unique: true, index: true },
  name: String,
  genre: { type: String, required: true },
  classifiedAt: { type: Date, default: Date.now },
});

export default mongoose.models.ArtistGenre
  || mongoose.model("ArtistGenre", ArtistGenreSchema);
