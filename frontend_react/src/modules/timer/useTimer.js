import { useEffect, useRef, useState } from "react";

/**
 * useTimer manages a running stopwatch timer with start/pause/reset.
 *
 * PUBLIC_INTERFACE
 */
export function useTimer(initialRunning = false) {
  const [running, setRunning] = useState(initialRunning);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAt = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    if (!running) {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
      return;
    }
    const tick = () => {
      const now = performance.now();
      if (startedAt.current == null) startedAt.current = now;
      setElapsedMs(prev => prev + (now - (startedAt.current || now)));
      startedAt.current = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      startedAt.current = null;
    };
  }, [running]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => { setElapsedMs(0); startedAt.current = null; };

  return { running, elapsedMs, start, pause, reset };
}

// PUBLIC_INTERFACE
export function formatMs(ms) {
  /** Format milliseconds to mm:ss.SS */
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);
  const pad = (n, l=2) => String(n).padStart(l, "0");
  return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
}
