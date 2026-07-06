// lib/format.ts
// Currency + number formatting. Compact where space is tight ($1.5M, $454K),
// full precision in tooltips. Always tabular alignment at the display layer.

/** Full-precision currency, e.g. $1,380,600. */
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

/**
 * Compact currency for tight spaces: $454K, $1.5M, $6.2M.
 * Rounds to sensible figures — no fake precision on the display.
 */
export function formatCompactCurrency(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    // One decimal under 10M, whole-ish above; drop trailing .0
    const val = millions >= 100 ? Math.round(millions) : round1(millions);
    return `${sign}$${trimZero(val)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${Math.round(abs / 1_000)}K`;
  }
  return `${sign}$${Math.round(abs)}`;
}

/** Percent display, e.g. 3% or 11.8%. */
export function formatPercent(fraction: number): string {
  const pct = fraction * 100;
  const val = Number.isInteger(pct) ? pct : round1(pct);
  return `${trimZero(val)}%`;
}

/** Plain integer with thousands separators, e.g. 100,000. */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

/** Format a raw field value for its type (used by inputs). */
export function formatFieldValue(
  value: number,
  type: "number" | "currency" | "percent" | "slider",
): string {
  if (type === "percent" || type === "slider") return formatPercent(value);
  if (type === "currency") return formatCurrency(value);
  return formatNumber(value);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function trimZero(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}
