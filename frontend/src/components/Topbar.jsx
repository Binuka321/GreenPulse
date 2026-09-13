import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Wifi,
  WifiOff,
  ChevronDown,
  AlertTriangle,
  Info,
  ShieldAlert,
} from "lucide-react";

import useDeviceStatus from "../hooks/useDeviceStatus";
import useAlerts from "../hooks/useAlerts";

const ALERT_ICONS = {
  danger: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

function Topbar() {
  const { online } = useDeviceStatus();
  const alerts = useAlerts();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  function handleViewAll() {
    setNotificationsOpen(false);
    navigate("/alerts");
  }

  return (
    <header className="topbar">

      <div className="topbar-left">

        <div className="breadcrumb">
          <span>GreenPulse</span>
          <span>/</span>
          <strong>Smart Plant Care</strong>
        </div>

      </div>

      <div className="topbar-right">

        {/* Search */}
        <button className="icon-button">
          <Search size={19} />
        </button>

        {/* Connection */}
        <div className={online ? "connection-status" : "connection-status offline"}>
          <div className={online ? "connection-dot" : "connection-dot offline"}></div>

          {online ? <Wifi size={16} /> : <WifiOff size={16} />}

          <span>{online ? "Connected" : "Offline"}</span>
        </div>

        {/* Notifications */}
        <div className="notification-wrapper">
          <button
            type="button"
            className="notification-button"
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell size={19} />
            {alerts.length > 0 && (
              <span className="notification-badge">{alerts.length}</span>
            )}
          </button>

          {notificationsOpen && (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <strong>Notifications</strong>
                <span>{alerts.length} active</span>
              </div>

              <div className="notification-list">
                {alerts.length === 0 && (
                  <p className="notification-empty">
                    You're all caught up. No alerts right now.
                  </p>
                )}

                {alerts.map((alert) => {
                  const Icon = ALERT_ICONS[alert.type] || Info;

                  return (
                    <div className="notification-item" key={alert.id}>
                      <div className={`notification-icon ${alert.type}`}>
                        <Icon size={15} />
                      </div>

                      <div>
                        <strong>{alert.title}</strong>
                        <p>{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="notification-view-all"
                onClick={handleViewAll}
              >
                View all alerts
              </button>
            </div>
          )}
        </div>

        {/* User */}
        <div className="profile">

          <div className="profile-avatar">
            GP
          </div>

          <div className="profile-info">
            <strong>GreenPulse</strong>
            <span>Administrator</span>
          </div>

          <ChevronDown size={16} />

        </div>

      </div>

    </header>
  );
}


export default Topbar;