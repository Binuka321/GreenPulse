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

  function goToGraph(sensorKey) {
    navigate(`/graphs?sensor=${sensorKey}`);
  }


  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/sensors/latest");
        const json = await response.json();
        if (json.success) {
          setSensorData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch sensor data:", error);
      }
    };

    fetchLatestData();
    const interval = setInterval(fetchLatestData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page">

      {/* Page heading */}
      <div className="page-heading">

        <div>
          <p className="eyebrow">GOOD MORNING</p>

          <h1>
            Your plant is
            <span> feeling good.</span>
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
      <div className="plant-health-card">

        <div className="plant-health-left">

          <div className="plant-image">
            🌿
          </div>

          <div>
            <p className="small-label">PLANT HEALTH</p>

            <h2>
              Looking Great
            </h2>

            <p>
              Your environmental conditions are currently
              within a healthy range.
            </p>
          </div>

        </div>

        <div className="health-score">

          <div className="score-circle">
            <strong>86</strong>
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
              <h3>Today's Recommendations</h3>
            </div>

            <Sprout size={22} />

          </div>

          <div className="recommendation">

            <div className="recommendation-icon water">
              💧
            </div>

            <div>
              <strong>Water your plant</strong>

              <p>
                Soil moisture is below the recommended
                threshold. Your plant may need water.
              </p>
            </div>

            <ArrowUpRight size={18} />

          </div>


          <div className="recommendation">

            <div className="recommendation-icon temperature">
              ☀️
            </div>

            <div>
              <strong>Temperature is warm</strong>

              <p>
                Consider moving your plant away from
                direct afternoon sunlight.
              </p>
            </div>

            <ArrowUpRight size={18} />

          </div>

        </div>


        {/* Activity */}
        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <p className="eyebrow">SYSTEM</p>
              <h3>Recent Activity</h3>
            </div>

          </div>

          <div className="activity-list">

            <ActivityItem
              time="Just now"
              title="Sensor data received"
              description="ESP32 sent new environmental readings"
            />

            <ActivityItem
              time="3 min ago"
              title="Motion detected"
              description="Movement detected near your plant"
            />

            <ActivityItem
              time="8 min ago"
              title="MQTT connected"
              description="GreenPulse device connected successfully"
            />

            <ActivityItem
              time="12 min ago"
              title="System started"
              description="GreenPulse monitoring started"
            />

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