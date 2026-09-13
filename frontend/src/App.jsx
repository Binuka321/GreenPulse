import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/dashboard";
import PlantMonitor from "./pages/PlantMonitor";
import Watering from "./pages/Watering";
import Weather from "./pages/Weather";
import AICare from "./pages/AICare";
import Alerts from "./pages/Alerts";
import Device from "./pages/Device";
import Settings from "./pages/Settings";
import Graphs from "./pages/Graphs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="plant-monitor" element={<PlantMonitor />} />
          <Route path="watering" element={<Watering />} />
          <Route path="weather" element={<Weather />} />
          <Route path="ai-care" element={<AICare />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="device" element={<Device />} />
          <Route path="settings" element={<Settings />} />
          <Route path="graphs" element={<Graphs />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;