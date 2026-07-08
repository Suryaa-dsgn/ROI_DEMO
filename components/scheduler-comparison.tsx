"use client";

import React from "react";
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
  SCHEDULER_AGENT,
  fieldsByTier,
  type Product,
} from "@/lib/roi-config";
import { formatCurrency, formatPercent } from "@/lib/format";

const A = SCHEDULER_AGENT;

// Four driver facts that power the math (monetized).
const DRIVER_FACTS = [
  { value: `${Math.round(A.overtimeReduction.value * 100)}%`,    label: "lower overtime and agency spend" },
  { value: `${Math.round(A.coordinatorReduction.value * 100)}%`, label: "less coordinator scheduling work" },
  { value: `${Math.round(A.retentionImprovement.value * 100)}%`, label: "improvement in caregiver retention" },
  { value: `${Math.round(A.autoFillRate.value * 100)}%`,         label: "automatic fill rate for open shifts" },
];

// Reinforcing facts — display only, never monetized.
const REINFORCING_FACTS = [
  { value: `${Math.round(A.scheduleAccuracy.value * 100)}%`, label: "schedule accuracy" },
  { value: `<${A.callOffResponse.value} min`,                 label: "call-off response time" },
  { value: `${A.advanceWarning.value}+ wks`,                  label: "advance capacity warning" },
  { value: "100%",                                             label: "audit trail coverage" },
];

// Constants shown in "How this is calculated".
const CALC_ROWS = [
  { display: formatPercent(A.overtimeReduction.value),    label: A.overtimeReduction.label,    source: A.overtimeReduction.source },
  { display: formatPercent(A.coordinatorReduction.value), label: A.coordinatorReduction.label, source: A.coordinatorReduction.source },
  { display: formatPercent(A.retentionImprovement.value), label: A.retentionImprovement.label, source: A.retentionImprovement.source },
  { display: formatPercent(A.autoFillRate.value),         label: A.autoFillRate.label,         source: A.autoFillRate.source },
];

/**
 * Comparison-mode module for Quickflows Scheduler (annual). Left: 12 inputs in
 * three labeled groups (staffing / scheduling / unfilled shifts). Right (sticky):
 * four-row table with group dividers + revenue-from-filled-shifts separate block.
 * Four driver facts in a 2×2 grid + four reinforcing chips below.
 */
export function SchedulerComparison({ product }: { product: Product }) {
  const { values, setValue } = useRoi();
  const { core } = fieldsByTier(product);
  const v = values[product.id];
  const c = product.comparison?.(v);
  if (!c) return null;

  const staffingFields    = core.filter((f) => f.group === "staffing");
  const schedulingFields  = core.filter((f) => f.group === "scheduling");
  const revenueFields     = core.filter((f) => f.group === "revenue");

  // Build table rows with group-divider detection.
  const rows = c.rows;
  const groupsSeen = new Set<string>();

  return (
    <div className="space-y-6">
      {/* Top row — three input groups on the left, live savings on the right. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        {/* Left — the client's operational reality */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Your process today
          </h3>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Reactive scheduling, agency reliance, and avoidable turnover are
            three of the largest preventable costs in workforce-heavy operations.
            Here is what they cost today, and what the agent eliminates.
          </p>

          {/* Group 1 — Staffing costs */}
          <p className="mt-7 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Staffing costs
          </p>
          <div className="mt-3 grid grid-cols-1 gap-6">
            {staffingFields.map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={v[f.key]}
                onChange={(val) => setValue(product.id, f.key, val)}
              />
            ))}
          </div>

          {/* Group 2 — Scheduling effort */}
          <p className="mt-7 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Scheduling effort
          </p>
          <div className="mt-3 grid grid-cols-1 gap-6">
            {schedulingFields.map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={v[f.key]}
                onChange={(val) => setValue(product.id, f.key, val)}
              />
            ))}
          </div>

          {/* Group 3 — Unfilled shifts */}
          <p className="mt-7 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Unfilled shifts
          </p>
          <div className="mt-3 grid grid-cols-1 gap-6">
            {revenueFields.map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={v[f.key]}
                onChange={(val) => setValue(product.id, f.key, val)}
              />
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Used to calculate the revenue recovery line shown below the total.
          </p>
        </section>

        {/* Right (sticky) — savings headline + grouped table + revenue separate */}
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
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Manually</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">With Quickflows</th>
                  <th className="px-4 py-3 text-right font-medium text-primary">You save</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isNewGroup = row.group && !groupsSeen.has(row.group);
                  if (row.group) groupsSeen.add(row.group);
                  return (
                    <React.Fragment key={row.label}>
                      {isNewGroup && (
                        <tr className="border-b border-border bg-secondary/30">
                          <td colSpan={4} className="px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                            {row.group}
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-border">
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
                    </React.Fragment>
                  );
                })}
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

          {/* Part 3 — revenue from filled shifts, clearly separate */}
          {c.revenueSeparate ? (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {c.revenueSeparate.label}
                  </p>
                  <p className="mt-0.5 text-[0.7rem] leading-snug text-muted-foreground">
                    {Math.round(A.autoFillRate.value * 100)}% of your currently unfilled shifts get
                    assigned automatically. At your average revenue per shift, that is revenue
                    your operation is recovering.
                  </p>
                </div>
                <span className="tabular shrink-0 font-mono text-sm font-semibold text-foreground">
                  {formatCurrency(c.revenueSeparate.amount)} / yr
                </span>
              </div>
              <p className="mt-2 text-[0.7rem] leading-snug text-muted-foreground">
                {c.revenueSeparate.note}
              </p>
            </div>
          ) : null}
        </section>
      </div>

      {/* What Quickflows does — 4 drivers in 2×2 grid + 4 reinforcing chips */}
      <section className="rounded-2xl border border-border bg-secondary/50 p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary" strokeWidth={2} />
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            What Quickflows does
          </h3>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {DRIVER_FACTS.map((fact) => (
            <div
              key={fact.label}
              className="rounded-xl border border-primary/20 bg-brand-soft px-4 py-4"
            >
              <span
                className="tabular text-2xl font-semibold tracking-tight text-primary"
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
              <strong className="font-medium text-foreground">Staffing costs:</strong> Agency
              premium is agency hours × (agency rate minus internal rate) × 52; Quickflows
              reduces this by {Math.round(A.overtimeReduction.value * 100)}%. Overtime premium
              is overtime hours × base rate × (multiplier minus 1) × 52 — the premium above
              base only, not the full multiplier, to avoid overstating the cost; Quickflows
              reduces this by {Math.round(A.overtimeReduction.value * 100)}% too.{" "}
              <strong className="font-medium text-foreground">Scheduling effort:</strong> Labor
              is scheduling hours × scheduler rate × number of schedulers × 52; the agent
              removes {Math.round(A.coordinatorReduction.value * 100)}% of it. Turnover is
              replacements per year × cost per replacement; the agent improves retention by{" "}
              {Math.round(A.retentionImprovement.value * 100)}%.{" "}
              <strong className="font-medium text-foreground">Revenue from filled shifts</strong>{" "}
              (separate line): unfilled shifts per month × {Math.round(A.autoFillRate.value * 100)}%
              fill rate × revenue per shift × 12 months. All constants are from
              Quickflows Scheduler.
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
