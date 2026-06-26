import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Loader2, Download, X, Share2 } from "lucide-react";
import { renderDreamArt, type DreamArtInput } from "./dreamArt";

// Turns a dream into a generative aurora artwork, shown in a lightbox the user
// can download or share. The image is seeded from the dream, so it's stable.
export default function DreamArtButton({ entry }: { entry: DreamArtInput }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  const generate = async () => {
    setBusy(true);
    try {
      const b = await renderDreamArt(entry);
      setBlob(b);
      setUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(b);
      });
    } catch (err) {
      console.error("Dream art failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setBlob(null);
  };

  const download = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "sleepscribe-dream-art.png";
    a.click();
  };

  const share = async () => {
    if (!blob) return;
    const file = new File([blob], "sleepscribe-dream-art.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    try {
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: "My dream as art — SleepScribe" });
      } else {
        download();
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error("Share failed:", err);
      }
    }
  };

  return (
    <>
      <button onClick={generate} disabled={busy} className="btn-ghost w-full text-sm disabled:opacity-60">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Painting your dream…
          </>
        ) : (
          <>
            <Palette className="h-4 w-4" /> Visualize as art
          </>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {url && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-md flex-col gap-4"
              >
                <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
                  <img src={url} alt="Generative artwork of your dream" className="w-full" />
                  <button
                    onClick={close}
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white/80 backdrop-blur transition hover:bg-black/70 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex gap-3">
                  <button onClick={download} className="btn-aurora flex-1 text-sm">
                    <Download className="h-4 w-4" /> Download
                  </button>
                  <button onClick={share} className="btn-ghost flex-1 text-sm">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
