"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useCountUp } from "@/hooks/use-count-up";
import { formatCurrency } from "@/lib/format";

/**
 * The signature dotted-LED number (Doto). Used only as a single signature
 * moment — the grand hard-dollar total. On appearance it types in character by
 * character; after that it counts up on live input changes. Ink or violet, no
 * glow (light Apple-grade aesthetic).
 */
export function DotMatrixTotal({
  value,
  className,
  size = "lg",
  tone = "ink",
}: {
  value: number;
  className?: string;
  size?: "lg" | "md";
  tone?: "ink" | "violet";
}) {
  const reduce = useReducedMotion();
  const sizeClass =
    size === "lg"
      ? "text-5xl sm:text-6xl md:text-[4.5rem]"
      : "text-4xl sm:text-5xl";
  const toneClass = tone === "violet" ? "text-primary" : "text-brand-ink";

  // Typewriter reveal of the value present at mount. Captured once in lazy
  // state so it stays render-safe (no ref reads during render).
  const [target] = useState(() => formatCurrency(value));
  const [typedCount, setTypedCount] = useState(reduce ? target.length : 0);
  // Derived, not stored: we're still typing until every character is revealed.
  const typing = !reduce && typedCount < target.length;

  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setTypedCount((n) => n + 1), 60);
    return () => clearTimeout(t);
  }, [typing, typedCount]);

  // After the reveal, live input changes count up smoothly.
  const liveDisplay = useCountUp(value);

  const text = typing ? target.slice(0, typedCount) : formatCurrency(liveDisplay);

  return (
    <span
      className={`tabular font-black leading-none tracking-tight ${toneClass} ${sizeClass} ${className ?? ""}`}
      style={{ fontFamily: "var(--font-led)" }}
      aria-label={formatCurrency(value)}
    >
      <span aria-hidden>{text}</span>
      {typing ? (
        <span
          aria-hidden
          className="ml-0.5 inline-block w-[0.12em] animate-pulse self-stretch bg-current align-baseline"
          style={{ height: "0.82em" }}
        />
      ) : null}
    </span>
  );
}
