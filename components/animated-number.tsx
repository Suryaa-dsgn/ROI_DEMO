"use client";

import { useCountUp } from "@/hooks/use-count-up";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
} from "@/lib/format";

type Variant = "currency" | "compactCurrency" | "number";

const formatters: Record<Variant, (n: number) => string> = {
  currency: formatCurrency,
  compactCurrency: formatCompactCurrency,
  number: formatNumber,
};

/**
 * Count-up wrapper for a single figure. Always tabular so digits don't jitter
 * as they animate.
 */
export function AnimatedNumber({
  value,
  variant = "currency",
  className,
}: {
  value: number;
  variant?: Variant;
  className?: string;
}) {
  const display = useCountUp(value);
  return (
    <span className={`tabular font-mono ${className ?? ""}`}>
      {formatters[variant](display)}
    </span>
  );
}
