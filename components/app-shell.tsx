"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Wordmark } from "@/components/wordmark";
import { FloatingNav } from "@/components/floating-nav";
import { ViewCalculator } from "@/components/view-calculator";
import { ViewMethod } from "@/components/view-method";
import { ViewSources } from "@/components/view-sources";
import { useRoi } from "@/components/roi-provider";

const EASE = [0.16, 1, 0.3, 1] as const;

export function AppShell() {
  const { view } = useRoi();
  const reduce = useReducedMotion();

  const variants = reduce
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      };

  return (
    <div className="relative min-h-dvh">
      <header className="mx-auto flex w-full max-w-[1120px] items-center px-6 pt-8">
        <Wordmark />
      </header>

      <main className="mx-auto w-full max-w-[1120px] px-6 pb-40 pt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: EASE }}
          >
            {view === "calculator" ? <ViewCalculator /> : null}
            {view === "method" ? <ViewMethod /> : null}
            {view === "sources" ? <ViewSources /> : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <FloatingNav />
    </div>
  );
}
