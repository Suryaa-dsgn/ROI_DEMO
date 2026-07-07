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

// --- RCM — Provider constants (see ROI_RCM_Provider_Modification.md) ---
// Denials only: rework labor + write-offs. Other poster figures are reinforcing
// facts (displayOnly) and never added to the total, to stay defensible.

// Quickflows agent performance — LOCKED, from the RCM Provider poster. Never editable.
export const RCM_PROVIDER_AGENT = {
  denialReduction: {
    value: 0.35,
    label: "Fewer denials with pre-submission AI review",
    source: "Quickflows (poster: 35% fewer denials)",
  },
  // Reinforcing facts — DISPLAY ONLY. Shown as capability facts, never summed.
  fasterAppeals: {
    value: 3,
    label: "Faster appeals vs manual preparation",
    source: "Quickflows (poster: 3x faster appeals)",
    displayOnly: true,
  },
  moreRevenue: {
    value: 0.28,
    label: "Improvement in net collection rate per provider",
    source: "Quickflows (poster: 28% more revenue)",
    displayOnly: true,
  },
  arRecovery: {
    value: 0.31,
    label: "Improvement in outstanding balance collection",
    source: "Quickflows (poster: 31% AR recovery)",
    displayOnly: true,
  },
  cleanClaimRate: {
    value: 0.8,
    label: "Clean claim rate on first submission",
    source: "Quickflows (poster: 80% clean claim rate)",
    displayOnly: true,
  },
} as const;

// Industry constants — LOCKED, sourced. Used in the math, shown with citations.
export const RCM_PROVIDER_INDUSTRY = {
  denialRate: {
    value: 0.118,
    label: "Initial claim denial rate",
    source: "Experian State of Claims 2025 / Kodiak 2024",
  },
  reworkCost: {
    value: 50,
    label: "Cost to rework one denied claim (midpoint of $25-$118)",
    source: "MGMA / Change Healthcare",
  },
  neverRecovered: {
    value: 0.65,
    label: "Denied claims never recovered",
    source: "MGMA",
  },
} as const;

// RCM source keys are namespaced ("rcm…") so they never collide with the
// eligibility maps (which also define denialReduction / neverRecovered).
const RCM_PROVIDER_SOURCES: Record<string, { label: string; source: string }> = {
  rcmDenialRate: RCM_PROVIDER_INDUSTRY.denialRate,
  rcmReworkCost: RCM_PROVIDER_INDUSTRY.reworkCost,
  rcmNeverRecovered: RCM_PROVIDER_INDUSTRY.neverRecovered,
  rcmDenialReduction: RCM_PROVIDER_AGENT.denialReduction,
};

// --- ProviderCred (Credentialing) constants (see ROI_ProviderCred_Modification.md) ---
// Labor saved only in the total. Faster billing and risk are shown as separate
// labeled lines, never added. Everything is from the poster — no external benchmarks.

// Quickflows agent performance — LOCKED, from the ProviderCred poster. Never editable.
export const PROVIDERCRED_AGENT = {
  verificationTimeReduction: { value: 0.70,    label: "Reduction in manual provider verification time", source: "Quickflows (poster: 70% faster onboarding)" },
  onboardingSpeedup:         { value: 0.70,    label: "Faster onboarding (same 70% figure)",            source: "Quickflows (poster: 70% faster onboarding)" },
  riskAvoidedPerYear:        { value: 2000000, label: "Average compliance exposure eliminated per year", source: "Quickflows (poster: $2M+ risk avoided)" },
  // Reinforcing facts — DISPLAY ONLY. Never monetized, never in the total.
  lessManualWork:      { value: 0.85, label: "Less spreadsheet-based credentialing work",             source: "Quickflows (poster: 85% less manual work)",     displayOnly: true },
  complianceExposure:  { value: 0.80, label: "Less undetected compliance exposure",                   source: "Quickflows (poster: 80% compliance exposure)",  displayOnly: true },
  recredentialingTime: { value: 0.90, label: "Faster recredentialing cycles",                         source: "Quickflows (poster: 90% recredentialing time)", displayOnly: true },
  alertPrecision:      { value: 0.92, label: "Improvement in match accuracy vs name-only screening",  source: "Quickflows (poster: 92% alert precision)",      displayOnly: true },
  auditReady:          { value: 1.00, label: "Audit-ready reporting on demand",                       source: "Quickflows (poster: 100% audit-ready)",         displayOnly: true },
  rosterCapacity:      { value: 0.75, label: "More providers credentialed with the same team",        source: "Quickflows (poster: 75% roster capacity)",      displayOnly: true },
} as const;

// ProviderCred source keys namespaced ("pc…") to future-proof against collisions.
const PROVIDERCRED_SOURCES: Record<string, { label: string; source: string }> = {
  pcVerificationTimeReduction: PROVIDERCRED_AGENT.verificationTimeReduction,
  pcOnboardingSpeedup:         PROVIDERCRED_AGENT.onboardingSpeedup,
  pcRiskAvoidedPerYear:        PROVIDERCRED_AGENT.riskAvoidedPerYear,
};

/**
 * Resolve any sourced key to its { label, source } for tooltips and the Sources
 * view. Spans the shared BENCHMARKS plus the eligibility and RCM constant maps
 * so a field's `sourceKey` may point at any of them. Returns null for unknown keys.
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
  if (key in RCM_PROVIDER_SOURCES) {
    const b = RCM_PROVIDER_SOURCES[key];
    return { label: b.label, source: b.source };
  }
  if (key in PROVIDERCRED_SOURCES) {
    const b = PROVIDERCRED_SOURCES[key];
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
  period: "monthly" | "annual";
  rows: ComparisonRow[];
  totalManual: number;
  totalAutomated: number;
  totalSaved: number;
  /** Optional read-only context stats (e.g. derived revenue, denial share). */
  context?: {
    annualRevenue: number;
    denialsPerYear: number;
    denialCostShareOfRevenue: number;
  };
  /** Optional separate figures shown below the total but never added to it. */
  separate?: {
    cashFreed: number;
    riskAvoided: number;
  };
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
  /** Read-only values derived from inputs (e.g. annual revenue), shown for context. */
  derived?: (v: Record<string, number>) => Record<string, number>;
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
      "See what claim denials cost you each year, and what the agent prevents and recovers.",
    outputMode: "comparison", // renders the side-by-side comparison (Section 5)
    period: "annual",
    // ONLY editable inputs = the client's reality.
    fields: [
      {
        key: "claimsPerYear",
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
    ],
    // Derived, read-only. Shown for context, not editable, not part of the math.
    derived: (v) => ({
      annualRevenue: v.claimsPerYear * v.avgReimbursement,
    }),
    // For the app's value-category totals. Both are hard dollars, annual.
    compute: (v) => {
      const A = RCM_PROVIDER_AGENT,
        I = RCM_PROVIDER_INDUSTRY;
      const denials = v.claimsPerYear * I.denialRate.value;
      const prevented = denials * A.denialReduction.value;
      const revenueRecovered =
        prevented * I.neverRecovered.value * v.avgReimbursement;
      const reworkSaved =
        prevented * (1 - I.neverRecovered.value) * I.reworkCost.value;
      return [
        {
          category: "moneyRecovered",
          label: "Denial write-offs recovered (annual)",
          amount: revenueRecovered,
          sourceKeys: ["rcmDenialRate", "rcmNeverRecovered", "rcmDenialReduction"],
        },
        {
          category: "timeSaved",
          label: "Denial rework labor saved (annual)",
          amount: reworkSaved,
          sourceKeys: ["rcmReworkCost", "rcmDenialReduction"],
        },
      ];
    },
    // Powers the manual-vs-Quickflows comparison. Same math, manual vs automated.
    comparison: (v) => {
      const A = RCM_PROVIDER_AGENT,
        I = RCM_PROVIDER_INDUSTRY;
      const denials = v.claimsPerYear * I.denialRate.value;

      const writeOffManual = denials * I.neverRecovered.value * v.avgReimbursement;
      const writeOffQf = writeOffManual * (1 - A.denialReduction.value);

      const reworkManual = denials * (1 - I.neverRecovered.value) * I.reworkCost.value;
      const reworkQf = reworkManual * (1 - A.denialReduction.value);

      const totalManual = writeOffManual + reworkManual;

      return {
        period: "annual",
        rows: [
          {
            label: "Revenue lost to denials",
            manual: writeOffManual,
            automated: writeOffQf,
            saved: writeOffManual - writeOffQf,
          },
          {
            label: "Denial rework labor",
            manual: reworkManual,
            automated: reworkQf,
            saved: reworkManual - reworkQf,
          },
        ],
        totalManual,
        totalAutomated: writeOffQf + reworkQf,
        totalSaved: writeOffManual - writeOffQf + (reworkManual - reworkQf),
        context: {
          annualRevenue: v.claimsPerYear * v.avgReimbursement,
          denialsPerYear: denials,
          denialCostShareOfRevenue:
            totalManual / (v.claimsPerYear * v.avgReimbursement),
        },
      };
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
    blurb: "See what manual credentialing costs your team each year, and what the agent saves.",
    outputMode: "comparison",
    period: "annual",

    // ONLY editable inputs = the client's reality (no poster figures here).
    fields: [
      // Credentialing labor — drives the headline total
      { key: "providersPerYear",    label: "Providers credentialed per year",       type: "number",   tier: "core", default: 500,  min: 10,  step: 10,  unit: "providers/yr" },
      { key: "manualHours",         label: "Hours to verify one provider manually",  type: "number",   tier: "core", default: 6,    min: 0.5, max: 40, step: 0.5, unit: "hrs",   hint: "Your team's real number. Placeholder, not a poster figure." },
      { key: "staffHourly",         label: "Credentialing staff cost per hour",      type: "currency", tier: "core", default: 35,   min: 15,  step: 1,   unit: "$/hr" },
      // Onboarding speed — feeds the separate faster-billing line only, NOT the total
      { key: "newBillingProviders", label: "New billing providers per year",          type: "number",   tier: "core", default: 100,  min: 0,   step: 5,   unit: "providers" },
      { key: "onboardingDays",      label: "Days to onboard a new provider today",   type: "number",   tier: "core", default: 30,   min: 1,   max: 180, step: 1,   unit: "days",  hint: "Your team's real number. Placeholder, not a poster figure." },
      { key: "billingPerDay",       label: "Revenue a provider bills per day",        type: "currency", tier: "core", default: 2000, min: 100, step: 100, unit: "$/day" },
    ],

    compute: (v) => {
      const A = PROVIDERCRED_AGENT;
      const manualLabor = v.providersPerYear * v.manualHours * v.staffHourly;
      const laborSaved  = manualLabor * A.verificationTimeReduction.value;
      const daysSooner  = v.onboardingDays * A.onboardingSpeedup.value;
      const cashFreed   = v.newBillingProviders * daysSooner * v.billingPerDay;
      const riskAvoided = A.riskAvoidedPerYear.value;
      return [
        { category: "timeSaved",   label: "Credentialing labor saved (annual)",  amount: laborSaved,  sourceKeys: ["pcVerificationTimeReduction"] },
        { category: "cashFreed",   label: "Revenue captured earlier (annual)",    amount: cashFreed,   sourceKeys: ["pcOnboardingSpeedup"],        note: "Timing, not new money. Separate line." },
        { category: "riskAvoided", label: "Compliance exposure avoided (annual)", amount: riskAvoided, sourceKeys: ["pcRiskAvoidedPerYear"],        note: "Poster average. Separate line, never in the total." },
      ];
    },

    comparison: (v) => {
      const A = PROVIDERCRED_AGENT;
      const manualLabor = v.providersPerYear * v.manualHours * v.staffHourly;
      const autoLabor   = manualLabor * (1 - A.verificationTimeReduction.value);
      const daysSooner  = v.onboardingDays * A.onboardingSpeedup.value;
      const cashFreed   = v.newBillingProviders * daysSooner * v.billingPerDay;
      return {
        period: "annual",
        rows: [
          { label: "Credentialing verification labor", manual: manualLabor, automated: autoLabor, saved: manualLabor - autoLabor },
        ],
        totalManual:     manualLabor,
        totalAutomated:  autoLabor,
        totalSaved:      manualLabor - autoLabor,
        separate: {
          cashFreed,
          riskAvoided: A.riskAvoidedPerYear.value,
        },
      };
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
