import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Mail, Lock, User, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import GoogleButton, { googleConfigured } from "../auth/GoogleButton";

export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const dest = location.state?.from || "/app";

  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async (credential: string) => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") await register(name, email, password);
      else await login(email, password);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-aurora-gradient shadow-lg shadow-aurora-pink/30">
            <Moon className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-xl font-bold">
            Sleep<span className="text-gradient">Scribe</span>
          </span>
        </Link>

        <div className="glass rounded-3xl p-8">
          {/* Toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {(["signup", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`relative rounded-full py-2 text-sm font-semibold transition ${
                  mode === m ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="authPill"
                    className="absolute inset-0 rounded-full bg-aurora-gradient"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{m === "signup" ? "Sign up" : "Log in"}</span>
              </button>
            ))}
          </div>

          <h1 className="font-display text-2xl font-bold">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-white/55">
            {mode === "signup"
              ? "Start your dream journal in seconds."
              : "Log in to continue decoding your nights."}
          </p>

          {googleConfigured && (
            <div className="mt-6">
              <GoogleButton onCredential={handleGoogle} onError={setError} />
              <div className="my-5 flex items-center gap-3 text-xs text-white/40">
                <span className="h-px flex-1 bg-white/10" />
                or {mode === "signup" ? "sign up" : "log in"} with email
                <span className="h-px flex-1 bg-white/10" />
              </div>
            </div>
          )}

          <form onSubmit={submit} className={googleConfigured ? "space-y-4" : "mt-6 space-y-4"}>
            <AnimatePresence mode="popLayout">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Field
                    icon={User}
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={setName}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              icon={Mail}
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={setEmail}
              required
            />
            <Field
              icon={Lock}
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={setPassword}
              required
            />

            {error && (
              <p className="rounded-xl border border-aurora-pink/30 bg-aurora-pink/10 px-3 py-2 text-sm text-aurora-pink">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-aurora w-full disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {mode === "signup" ? "Create account" : "Log in"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-white/40">
            <Sparkles className="h-3.5 w-3.5 text-aurora-cyan" />
            Your dreams are private and encrypted.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  icon: typeof Mail;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-night-950/60 px-4 transition focus-within:border-aurora-purple/60">
      <Icon className="h-5 w-5 shrink-0 text-white/40" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-white/30"
      />
    </div>
  );
}
