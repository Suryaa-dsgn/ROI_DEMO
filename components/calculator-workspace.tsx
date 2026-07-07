"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ListTree } from "lucide-react";
import { ProductSwitcher } from "@/components/product-switcher";
import { InputField } from "@/components/input-field";
import { ResultFocus } from "@/components/result-focus";
import { RunningTotal } from "@/components/running-total";
import { AssumptionsPanel } from "@/components/assumptions-panel";
import { BreakdownSheet } from "@/components/breakdown-sheet";
import { EligibilityComparison } from "@/components/eligibility-comparison";
import { RcmProviderComparison } from "@/components/rcm-provider-comparison";
import { ProviderCredComparison } from "@/components/providercred-comparison";
import { ReferralComparison } from "@/components/referral-comparison";
import { useRoi } from "@/components/roi-provider";
import { fieldsByTier } from "@/lib/roi-config";

const EASE = [0.16, 1, 0.3, 1] as const;

const SEGMENT_LABEL: Record<string, string> = {
  provider: "Provider / Hospital",
  payer: "Health Plan",
  homeHealth: "Home Health / Agency",
};

export function CalculatorWorkspace() {
  const { segment, resetSegment, activeProduct, activeProductId, values, setValue } =
    useRoi();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const reduce = useReducedMotion();

  if (!activeProduct || !segment) return null;
  const { core } = fieldsByTier(activeProduct);
  const v = values[activeProduct.id];
  const isComparison = activeProduct.outputMode === "comparison";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={resetSegment}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-3.5" />
          {SEGMENT_LABEL[segment]}
        </button>
        {/* The full breakdown is an annual, category-based view; hidden for the
            standalone monthly comparison agent. */}
        {isComparison ? null : (
          <button
            onClick={() => setShowBreakdown(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-sm)] transition-all hover:-translate-y-px hover:shadow-[var(--shadow-md)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ListTree className="size-4 text-muted-foreground" strokeWidth={1.9} />
            See the full breakdown
          </button>
        )}
      </div>

      {/* The combined running total is annual; the monthly comparison agent
          presents its own totals and is excluded from it. */}
      {isComparison ? null : <RunningTotal />}

      <div className={isComparison ? "" : "mt-6"}>
        <ProductSwitcher />
      </div>

      {isComparison ? (
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProductId}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {activeProduct.id === "rcm-provider" ? (
                <RcmProviderComparison product={activeProduct} />
              ) : activeProduct.id === "providercred" ? (
                <ProviderCredComparison product={activeProduct} />
              ) : activeProduct.id === "referral" ? (
                <ReferralComparison product={activeProduct} />
              ) : (
                <EligibilityComparison product={activeProduct} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(300px,360px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProductId}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] sm:p-7"
            >
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {activeProduct.name}
              </h3>
              <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {activeProduct.blurb}
              </p>

              <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {core.map((f) => (
                  <InputField
                    key={f.key}
                    field={f}
                    value={v[f.key]}
                    onChange={(val) => setValue(activeProduct.id, f.key, val)}
                  />
                ))}
              </div>

              {activeProduct.disabledLines?.length ? (
                <div className="mt-6 space-y-1.5">
                  {activeProduct.disabledLines.map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground"
                    >
                      <span>{d.label}</span>
                      <span className="italic">{d.reason}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-7">
                <AssumptionsPanel product={activeProduct} />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="lg:pt-0">
            <div className="lg:sticky lg:top-8">
              <ResultFocus product={activeProduct} />
            </div>
          </div>
        </div>
      )}

      <BreakdownSheet open={showBreakdown} onClose={() => setShowBreakdown(false)} />
    </div>
  );
}
