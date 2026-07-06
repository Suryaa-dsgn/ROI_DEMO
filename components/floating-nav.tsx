"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Calculator, BookOpen, ListChecks } from "lucide-react";
import { useRoi, type View } from "@/components/roi-provider";

const ITEMS: { view: View; label: string; icon: typeof Calculator }[] = [
  { view: "calculator", label: "Calculate", icon: Calculator },
  { view: "method", label: "How it works", icon: BookOpen },
  { view: "sources", label: "Sources", icon: ListChecks },
];

export function FloatingNav() {
  const { view, setView } = useRoi();
  const reduce = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <motion.nav
        aria-label="Sections"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto flex w-full max-w-md items-center gap-1 rounded-full border border-border bg-card/85 px-2.5 py-2 shadow-[var(--shadow-lg)] backdrop-blur-md sm:w-auto sm:gap-2"
      >
        {ITEMS.map((item) => {
          const active = view === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:flex-none"
            >
              {active ? (
                <motion.span
                  layoutId="nav-pill"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 36 }
                  }
                  className="absolute inset-0 rounded-full bg-brand-soft"
                />
              ) : null}
              <span
                className={`relative z-10 flex items-center gap-2 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="size-4" strokeWidth={1.9} />
                <span className="whitespace-nowrap">{item.label}</span>
              </span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}
