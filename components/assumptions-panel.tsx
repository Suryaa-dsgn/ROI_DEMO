"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SlidersHorizontal } from "lucide-react";
import { InputField } from "@/components/input-field";
import { useRoi } from "@/components/roi-provider";
import { fieldsByTier, type Product } from "@/lib/roi-config";

/** Advanced (tier) fields tucked behind a quiet disclosure, collapsed by default. */
export function AssumptionsPanel({ product }: { product: Product }) {
  const { values, setValue } = useRoi();
  const { advanced } = fieldsByTier(product);
  if (advanced.length === 0) return null;

  const v = values[product.id];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="assumptions" className="border-none">
        <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:no-underline data-[state=open]:rounded-b-none">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" strokeWidth={1.9} />
            Adjust assumptions
          </span>
        </AccordionTrigger>
        <AccordionContent className="rounded-b-xl border border-t-0 border-border bg-card px-4 pb-5 pt-1">
          <p className="mb-4 mt-1 text-xs leading-relaxed text-muted-foreground">
            Adjust the inputs below to match your organization&apos;s situation.
          </p>
          <div className="grid grid-cols-1 gap-5">
            {advanced.map((f) => (
              <InputField
                key={f.key}
                field={f}
                value={v[f.key]}
                onChange={(val) => setValue(product.id, f.key, val)}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
