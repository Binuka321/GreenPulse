import { useEffect, useState } from "react";
import { Droplets, Plus } from "lucide-react";
import useDeviceStatus from "../hooks/useDeviceStatus";
import useSettings from "../hooks/useSettings";

const LOG_KEY = "greenpulse-watering-log";

function loadLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLog(log) {
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function Watering() {
  const { reading } = useDeviceStatus();
  const { ranges } = useSettings();
  const [log, setLog] = useState(loadLog);

  useEffect(() => {
    saveLog(log);
  }, [log]);

  function logWatering() {
    const entry = { id: Date.now(), timestamp: new Date().toISOString() };
    setLog((prev) => [entry, ...prev].slice(0, 20));
  }

  const soil = reading?.soilMoisture;
  const soilRange = ranges.soilMoisture;

  const needsWater = soil !== undefined && soil !== null && soil < soilRange.min;

  const lastWatered = log[0];

  return (
    <div className="dashboard-page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">SMART CARE</p>
          <h1>Watering</h1>
          <p className="page-description">
            Manage watering needs and keep your plant hydrated.
          </p>
        </div>
      </div>

      <div className="plant-health-card">
        <div className="plant-health-left">
          <div className="plant-image">💧</div>

          <div>
            <p className="small-label">SOIL MOISTURE</p>
            <h2>
              {soil !== undefined && soil !== null
                ? `${Math.round(soil)}%`
                : "No data"}
            </h2>
            <p>
              {needsWater
                ? `Soil moisture is below the ideal ${soilRange.min}% threshold. Your plant needs water.`
                : "Soil moisture is within a healthy range."}
            </p>
          </div>
        </div>

        <div className="health-score">
          <div className="score-circle">
            <strong>{needsWater ? "!" : "OK"}</strong>
            <span>{needsWater ? "Needs Water" : "Good"}</span>
          </div>
          <span>
            {lastWatered
              ? `Last watered ${timeAgo(lastWatered.timestamp)}`
              : "No watering logged yet"}
          </span>
        </div>
      </div>

      <div className="section-header">
        <div>
          <p className="eyebrow">HISTORY</p>
          <h2>Watering Log</h2>
        </div>

        <button type="button" className="graphs-tab active" onClick={logWatering}>
          <Plus size={14} style={{ marginRight: 6 }} />
          Log watering
        </button>
      </div>

      <div className="dashboard-panel">
        {log.length === 0 && (
          <p className="page-description">
            You haven't logged any watering yet. Use the button above after
            you water your plant.
          </p>
        )}

        <div className="activity-list">
          {log.map((entry) => (
            <div className="activity-item" key={entry.id}>
              <div className="activity-line">
                <div className="activity-dot"></div>
              </div>

              <div className="activity-content">
                <div className="activity-top">
                  <strong>
                    <Droplets size={13} style={{ marginRight: 6 }} />
                    Watered
                  </strong>
                  <span>{timeAgo(entry.timestamp)}</span>
                </div>
                <p>{new Date(entry.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Watering;
