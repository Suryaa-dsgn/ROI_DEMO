"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Zap } from "lucide-react";
import { InputField } from "@/components/input-field";
import { AnimatedNumber } from "@/components/animated-number";
import { DotMatrixTotal } from "@/components/dot-matrix-total";
import { useRoi } from "@/components/roi-provider";
import {
  RCM_PROVIDER_AGENT,
  RCM_PROVIDER_INDUSTRY,
  fieldsByTier,
  type Product,
} from "@/lib/roi-config";
import { formatCurrency, formatPercent } from "@/lib/format";

const A = RCM_PROVIDER_AGENT;
const I = RCM_PROVIDER_INDUSTRY;

// The driver fact (monetized) and the reinforcing facts (display-only).
const DRIVER_FACT = {
  value: `${Math.round(A.denialReduction.value * 100)}%`,
  label: "fewer denials with pre-submission AI review",
};

const REINFORCING_FACTS = [
  { value: `${A.fasterAppeals.value}×`, label: "faster appeals" },
  { value: `${Math.round(A.moreRevenue.value * 100)}%`, label: "higher net collection" },
  { value: `${Math.round(A.arRecovery.value * 100)}%`, label: "better AR recovery" },
  { value: `${Math.round(A.cleanClaimRate.value * 100)}%`, label: "clean claim rate" },
];

// Sourced constants shown in the "How this is calculated" disclosure.
const CALC_ROWS: { display: string; label: string; source: string }[] = [
  {
    display: formatPercent(I.denialRate.value),
    label: I.denialRate.label,
    source: I.denialRate.source,
  },
  {
    display: `$${I.reworkCost.value}`,
    label: I.reworkCost.label,
    source: I.reworkCost.source,
  },
  {
    display: formatPercent(I.neverRecovered.value),
    label: I.neverRecovered.label,
    source: I.neverRecovered.source,
  },
  {
    display: formatPercent(A.denialReduction.value),
    label: A.denialReduction.label,
    source: A.denialReduction.source,
  },
];

/**
 * Comparison-mode module for RCM — Provider (annual, denials only). Mirrors the
 * eligibility side-by-side layout: editable client reality on the left with a
 * read-only derived revenue line and a context stat, the live manual-vs-Quickflows
 * savings on the right. Reinforcing poster facts are shown but never summed.
 */
export function RcmProviderComparison({ product }: { product: Product }) {
  const { values, setValue } = useRoi();
  const { core } = fieldsByTier(product);
  const v = values[product.id];
  const c = product.comparison?.(v);
  const derived = product.derived?.(v);
  if (!c) return null;

  return (
    <div className="space-y-6">
      {/* Top row — editable inputs + live savings, side by side (no scroll). */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        {/* Left — the client's reality (only editable area) */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Your process today
          </h3>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Denials are one of the biggest preventable losses in your revenue
            cycle. Here is what denials cost today, and what Quickflows prevents
            and recovers.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-6">
            {core.map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={v[f.key]}
                onChange={(val) => setValue(product.id, f.key, val)}
              />
            ))}
          </div>

          {/* Derived, read-only annual revenue */}
          {derived ? (
            <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">
                  Annual revenue
                </span>
                <Tooltip>
                  <TooltipTrigger
                    aria-label="How annual revenue is derived"
                    className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Lock className="size-3" strokeWidth={2} />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs border-border bg-popover text-xs leading-snug text-popover-foreground">
                    Calculated from claims times average payment. Not editable.
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="tabular font-mono text-sm font-semibold text-foreground">
                {formatCurrency(derived.annualRevenue)}
              </span>
            </div>
          ) : null}

          {/* Context stat — a strong, honest hook */}
          {c.context ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Denials are costing you about{" "}
              <span className="font-semibold text-primary">
                {formatPercent(c.context.denialCostShareOfRevenue)}
              </span>{" "}
              of revenue today.
            </p>
          ) : null}
        </section>

        {/* Right (sticky) — manual vs Quickflows (per year) */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-7 lg:sticky lg:top-8">
          <p className="text-sm text-muted-foreground">You save about</p>
          <div className="mt-1">
            <DotMatrixTotal value={c.totalSaved} size="md" tone="violet" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            every year with Quickflows.
          </p>

          <div className="mt-7 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Per year
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Doing it manually
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    With Quickflows
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-primary">
                    You save
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border">
                    <td className="px-4 py-3 text-foreground">{row.label}</td>
                    <td className="px-4 py-3 text-right">
                      <AnimatedNumber
                        value={row.manual}
                        variant="currency"
                        className="text-foreground/90"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AnimatedNumber
                        value={row.automated}
                        variant="currency"
                        className="text-foreground/90"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AnimatedNumber
                        value={row.saved}
                        variant="currency"
                        className="font-semibold text-primary"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-secondary/40">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    Total per year
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AnimatedNumber
                      value={c.totalManual}
                      variant="currency"
                      className="font-semibold text-foreground"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AnimatedNumber
                      value={c.totalAutomated}
                      variant="currency"
                      className="font-semibold text-foreground"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AnimatedNumber
                      value={c.totalSaved}
                      variant="currency"
                      className="font-bold text-primary"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* What Quickflows does — driver (monetized) + reinforcing (display-only) */}
      <section className="rounded-2xl border border-border bg-secondary/50 p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary" strokeWidth={2} />
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            What Quickflows does
          </h3>
        </div>

        <div className="mt-5 rounded-xl border border-primary/20 bg-brand-soft px-4 py-4">
          <span
            className="tabular text-2xl font-semibold tracking-tight text-primary"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {DRIVER_FACT.value}
          </span>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {DRIVER_FACT.label}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {REINFORCING_FACTS.map((fact) => (
            <div
              key={fact.label}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <span
                className="tabular text-lg font-semibold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {fact.value}
              </span>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {fact.label}
              </p>
            </div>
          ))}
        </div>

      </section>

      {/* How this is calculated — full width */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how" className="border-none">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:no-underline data-[state=open]:rounded-b-none">
            How this is calculated
          </AccordionTrigger>
          <AccordionContent className="rounded-b-xl border border-t-0 border-border bg-card px-4 pb-4 pt-1">
            <p className="mb-3 mt-1 text-xs leading-relaxed text-muted-foreground">
              Denials per year are claims × the industry denial rate. Of those,
              about {Math.round(I.neverRecovered.value * 100)}% would be written
              off (valued at your average payment) and the rest worked by staff
              at ${I.reworkCost.value} each. Quickflows prevents{" "}
              {Math.round(A.denialReduction.value * 100)}% of denials, which
              recovers the write-offs and removes the matching rework. Every
              constant below is sourced.
            </p>
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {CALC_ROWS.map((row) => (
                <li
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {row.label}
                    </p>
                    <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                      {row.source}
                    </p>
                  </div>
                  <span className="tabular shrink-0 font-mono text-xs font-semibold text-primary">
                    {row.display}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
