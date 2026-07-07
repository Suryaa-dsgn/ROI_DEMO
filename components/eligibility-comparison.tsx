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
  ELIGIBILITY_AGENT,
  ELIGIBILITY_INDUSTRY,
  ELIGIBILITY_DEFAULTS,
  fieldsByTier,
  getSource,
  type Product,
} from "@/lib/roi-config";
import { formatPercent } from "@/lib/format";

const A = ELIGIBILITY_AGENT;

// The three locked Quickflows performance facts (Block 2).
const AGENT_FACTS = [
  {
    value: `${Math.round(A.manualEffortRemoved.value * 100)}%`,
    label: "less manual verification effort",
  },
  {
    value: `${Math.round(A.denialReduction.value * 100)}%`,
    label: "fewer coverage and network denials",
  },
  {
    value: `< ${A.secondsPerCheck.value}s`,
    label: "to verify a patient",
  },
];

// Sourced constants shown in the "How this is calculated" disclosure (Block 3).
const CALC_KEYS: string[] = [
  "initialDenialRate",
  "eligibilityShare",
  "neverRecovered",
  "manualMinutes",
  "staffHourly",
];

function calcDisplay(key: string): string {
  const industry = ELIGIBILITY_INDUSTRY[key as keyof typeof ELIGIBILITY_INDUSTRY];
  if (industry) return formatPercent(industry.value);
  const def = ELIGIBILITY_DEFAULTS[key as keyof typeof ELIGIBILITY_DEFAULTS];
  if (def) return key === "staffHourly" ? `$${def.value}/hr` : `${def.value} min`;
  return "";
}

/**
 * Comparison-mode module for AI Eligibility Verification (monthly, standalone).
 * Three calm blocks: the client's editable manual reality, the locked Quickflows
 * performance facts, and the manual-vs-Quickflows table the sales team presents.
 */
export function EligibilityComparison({ product }: { product: Product }) {
  const { values, setValue } = useRoi();
  const { core } = fieldsByTier(product);
  const v = values[product.id];
  const c = product.comparison?.(v);
  if (!c) return null;

  return (
    <div className="space-y-6">
      {/* Top row — the editable inputs and the live savings, side by side so
          the numbers react in view as the user adjusts (no scrolling). */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        {/* Block 1 — the client's manual reality (only editable area) */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Your process today
          </h3>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Your team verifies coverage, network status, benefits, and
            authorizations by hand for every visit. Here is what that costs, and
            what the agent saves.
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
        </section>

        {/* Block 3 — manual vs Quickflows (per month), sticky beside the inputs */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-7 lg:sticky lg:top-8">
          <p className="text-sm text-muted-foreground">You save about</p>
          <div className="mt-1">
            <DotMatrixTotal value={c.totalSaved} size="md" tone="violet" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            every month with Quickflows.
          </p>

          <div className="mt-7 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Per month
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
                    Total per month
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

      {/* Block 2 — locked Quickflows performance facts (not interactive) */}
      <section className="rounded-2xl border border-border bg-secondary/50 p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary" strokeWidth={2} />
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            What Quickflows does
          </h3>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {AGENT_FACTS.map((fact) => (
            <div
              key={fact.label}
              className="rounded-xl border border-border bg-card px-4 py-4"
            >
              <span
                className="tabular text-2xl font-semibold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {fact.value}
              </span>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                {fact.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How this is calculated — full width, so expanding it never stretches
          the sticky savings column. */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how" className="border-none">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:no-underline data-[state=open]:rounded-b-none">
            How this is calculated
          </AccordionTrigger>
          <AccordionContent className="rounded-b-xl border border-t-0 border-border bg-card px-4 pb-4 pt-1">
            <p className="mb-3 mt-1 text-xs leading-relaxed text-muted-foreground">
              Manual labor is visits × minutes ÷ 60 × hourly cost; the agent
              removes {Math.round(A.manualEffortRemoved.value * 100)}% of it.
              Money lost is the eligibility share of denials that are never
              recovered, valued at your average payment; the agent cuts those
              denials by {Math.round(A.denialReduction.value * 100)}%. Every
              constant below is sourced.
            </p>
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {CALC_KEYS.map((key) => {
                const src = getSource(key);
                if (!src) return null;
                return (
                  <li
                    key={key}
                    className="flex items-start justify-between gap-4 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {src.label}
                      </p>
                      <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                        {src.source}
                      </p>
                    </div>
                    <span className="tabular shrink-0 font-mono text-xs font-semibold text-primary">
                      {calcDisplay(key)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
