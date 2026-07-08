"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSource } from "@/lib/roi-config";

/**
 * Small info affordance that reveals the benchmark label + source on hover
 * AND focus (keyboard/touch reachable). This citation is the differentiator:
 * a generic calculator invents numbers; ours cites them. Keys resolve across
 * the shared BENCHMARKS and the eligibility constant/default maps.
 */
export function SourceTooltip({
  sourceKeys,
  label = "Show source",
  className,
}: {
  sourceKeys: string[];
  label?: string;
  className?: string;
}) {
  const resolved = sourceKeys
    .map((k) => ({ key: k, source: getSource(k) }))
    .filter((r): r is { key: string; source: { label: string; source: string } } =>
      r.source !== null,
    );
  if (resolved.length === 0) return null;

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
          {resolved.map(({ key, source }) => (
            <li key={key} className="text-xs leading-snug">
              <span className="text-foreground">{source.label}</span>
              <span className="text-muted-foreground"> - {source.source}</span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
