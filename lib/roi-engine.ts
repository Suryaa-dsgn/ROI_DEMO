// lib/roi-engine.ts
// Pure, framework-agnostic ROI math. No React, no config values live here —
// the engine only knows how to categorize and aggregate line items.

export type ValueCategory =
  | "moneySaved" // hard dollar
  | "timeSaved" // hard dollar
  | "moneyRecovered" // hard dollar
  | "cashFreed" // separate line (timing)
  | "riskAvoided"; // separate line (risk, reference figure)

export const HARD_DOLLAR: ValueCategory[] = [
  "moneySaved",
  "timeSaved",
  "moneyRecovered",
];

export type Segment = "provider" | "payer" | "homeHealth";

export interface LineItem {
  category: ValueCategory;
  label: string;
  amount: number; // annual, in currency units
  sourceKeys: string[]; // keys into BENCHMARKS for tooltip citations
  note?: string; // e.g. "timing, not new money"
}

export interface ProductResult {
  productId: string;
  lines: LineItem[];
}

export interface Totals {
  hardDollar: number;
  moneySaved: number;
  timeSaved: number;
  moneyRecovered: number;
  cashFreed: number;
  riskAvoided: number;
}

/**
 * Aggregate line items across every product into category totals.
 * The headline `hardDollar` total never includes cashFreed or riskAvoided —
 * this separation is defended to a CFO and is intentional.
 */
export function aggregate(results: ProductResult[]): Totals {
  const all = results.flatMap((r) => r.lines);
  const sum = (cats: ValueCategory[]) =>
    all
      .filter((l) => cats.includes(l.category))
      .reduce((s, l) => s + l.amount, 0);

  return {
    hardDollar: sum(HARD_DOLLAR), // the headline total
    moneySaved: sum(["moneySaved"]),
    timeSaved: sum(["timeSaved"]),
    moneyRecovered: sum(["moneyRecovered"]),
    cashFreed: sum(["cashFreed"]), // separate line
    riskAvoided: sum(["riskAvoided"]), // separate reference line
  };
}

/** Collect, per category, the set of source keys backing the current totals. */
export function sourceKeysByCategory(
  results: ProductResult[],
  cats: ValueCategory[],
): string[] {
  const keys = new Set<string>();
  results
    .flatMap((r) => r.lines)
    .filter((l) => cats.includes(l.category))
    .forEach((l) => l.sourceKeys.forEach((k) => keys.add(k)));
  return [...keys];
}
