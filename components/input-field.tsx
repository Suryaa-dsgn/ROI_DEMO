"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { SourceTooltip } from "@/components/source-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/format";
import type { Field } from "@/lib/roi-config";

function clamp(n: number, min?: number, max?: number): number {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

/** A small "assumption" tag + explanation for attribution controls. */
function AssumptionTag() {
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label="Why this is an assumption"
        className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-brand-soft px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-primary transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <CircleHelp className="size-3" strokeWidth={2} />
        Assumption
      </TooltipTrigger>
      <TooltipContent className="max-w-xs border-border bg-popover text-xs leading-snug text-popover-foreground">
        Our estimate, based on Quickflows performance data. To be confirmed with
        your real before/after results.
      </TooltipContent>
    </Tooltip>
  );
}

function FieldHeader({ field }: { field: Field }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <Label
          htmlFor={field.key}
          className="text-sm font-normal text-foreground"
        >
          {field.label}
        </Label>
        {field.sourceKey ? (
          <SourceTooltip sourceKeys={[field.sourceKey]} label="Show benchmark source" />
        ) : null}
        {field.hint ? (
          <Tooltip>
            <TooltipTrigger
              aria-label="More detail"
              className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <CircleHelp className="size-3.5" strokeWidth={1.75} />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs border-border bg-popover text-xs leading-snug text-popover-foreground">
              {field.hint}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {field.attribution ? <AssumptionTag /> : null}
    </div>
  );
}

export function InputField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: number;
  onChange: (v: number) => void;
}) {
  const isSlider = field.type === "slider";

  // ---- Slider (attribution / rate controls) ----
  if (isSlider) {
    return (
      <div className="space-y-2.5">
        <FieldHeader field={field} />
        <div className="flex items-center gap-4">
          <Slider
            id={field.key}
            value={[value]}
            min={field.min ?? 0}
            max={field.max ?? 1}
            step={field.step ?? 0.01}
            onValueChange={([v]) => onChange(clamp(v, field.min, field.max))}
            aria-label={field.label}
            className="flex-1"
          />
          <span className="tabular w-14 shrink-0 text-right font-mono text-sm font-semibold text-primary">
            {formatPercent(value)}
          </span>
        </div>
      </div>
    );
  }

  // ---- Text-backed numeric input (number / currency / percent) ----
  return (
    <div className="space-y-2">
      <FieldHeader field={field} />
      <NumericInput field={field} value={value} onChange={onChange} />
    </div>
  );
}

function NumericInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: number;
  onChange: (v: number) => void;
}) {
  const isPercent = field.type === "percent";
  const isCurrency = field.type === "currency";

  const toDisplay = (n: number) =>
    isPercent ? String(round2(n * 100)) : formatNumber(n);

  // When unfocused the input renders toDisplay(value) directly, so local text
  // only matters while editing — no effect syncing needed.
  const [text, setText] = useState(toDisplay(value));
  const [focused, setFocused] = useState(false);

  const commit = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    if (cleaned === "" || cleaned === ".") {
      onChange(clamp(0, field.min, field.max));
      return;
    }
    const parsed = parseFloat(cleaned);
    if (Number.isNaN(parsed)) return;
    const asFraction = isPercent ? parsed / 100 : parsed;
    onChange(clamp(asFraction, field.min, field.max));
  };

  return (
    <div className="relative">
      {isCurrency ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          $
        </span>
      ) : null}
      <Input
        id={field.key}
        inputMode="decimal"
        value={focused ? text : toDisplay(value)}
        onFocus={(e) => {
          setFocused(true);
          setText(toDisplay(value));
          e.currentTarget.select();
        }}
        onChange={(e) => {
          setText(e.target.value);
          commit(e.target.value);
        }}
        onBlur={() => {
          setFocused(false);
          setText(toDisplay(value));
        }}
        aria-label={field.label}
        className={`tabular h-11 bg-card font-mono text-foreground ${isCurrency ? "pl-7" : ""} ${field.unit && !isCurrency ? "pr-16" : ""} ${isPercent ? "pr-8" : ""}`}
      />
      {isPercent ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          %
        </span>
      ) : field.unit && !isCurrency ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {field.unit}
        </span>
      ) : null}
    </div>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
