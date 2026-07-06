"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRoi } from "@/components/roi-provider";

/** Slim pills for the segment's products; one active at a time. */
export function ProductSwitcher() {
  const { activeProducts, activeProductId, setActiveProductId } = useRoi();
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Products">
      {activeProducts.map((p) => {
        const active = p.id === activeProductId;
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={active}
            onClick={() => setActiveProductId(p.id)}
            className="relative rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {active ? (
              <motion.span
                layoutId="product-pill"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 36 }
                }
                className="absolute inset-0 rounded-full bg-foreground"
              />
            ) : null}
            <span
              className={`relative z-10 ${active ? "text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              {p.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
