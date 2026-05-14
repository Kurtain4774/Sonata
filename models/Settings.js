import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    autoplayPreviews: { type: Boolean, default: false },
    defaultVolume: { type: Number, default: 70, min: 0, max: 100 },
    crossfadeDuration: { type: Number, default: 0, min: 0, max: 8 },
    allowExplicit: { type: Boolean, default: true },
    aiTastePersonalization: { type: Boolean, default: true },
    autoSaveToSpotify: { type: Boolean, default: false },
    enableDeezerPreviews: { type: Boolean, default: true },
    hasCompletedOnboarding: { type: Boolean, default: false },
    theme: { type: String, enum: ["dark", "system", "light"], default: "dark" },
    accentColor: { type: String, default: "green" },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
