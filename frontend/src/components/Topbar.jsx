import {
  Search,
  Bell,
  Wifi,
  ChevronDown,
} from "lucide-react";

function Topbar() {
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
        <div className="connection-status">
          <div className="connection-dot"></div>

          <Wifi size={16} />

          <span>Connected</span>
        </div>

        {/* Notifications */}
        <button className="notification-button">
          <Bell size={19} />
          <span className="notification-badge">2</span>
        </button>

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