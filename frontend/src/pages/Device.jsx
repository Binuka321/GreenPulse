import { useEffect, useState } from "react";
import { Cpu, Database, RefreshCcw, Router, Clock } from "lucide-react";
import useDeviceStatus from "../hooks/useDeviceStatus";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function timeAgo(date) {
  if (!date) return "Never";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function Device() {
  const { online, deviceId, lastSeen } = useDeviceStatus();
  const [health, setHealth] = useState(null);
  const [mqttInfo, setMqttInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    setLoading(true);

    try {
      const [healthRes, mqttRes] = await Promise.all([
        fetch(`${API_BASE}/api/health`),
        fetch(`${API_BASE}/api/mqtt/status`),
      ]);

      setHealth(healthRes.ok ? await healthRes.json() : null);
      setMqttInfo(mqttRes.ok ? await mqttRes.json() : null);
    } catch {
      setHealth(null);
      setMqttInfo(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">SYSTEM</p>
          <h1>Device</h1>
          <p className="page-description">
            Check the connection and status of your GreenPulse device.
          </p>
        </div>

        <button type="button" className="graphs-tab" onClick={loadStatus}>
          <RefreshCcw size={14} style={{ marginRight: 6 }} />
          Refresh
        </button>
      </div>

      <div className="plant-health-card">
        <div className="plant-health-left">
          <div className="plant-image">
            <Cpu size={26} />
          </div>

          <div>
            <p className="small-label">DEVICE ID</p>
            <h2>{deviceId || "No device detected"}</h2>
            <p>
              {online
                ? "Device is online and sending live sensor data."
                : "No sensor data has been received from a device yet. Check power and Wi-Fi."}
            </p>
          </div>
        </div>

        <div className="health-score">
          <div className="score-circle">
            <strong>{online ? "OK" : "!"}</strong>
            <span>{online ? "Online" : "Offline"}</span>
          </div>
          <span>Last seen {timeAgo(lastSeen)}</span>
        </div>
      </div>

      <div className="section-header">
        <div>
          <p className="eyebrow">CONNECTIONS</p>
          <h2>System Status</h2>
        </div>

        <span className="live-indicator">
          <i></i>
          {loading ? "Checking..." : "Updated"}
        </span>
      </div>

      <div className="sensor-grid">
        <StatusCard
          icon={<Cpu />}
          title="Backend"
          status={health?.backend === "online" ? "success" : "danger"}
          label={health?.backend === "online" ? "Online" : "Unreachable"}
        />

        <StatusCard
          icon={<Router />}
          title="MQTT Broker"
          status={mqttInfo?.connected ? "success" : "danger"}
          label={mqttInfo?.connected ? "Connected" : "Disconnected"}
        />

        <StatusCard
          icon={<Database />}
          title="Database"
          status={health?.mongodb === "connected" ? "success" : "danger"}
          label={health?.mongodb === "connected" ? "Connected" : "Disconnected"}
        />

        <StatusCard
          icon={<Clock />}
          title="Last Reading"
          status={online ? "success" : "warning"}
          label={timeAgo(lastSeen)}
        />
      </div>

      {mqttInfo && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">MQTT</p>
              <h3>Broker Details</h3>
            </div>
          </div>

          <div className="settings-field">
            <label>Broker</label>
            <input type="text" value={mqttInfo.broker || ""} readOnly />
          </div>

          <div className="settings-field">
            <label>Topic</label>
            <input type="text" value={mqttInfo.topic || ""} readOnly />
          </div>
        </div>
      )}

    </div>
  );
}

function StatusCard({ icon, title, status, label }) {
  return (
    <div className="sensor-card">
      <div className="sensor-card-top">
        <div className={`sensor-icon ${status}`}>{icon}</div>
        <span className={`sensor-status ${status}`}>{title}</span>
      </div>

      <div className="sensor-value">
        <strong>{label}</strong>
      </div>

      <div className="sensor-footer">
        <span>Live status</span>
      </div>
    </div>
  );
}

export default Device;
