import React, { useEffect, useState } from 'react';

// PUBLIC_INTERFACE
export default function Timer({ start = true, limitSeconds = null, onExpire = () => {}, onTick = () => {} }) {
  /**
   * Simple ticking timer with optional limit. Calls onExpire when reaching limitSeconds.
   */
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!start) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        onTick(next);
        if (limitSeconds && next >= limitSeconds) {
          clearInterval(id);
          onExpire();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [start, limitSeconds, onExpire, onTick]);

  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');

  return (
    <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
      ⏱ {mins}:{secs} {limitSeconds ? `(limit ${Math.floor(limitSeconds/60)}m)` : ''}
    </div>
  );
}
