import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { api } from "../lib/api";
import { LogoMark } from "../components/Logo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
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
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-xl font-bold">
            Sleep<span className="text-gradient">Scribe</span>
          </span>
        </Link>

        <div className="glass rounded-3xl p-8">
          {sent ? (
            <div className="text-center">
              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-aurora-purple/20">
                <MailCheck className="h-7 w-7 text-aurora-cyan" />
              </span>
              <h1 className="font-display text-2xl font-bold">Check your inbox</h1>
              <p className="mt-2 text-sm text-white/60">
                If an account exists for <span className="text-white/80">{email}</span>,
                a password reset link is on its way. It expires in 1 hour.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-aurora-pink hover:gap-2.5 transition-all"
              >
                <ArrowLeft className="h-4 w-4" /> Back to log in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">Forgot your password?</h1>
              <p className="mt-1 text-sm text-white/55">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-night-950/60 px-4 transition focus-within:border-aurora-purple/60">
                  <Mail className="h-5 w-5 shrink-0 text-white/40" />
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      Send reset link <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <Link
                to="/login"
                className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-white/45 hover:text-white/70"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to log in
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
