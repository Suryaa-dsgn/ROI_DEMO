"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RoiProvider, useRoi } from "@/components/roi-provider";
import { ViewLanding } from "@/components/view-landing";
import { AppShell } from "@/components/app-shell";

const EASE = [0.16, 1, 0.3, 1] as const;

function Root() {
  const { view } = useRoi();
  const reduce = useReducedMotion();
  const isLanding = view === "landing";

  const variants = reduce
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isLanding ? "landing" : "shell"}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: EASE }}
      >
        {isLanding ? <ViewLanding /> : <AppShell />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <RoiProvider>
      <Root />
    </RoiProvider>
  );
}
