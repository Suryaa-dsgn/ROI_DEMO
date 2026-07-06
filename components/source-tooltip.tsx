"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BENCHMARKS, type BenchmarkKey } from "@/lib/roi-config";

/**
 * Small info affordance that reveals the benchmark label + source on hover
 * AND focus (keyboard/touch reachable). This citation is the differentiator:
 * a generic calculator invents numbers; ours cites them.
 */
export function SourceTooltip({
  sourceKeys,
  label = "Show source",
  className,
}: {
  sourceKeys: BenchmarkKey[];
  label?: string;
  className?: string;
}) {
  const keys = sourceKeys.filter((k) => k in BENCHMARKS);
  if (keys.length === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        className={`inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${className ?? ""}`}
      >
        <Info className="size-3.5" strokeWidth={1.75} />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs border-border bg-popover text-popover-foreground">
        <ul className="space-y-1.5">
          {keys.map((k) => {
            const bench = BENCHMARKS[k];
            return (
              <li key={k} className="text-xs leading-snug">
                <span className="text-foreground">{bench.label}</span>
                <span className="text-muted-foreground">
                  {" "}
                  — {bench.source}
                </span>
              </li>
            );
          })}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
