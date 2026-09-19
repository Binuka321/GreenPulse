import { useEffect, useState } from "react";
import { CloudSun, Droplets, Wind, Thermometer } from "lucide-react";

const WEATHER_CODES = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Drizzle",
  55: "Dense drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers",
  81: "Rain showers", 82: "Violent rain showers", 95: "Thunderstorm",
};

function Weather() {
  const [indoorData, setIndoorData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real indoor data
  useEffect(() => {
    const fetchIndoorData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/sensors/latest");
        const json = await response.json();
        if (json.success) setIndoorData(json.data);
      } catch (err) {
        console.error("Failed to fetch indoor data:", err);
      }
    };
    fetchIndoorData();
    const interval = setInterval(fetchIndoorData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch outdoor weather
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Location isn't supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
          );
          if (!response.ok) throw new Error("Weather service unavailable");
          const result = await response.json();
          setWeather(result.current);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location access denied. Enable it to see local weather.");
        setLoading(false);
      }
    );
  }, []);

  const outdoorTemp = weather?.temperature_2m;
  const indoorTemp = indoorData?.temperature;

  const tempGap = outdoorTemp !== undefined && indoorTemp !== undefined && indoorTemp !== null
      ? outdoorTemp - indoorTemp
      : null;

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMART CARE</p>
          <h1>Weather</h1>
          <p className="page-description">View conditions that may affect your plant.</p>
        </div>
      </div>

      {loading && <div className="dashboard-panel"><p className="page-description">Fetching local weather...</p></div>}
      {!loading && error && <div className="dashboard-panel"><p className="page-description">{error}</p></div>}

      {!loading && !error && weather && (
        <>
          <div className="plant-health-card">
            <div className="plant-health-left">
              <div className="plant-image"><CloudSun size={26} /></div>
              <div>
                <p className="small-label">OUTDOOR CONDITIONS</p>
                <h2>{WEATHER_CODES[weather.weather_code] || "Unknown"}</h2>
                <p>
                  {tempGap !== null
                    ? tempGap > 3
                      ? "It's warmer outside than your plant's environment."
                      : tempGap < -3
                        ? "It's cooler outside than your plant's environment."
                        : "Outdoor and indoor temperatures are similar."
                    : "Live sensor data unavailable for comparison."}
                </p>
              </div>
            </div>
            <div className="health-score">
              <div className="score-circle">
                <strong>{Math.round(outdoorTemp)}</strong><span>°C</span>
              </div>
              <span>Current outdoor temp</span>
            </div>
          </div>

          <div className="sensor-grid">
            <WeatherCard icon={<Thermometer />} title="Outdoor Temp" value={outdoorTemp?.toFixed(1)} unit="°C" status="info" />
            <WeatherCard icon={<Droplets />} title="Outdoor Humidity" value={weather.relative_humidity_2m} unit="%" status="info" />
            <WeatherCard icon={<Wind />} title="Wind Speed" value={weather.wind_speed_10m} unit="km/h" status="info" />
            <WeatherCard icon={<Thermometer />} title="Indoor Temp" value={indoorTemp !== null && indoorTemp !== undefined ? indoorTemp.toFixed(1) : "--"} unit="°C" status="success" />
          </div>
        </>
      )}
    </div>
  );
}

function WeatherCard({ icon, title, value, unit, status }) {
  return (
    <div className="sensor-card">
      <div className="sensor-card-top">
        <div className={`sensor-icon ${status}`}>{icon}</div>
        <span className={`sensor-status ${status}`}>{title}</span>
      </div>
      <div className="sensor-value">
        <strong>{value ?? "--"}</strong><span>{unit}</span>
      </div>
      <div className="sensor-footer"><span>Live reading</span></div>
    </div>
  );
}

export default Weather;