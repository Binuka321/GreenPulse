import { useMemo } from "react";
import { Sparkles, Droplets, Thermometer, Wind, Activity } from "lucide-react";
import useDeviceStatus from "../hooks/useDeviceStatus";
import useSettings from "../hooks/useSettings";

function buildTips(reading, online, ranges) {
  const tips = [];

  if (!online || !reading) {
    tips.push({
      id: "offline",
      icon: Activity,
      type: "temperature",
      title: "Waiting for live data",
      message:
        "Once your GreenPulse device reports sensor data, recommendations will appear here.",
    });

    return tips;
  }

  const { soilMoisture, temperature, humidity } = reading;
  const soilRange = ranges.soilMoisture;
  const tempRange = ranges.temperature;
  const humidityRange = ranges.humidity;

  if (soilMoisture < soilRange.min) {
    tips.push({
      id: "soil-low",
      icon: Droplets,
      type: "water",
      title: "Water your plant soon",
      message: `Soil moisture is ${soilMoisture.toFixed(1)}%, below the ideal ${soilRange.min}%. Give it a thorough watering.`,
    });
  } else if (soilMoisture > soilRange.max) {
    tips.push({
      id: "soil-high",
      icon: Droplets,
      type: "water",
      title: "Hold off on watering",
      message: `Soil moisture is ${soilMoisture.toFixed(1)}%, above the ideal ${soilRange.max}%. Let the soil dry out a bit before watering again.`,
    });
  }

  if (temperature > tempRange.max) {
    tips.push({
      id: "temp-high",
      icon: Thermometer,
      type: "temperature",
      title: "Move to a cooler spot",
      message: `Temperature is ${temperature.toFixed(1)}\u00b0C. Consider moving your plant away from direct sunlight or heat sources.`,
    });
  } else if (temperature < tempRange.min) {
    tips.push({
      id: "temp-low",
      icon: Thermometer,
      type: "temperature",
      title: "Protect from cold",
      message: `Temperature is ${temperature.toFixed(1)}\u00b0C, below the ideal minimum. Keep your plant away from cold drafts.`,
    });
  }

  if (humidity < humidityRange.min) {
    tips.push({
      id: "humidity-low",
      icon: Wind,
      type: "temperature",
      title: "Increase humidity",
      message: `Humidity is ${humidity.toFixed(1)}%. Try misting the leaves or using a pebble tray.`,
    });
  } else if (humidity > humidityRange.max) {
    tips.push({
      id: "humidity-high",
      icon: Wind,
      type: "temperature",
      title: "Improve airflow",
      message: `Humidity is ${humidity.toFixed(1)}%. Increase ventilation to prevent mold or root rot.`,
    });
  }

  if (reading.motion) {
    tips.push({
      id: "motion",
      icon: Activity,
      type: "water",
      title: "Motion detected nearby",
      message: "Something moved near your plant recently. Make sure pets or drafts aren't disturbing it.",
    });
  }

  if (tips.length === 0) {
    tips.push({
      id: "all-good",
      icon: Sparkles,
      type: "water",
      title: "Your plant is thriving",
      message: "All readings are within the ideal range. Keep up the great care!",
    });
  }

  return tips;
}

function AICare() {
  const { online, reading } = useDeviceStatus();
  const { ranges } = useSettings();

  const tips = useMemo(
    () => buildTips(reading, online, ranges),
    [reading, online, ranges]
  );

  return (
    <div className="dashboard-page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">SMART CARE</p>
          <h1>AI Care</h1>
          <p className="page-description">
            Get intelligent recommendations for your plant.
          </p>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">INSIGHTS</p>
            <h3>Today's Recommendations</h3>
          </div>

          <Sparkles size={22} />
        </div>

        {tips.map((tip) => {
          const Icon = tip.icon;

          return (
            <div className="recommendation" key={tip.id}>
              <div className={`recommendation-icon ${tip.type}`}>
                <Icon size={17} />
              </div>

              <div>
                <strong>{tip.title}</strong>
                <p>{tip.message}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default AICare;
