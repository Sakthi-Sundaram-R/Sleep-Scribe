import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  LayoutDashboard,
  NotebookPen,
  LineChart,
  Settings,
  Sparkles,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { clearEntriesCache, useEntries } from "./useEntries";
import { useNightlyReminder } from "./useNightlyReminder";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/journal", label: "Journal", icon: NotebookPen },
  { to: "/app/insights", label: "Insights", icon: LineChart },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {nav.map((n) => {
        const Icon = n.icon;
        return (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-aurora-purple/20 text-white shadow-[inset_0_0_0_1px_rgba(236,72,153,0.35)]"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-5 w-5 transition ${
                    isActive ? "text-aurora-pink" : "text-white/50 group-hover:text-aurora-violet"
                  }`}
                />
                {n.label}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { entries } = useEntries();
  useNightlyReminder(entries);

  const handleLogout = () => {
    logout();
    clearEntriesCache();
    navigate("/login", { replace: true });
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[268px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/10 bg-night-900/40 p-5 backdrop-blur-xl lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-aurora-gradient shadow-lg shadow-aurora-purple/40">
            <Moon className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-xl font-bold">
            Sleep<span className="text-gradient">Scribe</span>
          </span>
        </Link>

        <SidebarLinks />

        <div className="mt-auto space-y-3">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-aurora-cyan">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Lucid plan
              </span>
            </div>
            <p className="mt-1.5 text-xs text-white/55">
              Unlimited AI analysis & soundscapes unlocked.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-aurora-gradient text-xs font-bold">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-white/45">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="shrink-0 rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-aurora-pink"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-night-900/60 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-aurora-gradient">
            <Moon className="h-4 w-4 text-white" />
          </span>
          <span className="font-display font-bold">
            Sleep<span className="text-gradient">Scribe</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-white/5"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-night-900 p-5 lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-lg font-bold">
                  Sleep<span className="text-gradient">Scribe</span>
                </span>
                <button onClick={() => setOpen(false)}>
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>
              <SidebarLinks onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content — enter-only transition. An exit+wait animation here can
          strand the incoming page at opacity 0 (AnimatePresence mode="wait" +
          StrictMode/interrupted navigation), leaving the page blank. */}
      <main className="min-w-0 px-4 py-6 sm:px-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
