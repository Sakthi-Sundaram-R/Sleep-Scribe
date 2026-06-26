import { useEffect, useRef, useCallback } from "react";

// Renders a custom-styled "Continue with Google" button using Google Identity
// Services. On success it hands the ID token (credential) back to the parent.
// If VITE_GOOGLE_CLIENT_ID isn't set, it renders nothing.

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

let scriptPromise: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.id) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

// Google "G" logo as inline SVG for a crisp look at any size.
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function GoogleButton({
  onCredential,
  onError,
}: {
  onCredential: (credential: string) => void;
  onError?: (msg: string) => void;
}) {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const stableOnCredential = useCallback(onCredential, [onCredential]);
  const stableOnError = useCallback(onError || (() => {}), [onError]);

  useEffect(() => {
    if (!CLIENT_ID || initRef.current) return;
    initRef.current = true;

    loadGsi()
      .then(() => {
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (resp: { credential?: string }) => {
            if (resp.credential) stableOnCredential(resp.credential);
            else stableOnError("No credential returned from Google");
          },
        });
        // Render the real Google button in a hidden div so we can delegate clicks.
        if (hiddenRef.current) {
          google.accounts.id.renderButton(hiddenRef.current, {
            type: "standard",
            size: "large",
            width: 320,
          });
        }
      })
      .catch((e) => stableOnError(e.message));
  }, [stableOnCredential, stableOnError]);

  if (!CLIENT_ID) return null;

  const handleClick = () => {
    // Delegate click to the hidden real Google button for auth flow.
    const iframe = hiddenRef.current?.querySelector("div[role='button']") as HTMLElement | null;
    if (iframe) iframe.click();
  };

  return (
    <div className="relative">
      {/* Hidden real Google button */}
      <div
        ref={hiddenRef}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, overflow: "hidden" }}
      />
      {/* Custom styled button */}
      <button
        type="button"
        onClick={handleClick}
        className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/[0.12] hover:shadow-lg hover:shadow-aurora-purple/10 active:scale-[0.98]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
          <GoogleLogo />
        </span>
        Continue with Google
      </button>
    </div>
  );
}

export const googleConfigured = Boolean(CLIENT_ID);

