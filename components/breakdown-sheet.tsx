"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { ValueLine } from "@/components/value-line";
import { DotMatrixTotal } from "@/components/dot-matrix-total";
import { Separator } from "@/components/ui/separator";
import { useRoi } from "@/components/roi-provider";
import { sourceKeysByCategory, type ValueCategory } from "@/lib/roi-engine";

const EASE = [0.16, 1, 0.3, 1] as const;

export function BreakdownSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { results, totals } = useRoi();
  const reduce = useReducedMotion();

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const keys = (cats: ValueCategory[]) => sourceKeysByCategory(results, cats);

  const hardRows: Array<{ label: string; amount: number; cat: ValueCategory }> = [
    { label: "Money saved", amount: totals.moneySaved, cat: "moneySaved" },
    { label: "Time saved", amount: totals.timeSaved, cat: "timeSaved" },
    { label: "Money recovered", amount: totals.moneyRecovered, cat: "moneyRecovered" },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60]">
          <motion.button
            aria-label="Close breakdown"
            onClick={onClose}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Full ROI breakdown"
            initial={reduce ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: "100%" }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">
                The full breakdown
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <p className="text-sm text-muted-foreground">
                Estimated annual hard-dollar impact
              </p>
              <div className="mt-2">
                <DotMatrixTotal value={totals.hardDollar} size="md" tone="violet" />
              </div>

              <Separator className="my-5 bg-border" />

              <div>
                {hardRows.map((r) => (
                  <ValueLine
                    key={r.cat}
                    label={r.label}
                    amount={r.amount}
                    sourceKeys={keys([r.cat])}
                    emphasis
                  />
                ))}
              </div>

              {totals.cashFreed > 0 || totals.riskAvoided > 0 ? (
                <div className="mt-6">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Kept separate
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  {totals.cashFreed > 0 ? (
                    <ValueLine
                      label="Cash freed up (arrives sooner, not new money)"
                      amount={totals.cashFreed}
                    />
                  ) : null}
                  {totals.riskAvoided > 0 ? (
                    <ValueLine
                      label="Risk avoided (fines you help prevent)"
                      amount={totals.riskAvoided}
                      sourceKeys={keys(["riskAvoided"])}
                      note="Reference figure, never added into the total."
                    />
                  ) : null}
                </div>
              ) : null}

              <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
                Hard dollars are money saved, time saved, and money recovered.
                Cash freed and risk avoided are shown here for context and are
                never included in the headline total.
              </p>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
