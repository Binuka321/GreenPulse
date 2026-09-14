import { useEffect, useState } from "react";
import { Droplets, Plus } from "lucide-react";

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
  const [sensorData, setSensorData] = useState(null);
  const [wateringLogs, setWateringLogs] = useState([]);

  // Fetch live sensor data and AI prediction
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/sensors/latest");
        const json = await response.json();
        if (json.success) setSensorData(json.data);
      } catch (error) {
        console.error("Failed to fetch sensor data:", error);
      }
    };
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real watering history from MongoDB
  const fetchLogs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/watering");
      const json = await response.json();
      if (json.success) setWateringLogs(json.data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Post new watering event to MongoDB
  const logWatering = async () => {
    try {
      await fetch("http://localhost:5000/api/watering", { method: "POST" });
      fetchLogs(); // Refresh the list instantly after saving
    } catch (error) {
      console.error("Failed to save log:", error);
    }
  };

  const soil = sensorData?.soilMoisture;
  const predictedHours = sensorData?.predictedHours;
  const needsWater = soil !== undefined && soil !== null && soil < 40;

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMART CARE</p>
          <h1>Watering</h1>
          <p className="page-description">Manage watering needs and keep your plant hydrated.</p>
        </div>
      </div>

      <div className="plant-health-card">
        <div className="plant-health-left">
          <div className="plant-image">💧</div>
          <div>
            <p className="small-label">LIVE SOIL MOISTURE</p>
            <h2>{soil !== undefined && soil !== null ? `${Math.round(soil)}%` : "--"}</h2>
            <p>
              {needsWater
                ? "Soil moisture is below the ideal 40% threshold. Your plant needs water."
                : "Soil moisture is within a healthy range."}
            </p>
          </div>
        </div>

        <div className="health-score">
          <div className="score-circle">
            <strong>{predictedHours !== undefined && predictedHours !== null ? `${predictedHours}h` : "--"}</strong>
            <span style={{ fontSize: '11px' }}>Until Dry</span>
          </div>
          <span>AI Forecast</span>
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
        {wateringLogs.length === 0 ? (
          <p className="page-description" style={{ padding: "20px" }}>
            Database watering history will appear here once connected.
          </p>
        ) : (
          <div className="activity-list">
            {wateringLogs.map((entry) => (
              <div className="activity-item" key={entry._id}>
                <div className="activity-line"><div className="activity-dot"></div></div>
                <div className="activity-content">
                  <div className="activity-top">
                    <strong><Droplets size={13} style={{ marginRight: 6 }} />Watered</strong>
                    <span>{timeAgo(entry.timestamp)}</span>
                  </div>
                  <p>{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watering;