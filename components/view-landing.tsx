"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { useRoi } from "@/components/roi-provider";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ViewLanding() {
  const { setView } = useRoi();
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  };
  const item = reduce
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
      };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-[1120px] items-center px-6 pt-8">
        <Wordmark />
      </header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-[820px] flex-1 flex-col items-center justify-center px-6 pb-24 text-center"
      >
        <motion.h1
          variants={item}
          className="text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-5xl md:text-6xl"
        >
          See what Quickflows is worth to your operation.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
        >
          A few real numbers. A grounded estimate, built from published industry
          data and kept deliberately conservative.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-6"
        >
          <Button
            size="lg"
            onClick={() => setView("calculator")}
            className="h-12 gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-[var(--shadow-md)] transition-colors hover:bg-primary/90"
          >
            Estimate your ROI
            <ArrowRight className="size-4" />
          </Button>
          <button
            onClick={() => setView("method")}
            className="rounded-md text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            See how it works
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
