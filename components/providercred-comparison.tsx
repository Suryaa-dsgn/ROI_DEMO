"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Zap } from "lucide-react";
import { InputField } from "@/components/input-field";
import { AnimatedNumber } from "@/components/animated-number";
import { DotMatrixTotal } from "@/components/dot-matrix-total";
import { useRoi } from "@/components/roi-provider";
import {
  PROVIDERCRED_AGENT,
  fieldsByTier,
  type Product,
} from "@/lib/roi-config";
import { formatCurrency } from "@/lib/format";

const A = PROVIDERCRED_AGENT;

const DRIVER_FACT = {
  value: `${Math.round(A.verificationTimeReduction.value * 100)}%`,
  label: "less manual provider verification time",
};

const REINFORCING_FACTS = [
  { value: `${Math.round(A.lessManualWork.value * 100)}%`,      label: "less manual work" },
  { value: `${Math.round(A.complianceExposure.value * 100)}%`,  label: "less compliance exposure" },
  { value: `${Math.round(A.recredentialingTime.value * 100)}%`, label: "faster recredentialing" },
  { value: `${Math.round(A.alertPrecision.value * 100)}%`,      label: "alert precision" },
  { value: "100%",                                               label: "audit-ready reporting" },
  { value: `${Math.round(A.rosterCapacity.value * 100)}%`,      label: "more roster capacity" },
];

// The three poster performance figures shown in "How this is calculated".
const CALC_ROWS = [
  { display: `${Math.round(A.verificationTimeReduction.value * 100)}%`, label: A.verificationTimeReduction.label, source: A.verificationTimeReduction.source },
  { display: `${Math.round(A.onboardingSpeedup.value * 100)}%`,         label: A.onboardingSpeedup.label,         source: A.onboardingSpeedup.source },
  { display: "$2M+",                                                     label: A.riskAvoidedPerYear.label,        source: A.riskAvoidedPerYear.source },
];

/**
 * Comparison-mode module for ProviderCred (annual). Left: six editable client
 * inputs in two groups (labor / onboarding). Right (sticky): labor-saved headline
 * + table + two clearly-separate lines (cash freed, risk avoided). Below: driver
 * fact, six reinforcing facts, how-calculated disclosure. All performance from
 * the poster; no external benchmarks.
 */
export function ProviderCredComparison({ product }: { product: Product }) {
  const { values, setValue } = useRoi();
  const { core } = fieldsByTier(product);
  const v = values[product.id];
  const c = product.comparison?.(v);
  if (!c) return null;

  // Split the 6 core fields into two groups: first 3 = labor, last 3 = onboarding.
  const laborFields     = core.slice(0, 3);
  const onboardingFields = core.slice(3);

  return (
    <div className="space-y-6">
      {/* Top row — inputs on the left, live savings on the right (no scroll). */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        {/* Left — the client's reality (only editable area) */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Your process today
          </h3>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Every provider you cannot bill yet is revenue waiting. Here is what
            manual credentialing costs your team today, and what the agent saves.
          </p>

          {/* Group 1 — credentialing labor (drives the total) */}
          <p className="mt-7 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Credentialing labor
          </p>
          <div className="mt-3 grid grid-cols-1 gap-6">
            {laborFields.map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={v[f.key]}
                onChange={(val) => setValue(product.id, f.key, val)}
              />
            ))}
          </div>

          {/* Group 2 — onboarding speed (separate faster-billing line, NOT the total) */}
          <p className="mt-7 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Onboarding speed
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Used for the separate revenue-captured-earlier line only. Not in the
            total above.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-6">
            {onboardingFields.map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={v[f.key]}
                onChange={(val) => setValue(product.id, f.key, val)}
              />
            ))}
          </div>
        </section>

        {/* Right (sticky) — labor saved headline + table + two separate lines */}
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">Per year</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Doing it manually</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">With Quickflows</th>
                  <th className="px-4 py-3 text-right font-medium text-primary">You save</th>
                </tr>
              </thead>
              <tbody>
                {c.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border">
                    <td className="px-4 py-3 text-foreground">{row.label}</td>
                    <td className="px-4 py-3 text-right">
                      <AnimatedNumber value={row.manual}    variant="currency" className="text-foreground/90" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AnimatedNumber value={row.automated} variant="currency" className="text-foreground/90" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AnimatedNumber value={row.saved}     variant="currency" className="font-semibold text-primary" />
                    </td>
                  </tr>
                ))}
                <tr className="bg-secondary/40">
                  <td className="px-4 py-3 font-semibold text-foreground">Total per year</td>
                  <td className="px-4 py-3 text-right">
                    <AnimatedNumber value={c.totalManual}    variant="currency" className="font-semibold text-foreground" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AnimatedNumber value={c.totalAutomated} variant="currency" className="font-semibold text-foreground" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AnimatedNumber value={c.totalSaved}     variant="currency" className="font-bold text-primary" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Two separate lines — clearly distinct from the total */}
          {c.separate ? (
            <div className="mt-4 space-y-2 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Revenue captured earlier (arrives sooner, not new money)
                  </p>
                  <p className="mt-0.5 text-[0.7rem] leading-snug text-muted-foreground">
                    Not in the total above.
                  </p>
                </div>
                <span className="tabular shrink-0 font-mono text-sm font-semibold text-foreground">
                  about {formatCurrency(c.separate.cashFreed)} / yr
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Compliance exposure avoided (poster average, kept separate)
                    </p>
                    <p className="mt-0.5 text-[0.7rem] leading-snug text-muted-foreground">
                      Never in the total.
                    </p>
                  </div>
                  <span className="tabular shrink-0 font-mono text-sm font-semibold text-foreground">
                    $2M+ / yr
                  </span>
                </div>
              </div>
            </div>
          ) : null}
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

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
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

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Reinforcing outcomes from the poster. Not added to the savings total.
        </p>
      </section>

      {/* How this is calculated — full width */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how" className="border-none">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:no-underline data-[state=open]:rounded-b-none">
            How this is calculated
          </AccordionTrigger>
          <AccordionContent className="rounded-b-xl border border-t-0 border-border bg-card px-4 pb-4 pt-1">
            <p className="mb-3 mt-1 text-xs leading-relaxed text-muted-foreground">
              Credentialing labor saved is providers per year × your manual hours
              per provider × your staff hourly cost, with {Math.round(A.verificationTimeReduction.value * 100)}% removed
              by the agent (the poster&apos;s figure). Revenue captured earlier is new billing
              providers × days sooner they can bill × daily revenue — cash timing,
              not new money, kept separate. The compliance risk figure is the
              poster&apos;s $2M+ average, shown as-is, never in the total. The manual
              hours per provider and onboarding days are your team&apos;s own numbers,
              not poster claims. No external benchmarks are used for this agent.
            </p>
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {CALC_ROWS.map((row) => (
                <li
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">{row.label}</p>
                    <p className="mt-0.5 text-[0.7rem] text-muted-foreground">{row.source}</p>
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
