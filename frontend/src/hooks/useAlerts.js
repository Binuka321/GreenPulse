import { useMemo } from "react";
import useDeviceStatus from "./useDeviceStatus";
import useSettings from "./useSettings";

function buildAlerts(reading, online, settings) {
  const alerts = [];

  if (!online) {
    alerts.push({
      id: "device-offline",
      type: "danger",
      title: "Device offline",
      message: "GreenPulse hasn't reported new sensor data recently.",
      time: "Now",
    });
  }

  if (reading) {
    for (const [key, range] of Object.entries(settings.ranges)) {
      const value = reading[key];

      if (value === null || value === undefined) continue;

      if (value < range.min) {
        alerts.push({
          id: `${key}-low`,
          type: "warning",
          title: `${range.label} is low`,
          message: `${range.label} is ${value.toFixed(1)}${range.unit}, below the ideal ${range.min}${range.unit}.`,
          time: "Live",
        });
      } else if (value > range.max) {
        alerts.push({
          id: `${key}-high`,
          type: "warning",
          title: `${range.label} is high`,
          message: `${range.label} is ${value.toFixed(1)}${range.unit}, above the ideal ${range.max}${range.unit}.`,
          time: "Live",
        });
      }
    }

    if (reading.motion && settings.notifyMotion) {
      alerts.push({
        id: "motion",
        type: "info",
        title: "Motion detected",
        message: "Movement was detected near your plant.",
        time: "Live",
      });
    }
  }

  return alerts;
}

function useAlerts() {
  const { online, reading } = useDeviceStatus();
  const settings = useSettings();

  return useMemo(
    () => buildAlerts(reading, online, settings),
    [reading, online, settings]
  );
}

export default useAlerts;
