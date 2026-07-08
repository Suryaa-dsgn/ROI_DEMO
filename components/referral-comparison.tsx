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
  REFERRAL_AGENT,
  fieldsByTier,
  type Product,
} from "@/lib/roi-config";
import { formatPercent } from "@/lib/format";

const A = REFERRAL_AGENT;

const DRIVER_FACT = {
  value: `${Math.round(A.coordinatorWorkReduction.value * 100)}%`,
  label: "of manual referral coordination time eliminated",
};

// Reinforcing fact chips. cycleDays uses before/after for "7→1 days".
// "2,000+" is a reference label excluded from the constant (can't display as a dollar).
const REINFORCING_FACTS: { value: string; label: string }[] = [
  { value: `${A.cycleDays.before}→${A.cycleDays.after} days`, label: "avg referral cycle time" },
  { value: `${Math.round(A.inNetworkRate.value * 100)}%`,     label: "more referrals in-network" },
  { value: `${Math.round(A.authDelays.value * 100)}%`,        label: "fewer auth delays" },
  { value: `${Math.round(A.referralVisibility.value * 100)}%`, label: "referral visibility" },
  { value: `${Math.round(A.intakeProcessing.value * 100)}%`,  label: "less intake processing" },
  { value: "2,000+",                                           label: "coordinator hours saved / yr" },
];

const CALC_ROWS = [
  { display: formatPercent(A.coordinatorWorkReduction.value), label: A.coordinatorWorkReduction.label, source: A.coordinatorWorkReduction.source },
  { display: formatPercent(A.leakageReduction.value),         label: A.leakageReduction.label,         source: A.leakageReduction.source },
];

/**
 * Comparison-mode module for Referral Management (monthly, standalone). Left:
 * three editable client inputs. Right (sticky): coordinator-labor headline and
 * comparison table, with the leakage capability fact clearly separated below.
 * Reinforcing poster facts shown but never summed.
 */
export function ReferralComparison({ product }: { product: Product }) {
  const { values, setValue } = useRoi();
  const { core } = fieldsByTier(product);
  const v = values[product.id];
  const c = product.comparison?.(v);
  if (!c) return null;

  return (
    <div className="space-y-6">
      {/* Top row — inputs and live savings side by side (no scroll). */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        {/* Left — the client's reality (only editable area) */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Your process today
          </h3>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Your coordinators spend significant time on every referral -
            capturing, validating, matching, chasing authorizations, and closing
            the loop. Here is what that costs today, and how much of it the
            agent handles.
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
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Minutes per referral should cover intake, validation, prior-auth
            follow-up, and closing the loop.
          </p>
        </section>

        {/* Right (sticky) — monthly savings + leakage fact */}
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">Per month</th>
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
                  <td className="px-4 py-3 font-semibold text-foreground">Total per month</td>
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

          {/* Leakage fact — clearly separated, no dollar figure */}
          {c.leakageFact ? (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-4">
              <p className="text-sm font-semibold text-foreground">
                {c.leakageFact.display}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Every out-of-network referral is lost revenue and a gap in care
                continuity. Quickflows reduces leakage by{" "}
                <span className="font-medium text-primary">
                  {Math.round(c.leakageFact.value * 100)}%
                </span>{" "}
                by prioritizing in-network providers automatically.
              </p>
              <p className="mt-2 text-[0.7rem] leading-snug text-muted-foreground">
                {c.leakageFact.note}
              </p>
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

      </section>

      {/* How this is calculated — full width */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how" className="border-none">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:no-underline data-[state=open]:rounded-b-none">
            How this is calculated
          </AccordionTrigger>
          <AccordionContent className="rounded-b-xl border border-t-0 border-border bg-card px-4 pb-4 pt-1">
            <p className="mb-3 mt-1 text-xs leading-relaxed text-muted-foreground">
              Manual labor is referrals per month × minutes per referral ÷ 60 ×
              coordinator hourly cost. The agent removes{" "}
              {Math.round(A.coordinatorWorkReduction.value * 100)}% of manual
              referral coordination time (from Quickflows). The{" "}
              {Math.round(A.leakageReduction.value * 100)}% leakage reduction is
              a real outcome shown as a capability fact - it has no dollar figure
              because the value of a kept referral varies by contract. The
              minutes per referral and coordinator cost are your organization&apos;s
              own numbers, not Quickflows performance data. No external benchmarks
              are used for this agent.
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
