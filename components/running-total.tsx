"use client";

import { DotMatrixTotal } from "@/components/dot-matrix-total";
import { AnimatedNumber } from "@/components/animated-number";
import { useRoi } from "@/components/roi-provider";

/**
 * The persistent combined hard-dollar total for the whole org. Uses the Doto
 * signature numeral (this is the one grand total). Cash freed / risk avoided
 * are shown in the breakdown, never here.
 */
export function RunningTotal() {
  const { totals } = useRoi();
  const hasSeparate = totals.cashFreed > 0 || totals.riskAvoided > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-7">
      <p className="text-sm text-muted-foreground">
        Estimated annual hard-dollar impact
      </p>
      <div className="mt-2">
        <DotMatrixTotal value={totals.hardDollar} size="md" tone="violet" />
      </div>
      {hasSeparate ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Plus{" "}
          <AnimatedNumber
            value={totals.cashFreed}
            variant="compactCurrency"
            className="text-foreground"
          />{" "}
          cash freed and{" "}
          <AnimatedNumber
            value={totals.riskAvoided}
            variant="compactCurrency"
            className="text-foreground"
          />{" "}
          risk avoided - kept separate, never added in.
        </p>
      ) : null}
    </div>
  );
}
