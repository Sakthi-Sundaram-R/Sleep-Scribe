import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { api, setToken } from "../lib/api";
import { LogoMark } from "../components/Logo";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valid = token && email;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token: authToken } = await api.resetPassword({ email, token, password });
      setToken(authToken);
      // Full reload so AuthProvider hydrates the session from the new token.
      window.location.href = "/app";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
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
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-xl font-bold">
            Sleep<span className="text-gradient">Scribe</span>
          </span>
        </Link>

        <div className="glass rounded-3xl p-8">
          <h1 className="font-display text-2xl font-bold">Set a new password</h1>

          {!valid ? (
            <>
              <p className="mt-2 text-sm text-white/60">
                This reset link is missing or malformed. Request a fresh one.
              </p>
              <Link to="/forgot" className="btn-aurora mt-6 w-full text-sm">
                Request a new link
              </Link>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-white/55">
                For <span className="text-white/80">{email}</span>. Choose something
                you'll remember.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-night-950/60 px-4 transition focus-within:border-aurora-purple/60">
                  <Lock className="h-5 w-5 shrink-0 text-white/40" />
                  <input
                    type="password"
                    required
                    placeholder="New password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-white/30"
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-aurora-pink/30 bg-aurora-pink/10 px-3 py-2 text-sm text-aurora-pink">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className="btn-aurora w-full disabled:opacity-60">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Reset password & log in <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <Link
            to="/login"
            className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-white/45 hover:text-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
