import { AlertTriangle, Info, ShieldAlert, CheckCircle2 } from "lucide-react";
import useAlerts from "../hooks/useAlerts";

const ALERT_ICONS = {
  danger: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

function Alerts() {
  const alerts = useAlerts();

  return (
    <div className="dashboard-page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">SYSTEM</p>
          <h1>Alerts</h1>
          <p className="page-description">
            Review important notifications from GreenPulse.
          </p>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">LIVE ALERTS</p>
            <h3>{alerts.length} Active</h3>
          </div>
        </div>

        {alerts.length === 0 && (
          <div className="alerts-empty">
            <CheckCircle2 size={22} />
            <p>Everything looks good. No active alerts right now.</p>
          </div>
        )}

        {alerts.map((alert) => {
          const Icon = ALERT_ICONS[alert.type] || Info;

          return (
            <div className="recommendation" key={alert.id}>
              <div className={`recommendation-icon notification-icon ${alert.type}`}>
                <Icon size={17} />
              </div>

              <div>
                <strong>{alert.title}</strong>
                <p>{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default Alerts;