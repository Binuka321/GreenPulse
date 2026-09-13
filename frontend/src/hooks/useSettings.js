import { useEffect, useState } from "react";

const STORAGE_KEY = "greenpulse-settings";
const SETTINGS_EVENT = "greenpulse-settings-changed";

export const DEFAULT_SETTINGS = {
  deviceName: "GREENPULSE-001",
  notifyMotion: true,
  ranges: {
    soilMoisture: { min: 40, max: 70, unit: "%", label: "Soil Moisture" },
    temperature: { min: 18, max: 28, unit: "\u00b0C", label: "Temperature" },
    humidity: { min: 40, max: 70, unit: "%", label: "Humidity" },
  },
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      ranges: {
        soilMoisture: {
          ...DEFAULT_SETTINGS.ranges.soilMoisture,
          ...(parsed.ranges?.soilMoisture || {}),
        },
        temperature: {
          ...DEFAULT_SETTINGS.ranges.temperature,
          ...(parsed.ranges?.temperature || {}),
        },
        humidity: {
          ...DEFAULT_SETTINGS.ranges.humidity,
          ...(parsed.ranges?.humidity || {}),
        },
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    function handleChange() {
      setSettings(loadSettings());
    }

    window.addEventListener(SETTINGS_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener(SETTINGS_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return settings;
}

export default useSettings;
