"use client";

import {
  BENCHMARKS,
  ELIGIBILITY_AGENT,
  ELIGIBILITY_INDUSTRY,
  ELIGIBILITY_DEFAULTS,
  RCM_PROVIDER_INDUSTRY,
  RCM_PROVIDER_AGENT,
  PROVIDERCRED_AGENT,
  REFERRAL_AGENT,
} from "@/lib/roi-config";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

function displayValue(value: number): string {
  if (value > 0 && value < 1) return formatPercent(value);
  if (value < 100) return formatNumber(value); // small counts/minutes, e.g. 10s, 12.64 min
  return formatCurrency(value);
}

export function ViewSources() {
  const entries = [
    ...Object.entries(BENCHMARKS),
    ...Object.entries(ELIGIBILITY_INDUSTRY),
    ...Object.entries(ELIGIBILITY_AGENT),
    ...Object.entries(ELIGIBILITY_DEFAULTS),
    ...Object.entries(RCM_PROVIDER_INDUSTRY),
    ...Object.entries(RCM_PROVIDER_AGENT),
    ...Object.entries(PROVIDERCRED_AGENT),
    ...Object.entries(REFERRAL_AGENT),
  ];

  return (
    <div className="mx-auto max-w-3xl py-4">
      <h2 className="text-3xl font-semibold tracking-[-0.01em] text-foreground sm:text-4xl">
        Every number, sourced.
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        These are the published benchmarks behind the calculator. The same
        citations appear on hover next to each figure.
      </p>

      <ul className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)]">
        {entries.map(([key, b], i) => (
          <li
            key={`${key}-${i}`}
            className={`flex items-start justify-between gap-4 px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{b.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.source}</p>
            </div>
            <span className="tabular shrink-0 font-mono text-sm font-semibold text-primary">
              {displayValue(b.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
