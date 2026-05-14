"use client";

import { useSettings, useUpdateSettings } from "../../SettingsContext";
import Toggle from "../controls/Toggle";

export default function PersonalizationTab() {
  const settings = useSettings();
  const update = useUpdateSettings();

  return (
    <div className="divide-y divide-neutral-800">
      <Toggle
        label="AI taste personalization"
        description="Send your top artists & tracks to the AI for tailored recommendations."
        checked={settings.aiTastePersonalization}
        onChange={(v) => update({ aiTastePersonalization: v })}
      />
      <Toggle
        label="Save playlists to Spotify"
        description="Automatically save generated playlists without clicking save."
        checked={settings.autoSaveToSpotify}
        onChange={(v) => update({ autoSaveToSpotify: v })}
      />
      <Toggle
        label="Enable Deezer previews"
        description="Show 30-second preview play buttons. When off, only Spotify links are shown."
        checked={settings.enableDeezerPreviews}
        onChange={(v) => update({ enableDeezerPreviews: v })}
      />
    </div>
  );
}
