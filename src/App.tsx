import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import VideoBackground from "./components/fx/VideoBackground";
import StarBackground from "./components/StarBackground";
import CursorGlow from "./components/fx/CursorGlow";
import ScrollProgress from "./components/fx/ScrollProgress";
import GrainOverlay from "./components/fx/GrainOverlay";
import SmoothScroll from "./components/fx/SmoothScroll";
import ChatWidget from "./components/ChatWidget";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AppLayout from "./app/AppLayout";
import DashboardHome from "./app/DashboardHome";
import JournalPage from "./app/JournalPage";
import InsightsPage from "./app/InsightsPage";
import SettingsPage from "./app/SettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <SmoothScroll>
        <VideoBackground />
        <StarBackground />
        <CursorGlow />
        <GrainOverlay />
        <ScrollProgress />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        <ChatWidget />
      </SmoothScroll>
    </AuthProvider>
  );
}
