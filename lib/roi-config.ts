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

// --- AI Eligibility Verification constants (see ROI_Eligibility_Modification.md) ---
// Eligibility is a pre-care service, not claims/RCM. Its ROI is the manual
// verification labor it removes plus the eligibility-error write-offs it prevents.

// Quickflows agent performance — LOCKED, from the Eligibility poster. Never editable.
export const ELIGIBILITY_AGENT = {
  manualEffortRemoved: {
    value: 0.65,
    label: "Manual verification effort removed",
    source: "Quickflows (poster: front-desk productivity)",
  },
  denialReduction: {
    value: 0.45,
    label: "Reduction in coverage/network denials",
    source: "Quickflows (poster: fewer denials)",
  },
  secondsPerCheck: {
    value: 10,
    label: "Automated verification time",
    source: "Quickflows (poster: under 10s to confidence)",
  },
} as const;

// Industry constants — LOCKED, sourced. Shown with citations, not edited in the main flow.
export const ELIGIBILITY_INDUSTRY = {
  initialDenialRate: {
    value: 0.118,
    label: "Initial claim denial rate",
    source: "Experian State of Claims 2025 / Kodiak 2024",
  },
  eligibilityShare: {
    value: 0.24,
    label: "Share of denials caused by eligibility/registration errors",
    source: "MGMA 2024",
  },
  neverRecovered: {
    value: 0.65,
    label: "Denied claims never recovered",
    source: "MGMA",
  },
} as const;

// Sourced defaults for the client-editable inputs.
export const ELIGIBILITY_DEFAULTS = {
  manualMinutes: {
    value: 12.64,
    label: "Minutes per manual verification",
    source: "MGMA analysis (avg minutes per manual verification)",
  },
  staffHourly: {
    value: 21,
    label: "Verification staff cost per hour",
    source:
      "PayScale / Salary.com / ZipRecruiter 2025-2026 (front-desk ~$18-21, verification specialist ~$20-24)",
  },
} as const;

/**
 * Resolve any sourced key to its { label, source } for tooltips and the Sources
 * view. Spans the shared BENCHMARKS plus the eligibility constant/default maps
 * so a field's `sourceKey` may point at either. Returns null for unknown keys.
 */
export function getSource(key: string): { label: string; source: string } | null {
  if (key in BENCHMARKS) {
    const b = BENCHMARKS[key as BenchmarkKey];
    return { label: b.label, source: b.source };
  }
  if (key in ELIGIBILITY_AGENT) {
    const b = ELIGIBILITY_AGENT[key as keyof typeof ELIGIBILITY_AGENT];
    return { label: b.label, source: b.source };
  }
  if (key in ELIGIBILITY_INDUSTRY) {
    const b = ELIGIBILITY_INDUSTRY[key as keyof typeof ELIGIBILITY_INDUSTRY];
    return { label: b.label, source: b.source };
  }
  if (key in ELIGIBILITY_DEFAULTS) {
    const b = ELIGIBILITY_DEFAULTS[key as keyof typeof ELIGIBILITY_DEFAULTS];
    return { label: b.label, source: b.source };
  }
  return null;
}

// A sourced key may reference BENCHMARKS or any eligibility constant/default map.
export type SourceKey = string;

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
  sourceKey?: SourceKey; // show source when default comes from a benchmark/default
}

export interface DisabledLine {
  label: string;
  reason: string; // shown in a disabled placeholder row
}

/** One row of a manual-vs-automated comparison (see `outputMode: "comparison"`). */
export interface ComparisonRow {
  label: string;
  manual: number;
  automated: number;
  saved: number;
}

export interface ComparisonResult {
  period: "monthly";
  rows: ComparisonRow[];
  totalManual: number;
  totalAutomated: number;
  totalSaved: number;
}

export interface Product {
  id: string;
  name: string;
  segments: Segment[];
  blurb: string;
  fields: Field[];
  compute: (v: Record<string, number>) => LineItem[];
  disabledLines?: DisabledLine[];
  /** How the product's module renders. Defaults to "single". */
  outputMode?: "single" | "comparison";
  /** Reporting period for this product's figures. Defaults to "annual". */
  period?: "monthly" | "annual";
  /** Manual-vs-automated figures, for `outputMode: "comparison"`. */
  comparison?: (v: Record<string, number>) => ComparisonResult;
}

const b = BENCHMARKS;

export const PRODUCTS: Product[] = [
  {
    id: "eligibility",
    name: "AI Eligibility Verification",
    segments: ["provider", "homeHealth"],
    blurb:
      "See what manual insurance verification costs you each month, and what the agent saves.",
    outputMode: "comparison", // render the manual-vs-automated table (Section 4)
    period: "monthly", // this agent is monthly; others remain annual
    // ONLY editable inputs = the client's manual reality.
    fields: [
      {
        key: "appointmentsPerMonth",
        label: "Scheduled appointments per month",
        type: "number",
        tier: "core",
        default: 2000,
        min: 50,
        step: 50,
        unit: "visits/mo",
      },
      {
        key: "manualMinutes",
        label: "Minutes to verify one patient manually",
        type: "number",
        tier: "core",
        default: 12.64,
        min: 1,
        max: 60,
        step: 0.5,
        unit: "min",
        sourceKey: "manualMinutes",
        hint: "Includes coverage, in/out-of-network, benefits, and auth checks",
      },
      {
        key: "staffHourly",
        label: "Verification staff cost per hour",
        type: "currency",
        tier: "core",
        default: 21,
        min: 12,
        step: 1,
        unit: "$/hr",
        sourceKey: "staffHourly",
        hint: "Front-desk staffer or verification specialist; use a loaded rate if you have one",
      },
      {
        key: "avgReimbursement",
        label: "Your average payment per visit",
        type: "currency",
        tier: "core",
        default: 150,
        min: 20,
        step: 10,
        unit: "$",
        hint: "Your own average; used for the money-lost line",
      },
    ],
    // For the aggregate value-category system. Both lines are hard-dollar, monthly.
    compute: (v) => {
      const A = ELIGIBILITY_AGENT,
        I = ELIGIBILITY_INDUSTRY;
      const manualLaborCost =
        ((v.appointmentsPerMonth * v.manualMinutes) / 60) * v.staffHourly;
      const laborSaved = manualLaborCost * A.manualEffortRemoved.value;

      const eligDenials =
        v.appointmentsPerMonth * I.initialDenialRate.value * I.eligibilityShare.value;
      const revenueLost = eligDenials * I.neverRecovered.value * v.avgReimbursement;
      const revenueProtected = revenueLost * A.denialReduction.value;

      return [
        {
          category: "timeSaved",
          label: "Verification labor saved (monthly)",
          amount: laborSaved,
          sourceKeys: ["manualEffortRemoved"],
        },
        {
          category: "moneyRecovered",
          label: "Eligibility write-offs avoided (monthly)",
          amount: revenueProtected,
          sourceKeys: [
            "initialDenialRate",
            "eligibilityShare",
            "neverRecovered",
            "denialReduction",
          ],
        },
      ];
    },
    // Powers the side-by-side comparison view. Same math, manual vs automated.
    comparison: (v) => {
      const A = ELIGIBILITY_AGENT,
        I = ELIGIBILITY_INDUSTRY;
      const manualLabor =
        ((v.appointmentsPerMonth * v.manualMinutes) / 60) * v.staffHourly;
      const autoLabor = manualLabor * (1 - A.manualEffortRemoved.value);

      const eligDenials =
        v.appointmentsPerMonth * I.initialDenialRate.value * I.eligibilityShare.value;
      const revLostManual = eligDenials * I.neverRecovered.value * v.avgReimbursement;
      const revLostAuto = revLostManual * (1 - A.denialReduction.value);

      return {
        period: "monthly",
        rows: [
          {
            label: "Verification labor",
            manual: manualLabor,
            automated: autoLabor,
            saved: manualLabor - autoLabor,
          },
          {
            label: "Revenue lost to eligibility errors",
            manual: revLostManual,
            automated: revLostAuto,
            saved: revLostManual - revLostAuto,
          },
        ],
        totalManual: manualLabor + revLostManual,
        totalAutomated: autoLabor + revLostAuto,
        totalSaved: manualLabor - autoLabor + (revLostManual - revLostAuto),
      };
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
