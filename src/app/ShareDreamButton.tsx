import { useState } from "react";
import { Share2, Loader2, Check } from "lucide-react";
import type { Entry } from "./useEntries";
import { renderDreamCard } from "./dreamCard";

// Builds a shareable PNG of the dream analysis and either opens the native
// share sheet (with the image attached) or downloads it.
export default function ShareDreamButton({ entry }: { entry: Entry }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const share = async () => {
    setBusy(true);
    try {
      const blob = await renderDreamCard(entry);
      const file = new File([blob], "sleepscribe-dream.png", {
        type: "image/png",
      });

      const nav = navigator as Navigator & {
        canShare?: (d: ShareData) => boolean;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({
          files: [file],
          title: "My dream, decoded by SleepScribe",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sleepscribe-dream.png";
        a.click();
        URL.revokeObjectURL(url);
      }
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (err) {
      // Swallow the user-cancelled share; surface anything else to the console.
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error("Share failed:", err);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={share}
      disabled={busy}
      className="btn-ghost w-full text-sm disabled:opacity-60"
    >
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Creating card…
        </>
      ) : done ? (
        <>
          <Check className="h-4 w-4 text-aurora-teal" /> Shared
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" /> Share this dream
        </>
      )}
    </button>
  );
}
