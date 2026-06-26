import { useCallback, useEffect, useRef, useState } from "react";

// Thin wrapper over the Web Speech API (SpeechRecognition). Streams finalized
// transcript chunks back via the callback so the caller can append them to a
// textarea — "voice journaling" with zero backend.

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useSpeechToText() {
  const recRef = useRef<any>(null);
  const onTextRef = useRef<(t: string) => void>(() => {});
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
      }
      if (finalText.trim()) onTextRef.current(finalText);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const start = useCallback((onText: (t: string) => void) => {
    if (!recRef.current) return;
    onTextRef.current = onText;
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      /* already started */
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}
