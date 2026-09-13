import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplets,
  Thermometer,
  Wind,
  Activity,
  Sprout,
  RefreshCcw,
} from "lucide-react";
import useSettings from "../hooks/useSettings";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function statusForValue(range, value) {
  if (value === null || value === undefined) return "info";
  if (value < range.min || value > range.max) return "danger";

  const span = range.max - range.min;
  const nearEdge = span * 0.15;

  if (value < range.min + nearEdge || value > range.max - nearEdge) {
    return "warning";
  }

  return "success";
}

function PlantMonitor() {
  const navigate = useNavigate();
  const { ranges } = useSettings();

  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadLatest() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/sensors/latest`);

      if (!response.ok) {
        throw new Error("No sensor data received yet");
      }

      const result = await response.json();
      setLatest(result.data);
    } catch (err) {
      setError(err.message);
      setLatest(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLatest();
    const interval = setInterval(loadLatest, 15000);
    return () => clearInterval(interval);
  }, []);

  const soilStatus = useMemo(
    () => statusForValue(ranges.soilMoisture, latest?.soilMoisture),
    [latest, ranges]
  );
  const tempStatus = useMemo(
    () => statusForValue(ranges.temperature, latest?.temperature),
    [latest, ranges]
  );
  const humidityStatus = useMemo(
    () => statusForValue(ranges.humidity, latest?.humidity),
    [latest, ranges]
  );

  const overallHealthy =
    latest &&
    soilStatus === "success" &&
    tempStatus === "success" &&
    humidityStatus === "success";

  return (
    <div className="dashboard-page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Plant Monitor</h1>
          <p className="page-description">
            Track your plant's health and environmental conditions.
          </p>
        </div>

        <button
          type="button"
          className="graphs-tab"
          onClick={loadLatest}
        >
          <RefreshCcw size={14} style={{ marginRight: 6 }} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="dashboard-panel" style={{ marginBottom: 20 }}>
          <p className="page-description">
            Couldn't load live data: {error}. Showing no readings yet.
          </p>
        </div>
      )}

      <div className="plant-health-card">
        <div className="plant-health-left">
          <div className="plant-image">🌿</div>

          <div>
            <p className="small-label">PLANT STATUS</p>
            <h2>
              {loading
                ? "Checking..."
                : latest?.plantStatus || "No data yet"}
            </h2>
            <p>
              {overallHealthy
                ? "Your environmental conditions are currently within a healthy range."
                : "Some readings are outside the ideal range for your plant."}
            </p>
          </div>
        </div>

        <div className="health-score">
          <div className="score-circle">
            <strong>{latest?.motion ? "!" : "OK"}</strong>
            <span>{latest?.motion ? "Motion" : "Still"}</span>
          </div>
          <span>Motion Sensor</span>
        </div>
      </div>

      <div className="section-header">
        <div>
          <p className="eyebrow">LIVE SENSORS</p>
          <h2>Current Environment</h2>
        </div>

        <span className="live-indicator">
          <i></i>
          {latest ? "Live data" : "Waiting for data"}
        </span>
      </div>

      <div className="sensor-grid">
        <SensorCard
          icon={<Droplets />}
          title="Soil Moisture"
          value={latest ? Math.round(latest.soilMoisture) : "--"}
          unit="%"
          status={soilStatus}
          onClick={() => navigate("/graphs?sensor=soilMoisture")}
        />

        <SensorCard
          icon={<Thermometer />}
          title="Temperature"
          value={latest ? latest.temperature.toFixed(1) : "--"}
          unit="°C"
          status={tempStatus}
          onClick={() => navigate("/graphs?sensor=temperature")}
        />

        <SensorCard
          icon={<Wind />}
          title="Humidity"
          value={latest ? latest.humidity.toFixed(1) : "--"}
          unit="%"
          status={humidityStatus}
          onClick={() => navigate("/graphs?sensor=humidity")}
        />

        <SensorCard
          icon={<Activity />}
          title="Motion"
          value={latest ? (latest.motion ? "Detected" : "None") : "--"}
          unit=""
          status={latest?.motion ? "info" : "success"}
          onClick={() => navigate("/graphs?sensor=motion")}
        />
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">HEALTHY RANGES</p>
            <h3>Ideal Conditions</h3>
          </div>

          <Sprout size={22} />
        </div>

        <RangeRow
          label="Soil Moisture"
          value={latest?.soilMoisture}
          range={ranges.soilMoisture}
        />

        <RangeRow
          label="Temperature"
          value={latest?.temperature}
          range={ranges.temperature}
        />

        <RangeRow
          label="Humidity"
          value={latest?.humidity}
          range={ranges.humidity}
        />
      </div>

    </div>
  );
}

function SensorCard({ icon, title, value, unit, status, onClick }) {
  return (
    <button type="button" className="sensor-card" onClick={onClick}>
      <div className="sensor-card-top">
        <div className={`sensor-icon ${status}`}>{icon}</div>
        <span className={`sensor-status ${status}`}>{title}</span>
      </div>

      <div className="sensor-value">
        <strong>{value}</strong>
        <span>{unit}</span>
      </div>

      <div className="sensor-footer">
        <span>Live reading</span>
        <span>Tap for history</span>
      </div>
    </button>
  );
}

function RangeRow({ label, value, range }) {
  const clamped =
    value === null || value === undefined
      ? 0
      : Math.min(100, Math.max(0, ((value - range.min) / (range.max - range.min)) * 100));

  const inRange =
    value !== null && value !== undefined && value >= range.min && value <= range.max;

  return (
    <div className="range-row">
      <div className="range-row-top">
        <strong>{label}</strong>
        <span>
          {value === null || value === undefined ? "--" : value.toFixed(1)}
          {range.unit} · Ideal {range.min}-{range.max}
          {range.unit}
        </span>
      </div>

      <div className="range-track">
        <div
          className={inRange ? "range-fill" : "range-fill out-of-range"}
          style={{ width: `${clamped}%` }}
        ></div>
      </div>
    </div>
  );
}

export default PlantMonitor;
