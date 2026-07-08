"use client";

import { Button } from "@/components/ui/button";

const VALUE_TYPES: { name: string; detail: string; separate?: boolean }[] = [
  {
    name: "Money saved",
    detail: "Spend that stops leaving - agency, overtime, turnover.",
  },
  {
    name: "Time saved",
    detail: "Staff hours no longer spent on manual rework and review.",
  },
  {
    name: "Money recovered",
    detail: "Revenue you would have lost to denials and improper payments.",
  },
  {
    name: "Cash freed up",
    detail:
      "Money that arrives sooner. Real, but timing - not new money - so we never add it to the total.",
    separate: true,
  },
  {
    name: "Risk avoided",
    detail:
      "Fines you help prevent. A reference figure, shown but never summed.",
    separate: true,
  },
];

export function ViewMethod() {
  return (
    <div className="mx-auto max-w-3xl py-4">
      <h2 className="text-3xl font-semibold tracking-[-0.01em] text-foreground sm:text-4xl">
        How we calculate this.
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Each estimate is a simple, auditable formula:{" "}
        <span className="text-foreground">
          your volume × a published benchmark × a conservative improvement rate.
        </span>{" "}
        Nothing here is a percentage of your revenue.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h3 className="text-lg font-semibold text-foreground">
            Why we never use total revenue
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            It is easy to quote a big number by claiming a slice of your whole
            revenue. We do not. We count only specific, defensible effects -
            claims recovered, hours returned, spend cut - each tied to a
            benchmark you can look up. That keeps the number smaller and honest,
            which is the point.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-foreground">
            Where the improvement rate comes from
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The controls marked{" "}
            <span className="text-primary">Assumption</span> are the one input we
            cannot source externally. They are based on Quickflows performance
            data and are meant to be confirmed against your real before/after
            results - not taken on faith.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-foreground">
            The five value types
          </h3>
          <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)]">
            {VALUE_TYPES.map((v, i) => (
              <li
                key={v.name}
                className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground">
                    {v.name}
                  </span>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {v.detail}
                  </p>
                </div>
                <span
                  className={`shrink-0 self-start rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide sm:self-center ${v.separate ? "bg-brand-soft text-primary" : "bg-secondary text-muted-foreground"}`}
                >
                  {v.separate ? "Kept separate" : "In the total"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-secondary/50 p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Estimates are based on published industry benchmarks and Quickflows
          performance data. Actual results vary.
        </p>
        <Button
          asChild
          className="mt-5 h-11 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <a href="mailto:hello@quickflows.ai?subject=Quickflows%20demo">
            Book a 20-minute demo
          </a>
        </Button>
      </div>
    </div>
  );
}
