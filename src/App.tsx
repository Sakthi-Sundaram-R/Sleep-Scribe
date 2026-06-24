import { Routes, Route } from "react-router-dom";
import AuroraBackground from "./components/fx/AuroraBackground";
import StarBackground from "./components/StarBackground";
import CursorGlow from "./components/fx/CursorGlow";
import ScrollProgress from "./components/fx/ScrollProgress";
import GrainOverlay from "./components/fx/GrainOverlay";
import SmoothScroll from "./components/fx/SmoothScroll";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import AppLayout from "./app/AppLayout";
import DashboardHome from "./app/DashboardHome";
import JournalPage from "./app/JournalPage";
import InsightsPage from "./app/InsightsPage";
import SettingsPage from "./app/SettingsPage";

export default function App() {
  return (
    <SmoothScroll>
      <AuroraBackground />
      <StarBackground />
      <CursorGlow />
      <GrainOverlay />
      <ScrollProgress />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </SmoothScroll>
  );
}
