import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SENSORS = [
  { key: "soilMoisture", label: "Soil Moisture", unit: "%", color: "#62d98b" },
  { key: "temperature", label: "Temperature", unit: "°C", color: "#f4c95d" },
  { key: "humidity", label: "Humidity", unit: "%", color: "#64b5ff" },
  { key: "motion", label: "Motion", unit: "", color: "#ff6b6b" },
];

function Graphs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSensor = searchParams.get("sensor") || "soilMoisture";

  const [activeSensor, setActiveSensor] = useState(
    SENSORS.some((s) => s.key === initialSensor)
      ? initialSensor
      : "soilMoisture"
  );

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE}/api/sensors/history?limit=100`
        );

        if (!response.ok) {
          throw new Error("Failed to load sensor history");
        }

        const result = await response.json();

        if (!cancelled) {
          setReadings(result.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  function selectSensor(key) {
    setActiveSensor(key);
    setSearchParams({ sensor: key });
  }

  const chartData = useMemo(() => {
    return [...readings]
      .reverse()
      .map((reading) => ({
        time: new Date(reading.receivedAt).toLocaleTimeString(),
        value:
          activeSensor === "motion"
            ? reading.motion
              ? 1
              : 0
            : reading[activeSensor],
      }));
  }, [readings, activeSensor]);

  const activeMeta = SENSORS.find((s) => s.key === activeSensor);

  return (
    <section className="dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">HISTORICAL DATA</p>
          <h1>Sensor Graphs</h1>
          <p className="page-description">
            Visualize how your plant's environment has changed over time.
          </p>
        </div>
      </div>

      <div className="graphs-tabs">
        {SENSORS.map((sensor) => (
          <button
            key={sensor.key}
            type="button"
            className={
              sensor.key === activeSensor
                ? "graphs-tab active"
                : "graphs-tab"
            }
            onClick={() => selectSensor(sensor.key)}
          >
            {sensor.label}
          </button>
        ))}
      </div>

      <div className="dashboard-panel graphs-panel">
        {loading && <p className="page-description">Loading history...</p>}

        {!loading && error && (
          <p className="page-description">Couldn't load history: {error}</p>
        )}

        {!loading && !error && chartData.length === 0 && (
          <p className="page-description">No historical data available yet.</p>
        )}

        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="time" stroke="#82958a" fontSize={11} />
              <YAxis stroke="#82958a" fontSize={11} unit={activeMeta.unit} />
              <Tooltip
                contentStyle={{
                  background: "#12221a",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={activeMeta.label}
                stroke={activeMeta.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export default Graphs;
