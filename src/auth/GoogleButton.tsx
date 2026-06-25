import { useEffect, useRef } from "react";

// Renders Google's official "Sign in with Google" button using Google Identity
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

export default function GoogleButton({
  onCredential,
  onError,
}: {
  onCredential: (credential: string) => void;
  onError?: (msg: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !ref.current) return;
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (resp: { credential?: string }) => {
            if (resp.credential) onCredential(resp.credential);
            else onError?.("No credential returned from Google");
          },
        });
        google.accounts.id.renderButton(ref.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 320,
        });
      })
      .catch((e) => onError?.(e.message));

    return () => {
      cancelled = true;
    };
  }, [onCredential, onError]);

  if (!CLIENT_ID) return null;

  return <div ref={ref} className="flex justify-center" />;
}

export const googleConfigured = Boolean(CLIENT_ID);
