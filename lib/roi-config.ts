// lib/roi-config.ts
// Config-driven ROI definitions. Every benchmark is externally sourced.
// Improvement / attribution values are illustrative placeholders capped below
// the marketing claim — replace with measured Quickflows deployment data
// before using with live prospects (see FINAL BUILD_CONTEXT Sections 7 & 14).
//
// Fields carry a `tier`: "core" fields show by default; "advanced" fields live
// behind the "Adjust assumptions" disclosure. Core fields are listed first.

import type { LineItem, Segment } from "./roi-engine";

export const BENCHMARKS = {
  initialDenialRate: {
    value: 0.118,
    label: "Initial claim denial rate",
    source: "Kodiak Solutions, 2024",
  },
  reworkCost: {
    value: 50,
    label: "Cost to rework one denied claim (midpoint of $25–$118)",
    source: "MGMA / Change Healthcare",
  },
  neverReworked: {
    value: 0.65,
    label: "Share of denied claims never reworked",
    source: "MGMA",
  },
  rnReplacement: {
    value: 60090,
    label: "Cost to replace one staff RN",
    source: "NSI 2026",
  },
  rnTurnover: {
    value: 0.176,
    label: "RN turnover rate",
    source: "NSI 2026",
  },
  agencyGap: {
    value: 66081,
    label: "Agency vs employed RN cost gap per FTE",
    source: "NSI 2026",
  },
  manualClaimCost: {
    value: 20,
    label: "Cost of a human-reviewed claim",
    source: "Healthcare Finance News",
  },
  autoAdjBaseline: {
    value: 0.8,
    label: "Baseline auto-adjudication rate",
    source: "Industry norm",
  },
  improperRate: {
    value: 0.06,
    label: "Improper payment rate (Medicare)",
    source: "CMS",
  },
  exclusionFine: {
    value: 6500000,
    label: "Single excluded-provider fine (peer case)",
    source: "OIG / Exclusion Screening, 2025",
  },
} as const;

export type BenchmarkKey = keyof typeof BENCHMARKS;

export type FieldType = "number" | "currency" | "percent" | "slider";
export type Tier = "core" | "advanced";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  tier: Tier; // core shows by default; advanced lives under "Adjust assumptions"
  default: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string; // e.g. "claims/yr", "$"
  hint?: string; // small helper text
  attribution?: boolean; // "how much we fix" control; tag as assumption
  sourceKey?: BenchmarkKey; // show source when default comes from a benchmark
}

export interface DisabledLine {
  label: string;
  reason: string; // shown in a disabled placeholder row
}

export interface Product {
  id: string;
  name: string;
  segments: Segment[];
  blurb: string;
  fields: Field[];
  compute: (v: Record<string, number>) => LineItem[];
  disabledLines?: DisabledLine[];
}

const b = BENCHMARKS;

export const PRODUCTS: Product[] = [
  {
    id: "eligibility",
    name: "AI Eligibility Verification",
    segments: ["provider", "homeHealth"],
    blurb:
      "Confirms coverage before care, so claims are not denied for eligibility errors later.",
    fields: [
      {
        key: "annualClaims",
        label: "Claims per year",
        type: "number",
        tier: "core",
        default: 100000,
        min: 1000,
        step: 1000,
        unit: "claims/yr",
      },
      {
        key: "avgReimbursement",
        label: "Average payment per claim",
        type: "currency",
        tier: "core",
        default: 200,
        min: 10,
        step: 10,
        unit: "$",
      },
      {
        key: "coverageDenialRate",
        label: "Coverage-related denial rate",
        type: "percent",
        tier: "advanced",
        default: 0.03,
        min: 0.01,
        max: 0.1,
        step: 0.005,
        hint: "Portion of claims denied for coverage",
      },
      {
        key: "denialReduction",
        label: "How much we reduce these denials",
        type: "slider",
        tier: "advanced",
        default: 0.4,
        min: 0.1,
        max: 0.45,
        step: 0.05,
        attribution: true,
      },
    ],
    compute: (v) => {
      const denials = v.annualClaims * v.coverageDenialRate;
      const reduced = denials * v.denialReduction;
      const recovered = reduced * b.neverReworked.value * v.avgReimbursement;
      const timeSaved = reduced * (1 - b.neverReworked.value) * b.reworkCost.value;
      return [
        {
          category: "moneyRecovered",
          label: "Denials recovered",
          amount: recovered,
          sourceKeys: ["neverReworked", "initialDenialRate"],
        },
        {
          category: "timeSaved",
          label: "Rework time saved",
          amount: timeSaved,
          sourceKeys: ["reworkCost"],
        },
      ];
    },
  },

  {
    id: "rcm-provider",
    name: "RCM — Provider",
    segments: ["provider"],
    blurb:
      "Runs the full billing cycle: clean claims out, denials prevented and recovered, cash in sooner.",
    fields: [
      {
        key: "annualClaims",
        label: "Claims per year",
        type: "number",
        tier: "core",
        default: 200000,
        min: 1000,
        step: 1000,
        unit: "claims/yr",
      },
      {
        key: "avgReimbursement",
        label: "Average payment per claim",
        type: "currency",
        tier: "core",
        default: 300,
        min: 10,
        step: 10,
        unit: "$",
      },
      {
        key: "annualRevenue",
        label: "Annual revenue",
        type: "currency",
        tier: "core",
        default: 60000000,
        min: 1000000,
        step: 1000000,
        unit: "$",
        hint: "Used only for the cash-freed line",
      },
      {
        key: "denialRate",
        label: "Current denial rate",
        type: "percent",
        tier: "advanced",
        default: 0.118,
        min: 0.03,
        max: 0.25,
        step: 0.005,
        sourceKey: "initialDenialRate",
      },
      {
        key: "daysARReduced",
        label: "Days sooner you get paid",
        type: "number",
        tier: "advanced",
        default: 5,
        min: 1,
        max: 30,
        step: 1,
        unit: "days",
      },
      {
        key: "denialReduction",
        label: "How much we reduce denials",
        type: "slider",
        tier: "advanced",
        default: 0.3,
        min: 0.1,
        max: 0.35,
        step: 0.05,
        attribution: true,
      },
    ],
    compute: (v) => {
      const denials = v.annualClaims * v.denialRate;
      const reduced = denials * v.denialReduction;
      const recovered = reduced * b.neverReworked.value * v.avgReimbursement;
      const timeSaved = reduced * (1 - b.neverReworked.value) * b.reworkCost.value;
      const cashFreed = (v.annualRevenue / 365) * v.daysARReduced;
      return [
        {
          category: "moneyRecovered",
          label: "Denials recovered",
          amount: recovered,
          sourceKeys: ["neverReworked", "initialDenialRate"],
        },
        {
          category: "timeSaved",
          label: "Rework time saved",
          amount: timeSaved,
          sourceKeys: ["reworkCost"],
        },
        {
          category: "cashFreed",
          label: "Cash freed (faster AR)",
          amount: cashFreed,
          sourceKeys: [],
          note: "Timing, not new money",
        },
      ];
    },
  },

  {
    id: "rcm-payer",
    name: "RCM — Payer",
    segments: ["payer"],
    blurb:
      "Auto-decides routine claims and catches improper payments, so staff handle only exceptions.",
    fields: [
      {
        key: "annualClaims",
        label: "Claims processed per year",
        type: "number",
        tier: "core",
        default: 2000000,
        min: 10000,
        step: 10000,
        unit: "claims/yr",
      },
      {
        key: "currentAutoRate",
        label: "Current auto-decision rate",
        type: "percent",
        tier: "core",
        default: 0.8,
        min: 0.5,
        max: 0.9,
        step: 0.01,
        sourceKey: "autoAdjBaseline",
      },
      {
        key: "claimsPaidDollars",
        label: "Total claims paid per year",
        type: "currency",
        tier: "core",
        default: 500000000,
        min: 1000000,
        step: 1000000,
        unit: "$",
      },
      {
        key: "targetAutoRate",
        label: "Auto-decision rate with us",
        type: "slider",
        tier: "advanced",
        default: 0.88,
        min: 0.8,
        max: 0.94,
        step: 0.01,
        attribution: true,
      },
      {
        key: "improperRate",
        label: "Improper payment rate",
        type: "percent",
        tier: "advanced",
        default: 0.06,
        min: 0.02,
        max: 0.1,
        step: 0.005,
        sourceKey: "improperRate",
      },
      {
        key: "improperCatch",
        label: "Extra improper payments we catch",
        type: "slider",
        tier: "advanced",
        default: 0.1,
        min: 0.05,
        max: 0.25,
        step: 0.05,
        attribution: true,
      },
    ],
    compute: (v) => {
      const manualReduction =
        v.annualClaims * Math.max(0, v.targetAutoRate - v.currentAutoRate);
      const timeSaved = manualReduction * b.manualClaimCost.value;
      const recovered = v.claimsPaidDollars * v.improperRate * v.improperCatch;
      return [
        {
          category: "timeSaved",
          label: "Manual review avoided",
          amount: timeSaved,
          sourceKeys: ["manualClaimCost", "autoAdjBaseline"],
        },
        {
          category: "moneyRecovered",
          label: "Improper payments caught",
          amount: recovered,
          sourceKeys: ["improperRate"],
        },
      ];
    },
  },

  {
    id: "providercred",
    name: "ProviderCred (Credentialing)",
    segments: ["provider", "homeHealth"],
    blurb:
      "Verifies and monitors every provider automatically, so billing starts sooner and fines are avoided.",
    fields: [
      {
        key: "providersPerYear",
        label: "Providers credentialed per year",
        type: "number",
        tier: "core",
        default: 500,
        min: 10,
        step: 10,
        unit: "providers/yr",
      },
      {
        key: "newBillingProviders",
        label: "New billing providers per year",
        type: "number",
        tier: "core",
        default: 100,
        min: 0,
        step: 5,
        unit: "providers",
      },
      {
        key: "billingPerDay",
        label: "Revenue a provider bills per day",
        type: "currency",
        tier: "core",
        default: 2000,
        min: 100,
        step: 100,
        unit: "$/day",
      },
      {
        key: "hoursSavedPerCheck",
        label: "Hours saved per check",
        type: "number",
        tier: "advanced",
        default: 4,
        min: 1,
        max: 20,
        step: 1,
        unit: "hrs",
      },
      {
        key: "staffHourly",
        label: "Staff hourly cost",
        type: "currency",
        tier: "advanced",
        default: 35,
        min: 15,
        step: 5,
        unit: "$/hr",
      },
      {
        key: "daysOnboardingSaved",
        label: "Days billing starts sooner",
        type: "number",
        tier: "advanced",
        default: 20,
        min: 1,
        max: 90,
        step: 1,
        unit: "days",
      },
    ],
    compute: (v) => {
      const timeSaved = v.providersPerYear * v.hoursSavedPerCheck * v.staffHourly;
      const cashFreed =
        v.newBillingProviders * v.daysOnboardingSaved * v.billingPerDay;
      return [
        {
          category: "timeSaved",
          label: "Verification time saved",
          amount: timeSaved,
          sourceKeys: [],
        },
        {
          category: "cashFreed",
          label: "Revenue captured earlier",
          amount: cashFreed,
          sourceKeys: [],
          note: "Timing; new billing providers only",
        },
        {
          category: "riskAvoided",
          label: "Exclusion-fine exposure avoided",
          amount: b.exclusionFine.value,
          sourceKeys: ["exclusionFine"],
          note: "Reference figure, not summed",
        },
      ];
    },
  },

  {
    id: "scheduler",
    name: "Quickflows Scheduler",
    segments: ["homeHealth", "provider"],
    blurb:
      "Fills open shifts and replaces call-offs automatically, cutting agency spend, overtime, and burnout.",
    fields: [
      {
        key: "agencySpend",
        label: "Agency / temp spend per year",
        type: "currency",
        tier: "core",
        default: 800000,
        min: 0,
        step: 10000,
        unit: "$",
      },
      {
        key: "overtimeSpend",
        label: "Overtime spend per year",
        type: "currency",
        tier: "core",
        default: 300000,
        min: 0,
        step: 10000,
        unit: "$",
      },
      {
        key: "departuresPrevented",
        label: "Burnout departures prevented per year",
        type: "number",
        tier: "core",
        default: 4,
        min: 0,
        max: 50,
        step: 1,
        unit: "people",
      },
      {
        key: "agencyReduction",
        label: "How much we cut agency spend",
        type: "slider",
        tier: "advanced",
        default: 0.2,
        min: 0.05,
        max: 0.35,
        step: 0.05,
        attribution: true,
      },
      {
        key: "overtimeReduction",
        label: "How much we cut overtime",
        type: "slider",
        tier: "advanced",
        default: 0.15,
        min: 0.05,
        max: 0.3,
        step: 0.05,
        attribution: true,
      },
      {
        key: "replacementCost",
        label: "Cost to replace one caregiver",
        type: "currency",
        tier: "advanced",
        default: 60090,
        min: 10000,
        step: 1000,
        unit: "$",
        sourceKey: "rnReplacement",
        hint: "RN benchmark; use your role-specific cost for aides",
      },
      {
        key: "coordinatorHoursSaved",
        label: "Coordinator hours saved per year",
        type: "number",
        tier: "advanced",
        default: 300,
        min: 0,
        step: 25,
        unit: "hrs",
      },
      {
        key: "coordinatorHourly",
        label: "Coordinator hourly cost",
        type: "currency",
        tier: "advanced",
        default: 30,
        min: 15,
        step: 5,
        unit: "$/hr",
      },
    ],
    compute: (v) => {
      const agencySaved = v.agencySpend * v.agencyReduction;
      const overtimeSaved = v.overtimeSpend * v.overtimeReduction;
      const turnoverSaved = v.departuresPrevented * v.replacementCost;
      const timeSaved = v.coordinatorHoursSaved * v.coordinatorHourly;
      return [
        {
          category: "moneySaved",
          label: "Agency spend cut",
          amount: agencySaved,
          sourceKeys: ["agencyGap"],
        },
        {
          category: "moneySaved",
          label: "Overtime cut",
          amount: overtimeSaved,
          sourceKeys: [],
        },
        {
          category: "moneySaved",
          label: "Turnover avoided",
          amount: turnoverSaved,
          sourceKeys: ["rnReplacement", "rnTurnover"],
        },
        {
          category: "timeSaved",
          label: "Coordinator time saved",
          amount: timeSaved,
          sourceKeys: [],
        },
      ];
    },
  },

  {
    id: "referral",
    name: "Referral Management",
    segments: ["homeHealth", "provider"],
    blurb:
      "Keeps referrals in-network and closes the loop automatically, so none are lost.",
    fields: [
      {
        key: "coordinatorHoursSaved",
        label: "Coordinator hours saved per year",
        type: "number",
        tier: "core",
        default: 2000,
        min: 0,
        step: 100,
        unit: "hrs",
      },
      {
        key: "coordinatorHourly",
        label: "Coordinator hourly cost",
        type: "currency",
        tier: "core",
        default: 30,
        min: 15,
        step: 5,
        unit: "$/hr",
      },
    ],
    compute: (v) => {
      const timeSaved = v.coordinatorHoursSaved * v.coordinatorHourly;
      // Revenue-retention line intentionally omitted: leakage rate and value
      // per referral are not yet sourced (see FINAL BUILD_CONTEXT Section 14).
      return [
        {
          category: "timeSaved",
          label: "Coordinator time saved",
          amount: timeSaved,
          sourceKeys: [],
        },
      ];
    },
    disabledLines: [
      {
        label: "Retained revenue",
        reason: "Source pending",
      },
    ],
  },
];

/** Seed a default value object for every product from its field defaults. */
export function defaultValues(): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const p of PRODUCTS) {
    out[p.id] = {};
    for (const f of p.fields) out[p.id][f.key] = f.default;
  }
  return out;
}

export function productsForSegment(segment: Segment): Product[] {
  return PRODUCTS.filter((p) => p.segments.includes(segment));
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** Split a product's fields into core (shown by default) and advanced. */
export function fieldsByTier(product: Product): {
  core: Field[];
  advanced: Field[];
} {
  return {
    core: product.fields.filter((f) => f.tier === "core"),
    advanced: product.fields.filter((f) => f.tier === "advanced"),
  };
}
