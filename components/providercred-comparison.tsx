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
  PROVIDERCRED_AGENT,
  fieldsByTier,
  type Product,
} from "@/lib/roi-config";
import { formatPercent } from "@/lib/format";

const A = PROVIDERCRED_AGENT;

// Two driver cards — both drive the math.
const DRIVER_FACTS = [
  { value: `${Math.round(A.credentialingTimeReduction.value * 100)}%`,   label: "of manual credentialing work eliminated" },
  { value: `${Math.round(A.recredentialingTimeReduction.value * 100)}%`, label: "of recredentialing time eliminated" },
];

// Reinforcing facts — display only, never monetized.
const REINFORCING_FACTS = [
  { value: `${Math.round(A.complianceExposure.value * 100)}%`,  label: "less compliance exposure" },
  { value: `${Math.round(A.recredentialingFact.value * 100)}%`, label: "faster recredentialing cycles" },
  { value: `${Math.round(A.alertPrecision.value * 100)}%`,      label: "alert precision" },
  { value: "100%",                                               label: "audit-ready reporting" },
];

const CALC_ROWS = [
  { display: formatPercent(A.credentialingTimeReduction.value),   label: A.credentialingTimeReduction.label,   source: A.credentialingTimeReduction.source },
  { display: formatPercent(A.recredentialingTimeReduction.value), label: A.recredentialingTimeReduction.label, source: A.recredentialingTimeReduction.source },
  { display: "$2M+",                                              label: A.riskAvoidedPerYear.label,            source: A.riskAvoidedPerYear.source },
];

/**
 * Comparison-mode module for ProviderCred (annual). Left: two labeled input
 * groups (new credentialing / recredentialing) + shared rate. Right (sticky):
 * two-row table with group dividers + compliance-risk separate block.
 * Two driver cards in a grid + four reinforcing chips below. No caption.
 */
export function ProviderCredComparison({ product }: { product: Product }) {
  const { values, setValue } = useRoi();
  const { core } = fieldsByTier(product);
  const v = values[product.id];
  const c = product.comparison?.(v);
  if (!c) return null;

  const credFields   = core.filter((f) => f.group === "credentialing");
  const recredFields = core.filter((f) => f.group === "recredentialing");
  const sharedFields = core.filter((f) => f.group === "shared");

  const rows = c.rows;
  const groupsSeen = new Set<string>();

  return (
    <div className="space-y-6">
      {/* Top row — inputs left, live savings right. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        {/* Left — the client's operational reality */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Your process today
          </h3>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Manual credentialing and recredentialing consume thousands of staff
            hours per year. Here is what that costs today, and what the agent
            eliminates.
          </p>

          {/* Group 1 — New credentialing */}
          <p className="mt-7 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            New credentialing
          </p>
          <div className="mt-3 grid grid-cols-1 gap-6">
            {credFields.map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={v[f.key]}
                onChange={(val) => setValue(product.id, f.key, val)}
              />
            ))}
          </div>

          {/* Group 2 — Recredentialing */}
          <p className="mt-7 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recredentialing
          </p>
          <div className="mt-3 grid grid-cols-1 gap-6">
            {recredFields.map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={v[f.key]}
                onChange={(val) => setValue(product.id, f.key, val)}
              />
            ))}
          </div>

          {/* Shared rate */}
          <div className="mt-6 grid grid-cols-1 gap-6">
            {sharedFields.map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={v[f.key]}
                onChange={(val) => setValue(product.id, f.key, val)}
              />
            ))}
          </div>
        </section>

        {/* Right (sticky) — savings headline + table + compliance risk separate */}
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

          {/* Compliance risk — separate, never in the total */}
          {c.separate ? (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {c.separate.label ?? "Compliance exposure avoided"}
                  </p>
                  <p className="mt-0.5 text-[0.7rem] leading-snug text-muted-foreground">
                    {c.separate.note ?? "Kept separate, never in the total above."}
                  </p>
                </div>
                <span className="tabular shrink-0 font-mono text-sm font-semibold text-foreground">
                  $2M+ / yr
                </span>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {/* What Quickflows does — 2 driver cards + 4 reinforcing chips */}
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
              <strong className="font-medium text-foreground">New credentialing:</strong> providers per year × minutes ÷ 60 × hourly rate = manual cost; Quickflows eliminates{" "}
              {Math.round(A.credentialingTimeReduction.value * 100)}% of it.{" "}
              <strong className="font-medium text-foreground">Recredentialing:</strong> same formula with the recredentialing volume and time; Quickflows eliminates{" "}
              {Math.round(A.recredentialingTimeReduction.value * 100)}% of it. Both use your organization&apos;s real numbers - no external benchmarks. The compliance exposure ($2M+) is the Quickflows figure, shown separately and never added to the labor total.
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
