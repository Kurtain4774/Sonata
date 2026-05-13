"use client";

import { useSettings, useUpdateSettings } from "../../SettingsContext";
import Toggle from "../controls/Toggle";
import Select from "../controls/Select";
import { LANGUAGE_OPTIONS, REGION_OPTIONS } from "@/lib/settings";

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
      <Select
        label="Language preference"
        description="Bias the AI toward songs in a particular language."
        value={settings.languagePreference}
        onChange={(v) => update({ languagePreference: v })}
        options={LANGUAGE_OPTIONS}
      />
      <Select
        label="Region"
        description="Bias the AI toward music from a particular region."
        value={settings.regionPreference}
        onChange={(v) => update({ regionPreference: v })}
        options={REGION_OPTIONS}
      />
    </div>
  );
}
