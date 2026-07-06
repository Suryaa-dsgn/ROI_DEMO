"use client";

import { AnimatedNumber } from "@/components/animated-number";
import { SourceTooltip } from "@/components/source-tooltip";
import type { BenchmarkKey } from "@/lib/roi-config";

/**
 * One result row: label, optional source citation, animated amount.
 * Used for the category breakdown and the separate lines.
 */
export function ValueLine({
  label,
  amount,
  sourceKeys = [],
  note,
  emphasis = false,
}: {
  label: string;
  amount: number;
  sourceKeys?: string[];
  note?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={
              emphasis
                ? "text-sm font-medium text-foreground"
                : "text-sm text-muted-foreground"
            }
          >
            {label}
          </span>
          <SourceTooltip sourceKeys={sourceKeys as BenchmarkKey[]} />
        </div>
        {note ? (
          <p className="mt-0.5 text-xs text-muted-foreground/80">{note}</p>
        ) : null}
      </div>
      <AnimatedNumber
        value={amount}
        variant="currency"
        className={
          emphasis
            ? "text-base font-semibold text-foreground"
            : "text-sm font-medium text-foreground/90"
        }
      />
    </div>
  );
}
