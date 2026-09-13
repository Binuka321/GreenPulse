import { useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import useSettings, { DEFAULT_SETTINGS, saveSettings } from "../hooks/useSettings";

function Settings() {
  const settings = useSettings();
  const [form, setForm] = useState(settings);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function updateRange(key, field, value) {
    setForm((prev) => ({
      ...prev,
      ranges: {
        ...prev.ranges,
        [key]: {
          ...prev.ranges[key],
          [field]: Number(value),
        },
      },
    }));
  }

  function handleSave(event) {
    event.preventDefault();
    saveSettings(form);
    setSavedMessage("Settings saved.");
    setTimeout(() => setSavedMessage(""), 2500);
  }

  function handleReset() {
    setForm(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setSavedMessage("Settings reset to defaults.");
    setTimeout(() => setSavedMessage(""), 2500);
  }

  return (
    <div className="dashboard-page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">SYSTEM</p>
          <h1>Settings</h1>
          <p className="page-description">
            Customize your GreenPulse monitoring preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">DEVICE</p>
              <h3>General</h3>
            </div>
          </div>

          <div className="settings-field">
            <label htmlFor="deviceName">Device name</label>
            <input
              id="deviceName"
              type="text"
              value={form.deviceName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, deviceName: e.target.value }))
              }
            />
          </div>

          <div className="settings-field settings-toggle">
            <label htmlFor="notifyMotion">Notify on motion detection</label>
            <input
              id="notifyMotion"
              type="checkbox"
              checked={form.notifyMotion}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  notifyMotion: e.target.checked,
                }))
              }
            />
          </div>
        </div>

        <div className="dashboard-panel" style={{ marginTop: 20 }}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">THRESHOLDS</p>
              <h3>Healthy Ranges</h3>
            </div>
          </div>

          {Object.entries(form.ranges).map(([key, range]) => (
            <div className="settings-range-row" key={key}>
              <strong>{range.label}</strong>

              <div className="settings-range-inputs">
                <label>
                  Min
                  <input
                    type="number"
                    value={range.min}
                    onChange={(e) => updateRange(key, "min", e.target.value)}
                  />
                </label>

                <label>
                  Max
                  <input
                    type="number"
                    value={range.max}
                    onChange={(e) => updateRange(key, "max", e.target.value)}
                  />
                </label>

                <span className="settings-unit">{range.unit}</span>
              </div>
            </div>
          ))}

          <div className="settings-actions">
            <button type="button" className="graphs-tab" onClick={handleReset}>
              <RotateCcw size={14} style={{ marginRight: 6 }} />
              Reset to defaults
            </button>

            <button type="submit" className="graphs-tab active">
              <Save size={14} style={{ marginRight: 6 }} />
              Save changes
            </button>
          </div>

          {savedMessage && <p className="settings-saved">{savedMessage}</p>}
        </div>
      </form>

    </div>
  );
}

export default Settings;
