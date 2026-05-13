"use client";

import { useSettings, useUpdateSettings } from "../../SettingsContext";
import Toggle from "../controls/Toggle";
import Slider from "../controls/Slider";

export default function PlaybackTab() {
  const settings = useSettings();
  const update = useUpdateSettings();

  return (
    <div className="divide-y divide-neutral-800">
      <Toggle
        label="Autoplay previews"
        description="Automatically play the first Deezer preview when new results load."
        checked={settings.autoplayPreviews}
        onChange={(v) => update({ autoplayPreviews: v })}
      />
      <Slider
        label="Default volume"
        description="Default volume for audio previews."
        value={settings.defaultVolume}
        onChange={(v) => update({ defaultVolume: v })}
        min={0}
        max={100}
        valueLabel={`${settings.defaultVolume}%`}
      />
      <Slider
        label="Crossfade"
        description="Smooth transition between preview tracks (seconds)."
        value={settings.crossfadeDuration}
        onChange={(v) => update({ crossfadeDuration: v })}
        min={0}
        max={8}
        step={1}
        valueLabel={settings.crossfadeDuration === 0 ? "Off" : `${settings.crossfadeDuration}s`}
      />
      <Toggle
        label="Explicit content"
        description="Allow songs flagged as explicit in recommendations."
        checked={settings.allowExplicit}
        onChange={(v) => update({ allowExplicit: v })}
      />
    </div>
  );
}
