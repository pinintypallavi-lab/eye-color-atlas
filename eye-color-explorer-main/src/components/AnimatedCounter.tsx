import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  formatFn?: (n: number) => string;
}

export default function AnimatedCounter({ value, suffix = "", duration = 1200, formatFn }: AnimatedCounterProps) {
  const [display, setDisplay] = useState("0");
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + diff * eased;

      if (formatFn) {
        setDisplay(formatFn(current));
      } else if (value >= 1e9) {
        setDisplay((current / 1e9).toFixed(1) + "B");
      } else if (value >= 1e6) {
        setDisplay((current / 1e6).toFixed(1) + "M");
      } else {
        setDisplay(Math.round(current).toLocaleString());
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        prev.current = value;
      }
    };

    requestAnimationFrame(tick);
  }, [value, duration, formatFn]);

  return <span>{display}{suffix}</span>;
}
