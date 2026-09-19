import { useNavigate } from "react-router-dom";
import { Wifi, WifiOff, ChevronDown } from "lucide-react";

import useDeviceStatus from "../hooks/useDeviceStatus";

function Topbar() {
  const { online } = useDeviceStatus();
  const navigate = useNavigate();

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
        {/* Connection */}
        <div className={online ? "connection-status" : "connection-status offline"}>
          <div className={online ? "connection-dot" : "connection-dot offline"}></div>
          {online ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>{online ? "Connected" : "Offline"}</span>
        </div>

        {/* User Profile */}
        <div className="profile">
          <div className="profile-avatar">GP</div>
          <div className="profile-info">
            <strong>GreenPulse</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;