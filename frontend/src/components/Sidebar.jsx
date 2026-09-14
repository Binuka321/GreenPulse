import { NavLink } from "react-router-dom";

import useDeviceStatus from "../hooks/useDeviceStatus";

import {
  LayoutDashboard,
  Sprout,
  Droplets,
  CloudSun,
  Sparkles,
  Bell,
  Cpu,
  Settings,
  Leaf,
  ChevronRight,
  LineChart,
} from "lucide-react";

const menuItems = [
  {
    section: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
      // {
      //   name: "Plant Monitor",
      //   path: "/plant-monitor",
      //   icon: Sprout,
      // },
      {
        name: "Graphs",
        path: "/graphs",
        icon: LineChart,
      },
    ],
  },
  {
    section: "SMART CARE",
    items: [
      {
        name: "Watering",
        path: "/watering",
        icon: Droplets,
      },
      {
        name: "Weather",
        path: "/weather",
        icon: CloudSun,
      },
      {
        name: "AI Care",
        path: "/ai-care",
        icon: Sparkles,
      },
    ],
  },
  // {
  //   section: "SYSTEM",
  //   items: [
  //     {
  //       name: "Alerts",
  //       path: "/alerts",
  //       icon: Bell,
  //     },
  //     // {
  //     //   name: "Device",
  //     //   path: "/device",
  //     //   icon: Cpu,
  //     // },
  //     // {
  //     //   name: "Settings",
  //     //   path: "/settings",
  //     //   icon: Settings,
  //     // },
  //   ],
  // },
];

function Sidebar() {
  const { online, deviceId } = useDeviceStatus();

  return (
    <aside className="sidebar">

{/* Logo */}
<div className="brand">
  <div className="brand-icon">
    <img
      src="/GreenPulse Smart Plant Logo.png"
      alt="GreenPulse logo"
    />
  </div>

  <div>
    <div className="brand-name ">GreenPulse</div>
    <div className="brand-subtitle">SMART PLANT CARE</div>
  </div>
</div>


      {/* Device status */}
      <div className="device-status-card">
        <div className={online ? "status-dot" : "status-dot offline"}></div>

        <div className="device-status-text">
          <strong>{deviceId || "GREENPULSE-001"}</strong>
          <span className={online ? "" : "offline-text"}>
            {online ? "Device Online" : "Device Offline"}
          </span>
        </div>

      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((section) => (
          <div className="nav-section" key={section.section}>

            <div className="nav-section-title">
              {section.section}
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={19} />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom plant card */}
      {/* <div className="sidebar-bottom-card">

        <div className="mini-plant">
          🌱
        </div>

        <div>
          <strong>My Plant</strong>
          <span>Healthy & Growing</span>
        </div>

      </div> */}

    </aside>
  );
}

export default Sidebar;