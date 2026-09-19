import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplets,
  Thermometer,
  Wind,
  Activity,
  Sprout,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [sensorData, setSensorData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  // Single unified data fetching hook
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sensorRes = await fetch("http://localhost:5000/api/sensors/latest");
        const sensorJson = await sensorRes.json();
        if (sensorJson.success) setSensorData(sensorJson.data);

        const logsRes = await fetch("http://localhost:5000/api/watering");
        const logsJson = await logsRes.json();
        if (logsJson.success) setRecentLogs(logsJson.data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  function goToGraph(sensorKey) {
    navigate(`/graphs?sensor=${sensorKey}`);
  }

  // Dynamic Health Score & Status Calculation
  let healthScore = "--";
  let healthTitle = "Waiting for data";
  let healthDesc = "Please inject sensor data from Node-RED.";
  let status = "healthy"; 
  let headerText = "feeling good."; // Declared safely here

  if (sensorData) {
    healthScore = 100;
    let issues = 0;

    if (sensorData.soilMoisture < 40 || sensorData.soilMoisture > 85) issues++;
    if (sensorData.temperature < 15 || sensorData.temperature > 30) issues++;

    if (issues === 0) {
      healthTitle = "Looking Great";
      healthDesc = "Your environmental conditions are currently within a healthy range.";
      status = "healthy";
      headerText = "feeling good.";
    } else if (issues === 1) {
      healthScore = 75;
      healthTitle = "Needs Attention";
      healthDesc = "One of your environmental factors is outside the ideal range.";
      status = "warning";
      headerText = "needing attention.";
    } else {
      healthScore = 45;
      healthTitle = "Critical Condition";
      healthDesc = "Multiple factors are dangerous. Immediate action required.";
      status = "danger";
      headerText = "at risk!";
    }
  }

  return (
    <div className="dashboard-page">

      {/* Page heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">GOOD MORNING</p>

          <h1>
            Your plant is
            <span style={{
              color: status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#62d98b'
            }}> {headerText}</span>
          </h1>

          <p className="page-description">
            Here's what's happening with your plant today.
          </p>
        </div>

        <div className="date-card">
          <span>DEVICE</span>
          <strong>GREENPULSE-001</strong>
        </div>
      </div>

      {/* Main status */}
      <div className="plant-health-card" style={{
        borderColor: status === 'danger' ? 'rgba(239, 68, 68, 0.4)' : status === 'warning' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(98, 217, 139, 0.2)'
      }}>
        <div className="plant-health-left">
          <div className="plant-image" style={{
            background: status === 'danger' ? 'rgba(239, 68, 68, 0.1)' : status === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(98, 217, 139, 0.1)',
            color: status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#62d98b'
          }}>🌿</div>
          <div>
            <p className="small-label">PLANT HEALTH</p>
            <h2>{healthTitle}</h2>
            <p>{healthDesc}</p>
          </div>
        </div>

        <div className="health-score">
          <div className="score-circle" style={{
            borderColor: status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#62d98b',
            color: status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#62d98b'
          }}>
            <strong>{healthScore}</strong>
            <span>/100</span>
          </div>
          <span>Health Score</span>
        </div>
      </div>


      {/* Sensor cards */}
      <div className="section-header">

        <div>
          <p className="eyebrow">LIVE SENSORS</p>
          <h2>Current Environment</h2>
        </div>

        <span className="live-indicator">
          <i></i>
          Live data
        </span>

      </div>


      <div className="sensor-grid">

        <SensorCard
          icon={<Droplets />}
          title="Soil Moisture"
          value={sensorData ? sensorData.soilMoisture : "--"}
          unit="%"
          status={sensorData && sensorData.soilMoisture < 40 ? "Needs Water" : "Good"}
          type={sensorData && sensorData.soilMoisture < 40 ? "danger" : "success"}
          onClick={() => goToGraph("soilMoisture")}
        />

        <SensorCard
          icon={<Thermometer />}
          title="Temperature"
          value={sensorData ? sensorData.temperature : "--"}
          unit="°C"
          status={sensorData && sensorData.temperature > 30 ? "Warm" : "Good"}
          type={sensorData && sensorData.temperature > 30 ? "warning" : "success"}
          onClick={() => goToGraph("temperature")}
        />

        <SensorCard
          icon={<Wind />}
          title="Humidity"
          value={sensorData ? sensorData.humidity : "--"}
          unit="%"
          status="Good"
          type="success"
          onClick={() => goToGraph("humidity")}
        />

        <SensorCard
          icon={<Activity />}
          title="Motion"
          value={sensorData && sensorData.motion ? "Detected" : "Clear"}
          unit=""
          status={sensorData && sensorData.motion ? "Activity detected" : "No activity"}
          type="info"
          onClick={() => goToGraph("motion")}
        />

      </div>


      {/* Bottom section */}
      <div className="dashboard-columns">

        {/* Quick care */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">PLANT CARE</p>
              <h3>Live Recommendations</h3>
            </div>
            <Sprout size={22} />
          </div>

          {sensorData && sensorData.soilMoisture < 40 && (
            <div className="recommendation">
              <div className="recommendation-icon water">💧</div>
              <div>
                <strong>Water your plant</strong>
                <p>Soil moisture is critically low at {sensorData.soilMoisture}%. AI predicts the plant needs water.</p>
              </div>
            </div>
          )}

          {sensorData && sensorData.temperature > 30 && (
            <div className="recommendation">
              <div className="recommendation-icon temperature">☀️</div>
              <div>
                <strong>Temperature is high</strong>
                <p>Current reading is {sensorData.temperature}°C. Consider moving away from direct heat.</p>
              </div>
            </div>
          )}

          {sensorData && sensorData.soilMoisture >= 40 && sensorData.temperature <= 30 && (
            <div style={{ padding: '20px' }}>
              <p>Conditions are optimal. No action required.</p>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">SYSTEM</p>
              <h3>Recent Watering</h3>
            </div>
          </div>

          <div className="activity-list">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <ActivityItem
                  key={log._id}
                  time={new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  title="Plant Watered"
                  description="Watering event logged in database"
                />
              ))
            ) : (
              <p style={{ padding: '20px' }}>No recent activity.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}


function SensorCard({
  icon,
  title,
  value,
  unit,
  status,
  type,
  trend,
  down,
  onClick,
}) {
  return (
    <button
      type="button"
      className="sensor-card"
      onClick={onClick}
    >

      <div className="sensor-card-top">

        <div className={`sensor-icon ${type}`}>
          {icon}
        </div>

        <span className={`sensor-status ${type}`}>
          {status}
        </span>

      </div>

      <div className="sensor-value">

        <strong>{value}</strong>

        <span>{unit}</span>

      </div>

      <div className="sensor-footer">

        <span>Live reading</span>

        <span className={down ? "trend down" : "trend"}>
          {down ? (
            <ArrowDownRight size={14} />
          ) : (
            <ArrowUpRight size={14} />
          )}

          {trend}
        </span>

      </div>

    </button>
  );
}


function ActivityItem({ time, title, description }) {
  return (
    <div className="activity-item">

      <div className="activity-line">
        <div className="activity-dot"></div>
      </div>

      <div className="activity-content">

        <div className="activity-top">
          <strong>{title}</strong>
          <span>{time}</span>
        </div>

        <p>{description}</p>

      </div>

    </div>
  );
}


export default Dashboard;