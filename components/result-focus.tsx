"use client";

import { AnimatedNumber } from "@/components/animated-number";
import { useRoi } from "@/components/roi-provider";
import type { Product } from "@/lib/roi-config";

/**
 * Prominent live number for the focused product (Geist Mono, not the Doto
 * signature — that is reserved for the grand total). Calm, one clean figure.
 */
export function ResultFocus({ product }: { product: Product }) {
  const { productLines, productHardDollar } = useRoi();
  const lines = productLines(product.id);
  const hard = productHardDollar(product.id);
  const cashFreed = lines
    .filter((l) => l.category === "cashFreed")
    .reduce((s, l) => s + l.amount, 0);

  return (
    <div className="rounded-2xl border border-border bg-secondary/60 p-6">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {product.name} - annual hard dollars
      </p>
      <div className="mt-2">
        <AnimatedNumber
          value={hard}
          variant="currency"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        />
      </div>
      {cashFreed > 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          +{" "}
          <AnimatedNumber
            value={cashFreed}
            variant="compactCurrency"
            className="text-foreground"
          />{" "}
          cash freed (kept separate)
        </p>
      ) : null}
    </div>
  );
}
