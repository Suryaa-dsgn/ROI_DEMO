"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Building2, ShieldCheck, HomeIcon, ArrowRight } from "lucide-react";
import { useRoi } from "@/components/roi-provider";
import type { Segment } from "@/lib/roi-engine";

const OPTIONS: {
  segment: Segment;
  title: string;
  description: string;
  icon: typeof Building2;
}[] = [
  {
    segment: "provider",
    title: "Provider / Hospital",
    description: "Hospitals and provider groups billing claims.",
    icon: Building2,
  },
  {
    segment: "payer",
    title: "Health Plan",
    description: "Payers adjudicating and paying claims.",
    icon: ShieldCheck,
  },
  {
    segment: "homeHealth",
    title: "Home Health / Agency",
    description: "Home health and staffing agencies.",
    icon: HomeIcon,
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function OrgTypePicker() {
  const { chooseSegment } = useRoi();
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto max-w-3xl py-8 text-center sm:py-14">
      <h2 className="text-2xl font-semibold tracking-[-0.01em] text-foreground sm:text-3xl">
        What kind of organization are you?
      </h2>
      <p className="mt-3 text-muted-foreground">
        Pick one to see the products and numbers that apply to you.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {OPTIONS.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <motion.button
              key={opt.segment}
              onClick={() => chooseSegment(opt.segment)}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
              className="group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 text-left shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-md)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-primary">
                <Icon className="size-5" strokeWidth={1.9} />
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-foreground">
                  {opt.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {opt.description}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Choose
                <ArrowRight className="size-3.5" />
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
