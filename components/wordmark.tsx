"use client";

import Image from "next/image";
import { useRoi } from "@/components/roi-provider";

/** Quickflows wordmark. Always returns to the landing view. */
export function Wordmark({ className }: { className?: string }) {
  const { setView } = useRoi();
  return (
    <button
      onClick={() => setView("landing")}
      className={`inline-flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${className ?? ""}`}
      aria-label="Quickflows — back to start"
    >
      <Image
        src="/logo-purple.svg"
        alt=""
        width={25}
        height={26}
        aria-hidden
        priority
      />
      <span className="text-[0.95rem] font-semibold tracking-tight text-foreground">
        Quickflows
      </span>
    </button>
  );
}
