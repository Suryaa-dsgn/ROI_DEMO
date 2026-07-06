"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { OrgTypePicker } from "@/components/org-type-picker";
import { CalculatorWorkspace } from "@/components/calculator-workspace";
import { useRoi } from "@/components/roi-provider";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ViewCalculator() {
  const { segment } = useRoi();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={segment ? "workspace" : "org"}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        {segment ? <CalculatorWorkspace /> : <OrgTypePicker />}
      </motion.div>
    </AnimatePresence>
  );
}
