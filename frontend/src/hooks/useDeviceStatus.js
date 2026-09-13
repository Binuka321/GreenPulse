import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Device is considered offline if no reading arrived within this window.
const STALE_AFTER_MS = 30000;
const POLL_INTERVAL_MS = 10000;

function useDeviceStatus() {
  const [status, setStatus] = useState({
    online: false,
    deviceId: null,
    lastSeen: null,
    reading: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      try {
        const response = await fetch(`${API_BASE}/api/sensors/latest`);

        if (!response.ok) {
          throw new Error("No sensor data");
        }

        const result = await response.json();
        const reading = result.data;

        const lastSeen = reading?.receivedAt
          ? new Date(reading.receivedAt)
          : null;

        const online =
          !!lastSeen && Date.now() - lastSeen.getTime() < STALE_AFTER_MS;

        if (!cancelled) {
          setStatus({
            online,
            deviceId: reading?.deviceId ?? null,
            lastSeen,
            reading: reading ?? null,
          });
        }
      } catch {
        if (!cancelled) {
          setStatus({ online: false, deviceId: null, lastSeen: null, reading: null });
        }
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}

export default useDeviceStatus;
