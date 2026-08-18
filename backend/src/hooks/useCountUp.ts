import { useCallback, useRef, useState } from 'react';

/** Animated count-up that respects prefers-reduced-motion. */
export function useCountUp(target: number, durationMs = 1200, start = true) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  const trigger = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setValue(target);
      return;
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [target, durationMs]);

  if (start && value === 0 && raf.current === null) trigger();

  return Math.round(value);
}
