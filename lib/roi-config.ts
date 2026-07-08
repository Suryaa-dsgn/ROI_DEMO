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
    value: 0.45,
    label: "Fewer denials with pre-submission AI review",
    source: "Quickflows RCM Provider",
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
  credentialingTimeReduction:   { value: 0.90, label: "Manual credentialing time eliminated",        source: "Quickflows ProviderCred" },
  recredentialingTimeReduction: { value: 0.95, label: "Recredentialing time eliminated",             source: "Quickflows ProviderCred" },
  riskAvoidedPerYear:           { value: 2000000, label: "Average compliance exposure eliminated per year", source: "Quickflows ProviderCred ($2M+ risk avoided)" },
  // Reinforcing facts — DISPLAY ONLY. Never monetized, never in the total.
  complianceExposure:  { value: 0.80, label: "Less undetected compliance exposure",    source: "Quickflows ProviderCred (80%)",  displayOnly: true },
  recredentialingFact: { value: 0.90, label: "Faster recredentialing cycles",          source: "Quickflows ProviderCred (90%)",  displayOnly: true },
  alertPrecision:      { value: 0.92, label: "Improvement in alert match accuracy",    source: "Quickflows ProviderCred (92%)",  displayOnly: true },
  auditReady:          { value: 1.00, label: "Compliance reports generated on demand", source: "Quickflows ProviderCred (100%)", displayOnly: true },
} as const;

// ProviderCred source keys namespaced ("pc…") to future-proof against collisions.
const PROVIDERCRED_SOURCES: Record<string, { label: string; source: string }> = {
  pcCredentialingTimeReduction:   PROVIDERCRED_AGENT.credentialingTimeReduction,
  pcRecredentialingTimeReduction: PROVIDERCRED_AGENT.recredentialingTimeReduction,
  pcRiskAvoidedPerYear:           PROVIDERCRED_AGENT.riskAvoidedPerYear,
};

// --- Referral Management constants (see ROI_ReferralManagement_Modification.md) ---
// Coordinator labor saved only in the total. Leakage is a capability fact (no dollar
// figure). Everything is from the poster — no external benchmarks.

// Quickflows agent performance — LOCKED, from the Referral Management poster. Never editable.
export const REFERRAL_AGENT = {
  coordinatorWorkReduction: { value: 0.80, label: "Less manual coordinator work",    source: "Quickflows (poster: 80% less manual coordinator work)" },
  leakageReduction:         { value: 0.40, label: "Reduction in referral leakage",   source: "Quickflows (poster: 40% reduction in referral leakage)" },
  // Reinforcing facts — DISPLAY ONLY. value-bearing so view-sources renders correctly.
  // cycleDays.value = 7 (the "before" figure); before/after used in the component for "7→1 days".
  cycleDays:          { value: 7,    before: 7, after: 1, label: "Avg referral cycle time (days before Quickflows)", source: "Quickflows (poster: 7→1 days)",               displayOnly: true },
  inNetworkRate:      { value: 0.27,                      label: "More referrals kept in-network",                   source: "Quickflows (poster: 27% more in-network)",    displayOnly: true },
  authDelays:         { value: 0.26,                      label: "Faster insurance approvals",                       source: "Quickflows (poster: 26% fewer auth delays)",   displayOnly: true },
  referralVisibility: { value: 0.92,                      label: "Real-time referral status tracking",               source: "Quickflows (poster: 92% referral visibility)", displayOnly: true },
  intakeProcessing:   { value: 0.90,                      label: "Less intake processing vs fax-based",              source: "Quickflows (poster: 90% less intake processing)", displayOnly: true },
  // hoursSavedRef omitted — value 2000 would format as $2,000 in view-sources (wrong; it's hours).
  // Component shows "2,000+" as a hardcoded string chip instead.
} as const;

// Referral source keys namespaced ("ref…") to avoid collisions with other maps.
const REFERRAL_SOURCES: Record<string, { label: string; source: string }> = {
  refCoordinatorWorkReduction: REFERRAL_AGENT.coordinatorWorkReduction,
  refLeakageReduction:         REFERRAL_AGENT.leakageReduction,
};

// --- Quickflows Scheduler constants (see ROI_Scheduler_Modification.md) ---
// Parts 1+2 (staffing + scheduling effort) in the total. Part 3 (filled-shift revenue)
// is shown separately below the table, never summed. All performance from the poster.

// Quickflows Scheduler performance — LOCKED, from the poster. Never editable.
export const SCHEDULER_AGENT = {
  overtimeReduction:    { value: 0.18, label: "Reduction in overtime and agency spend",             source: "Quickflows Scheduler (18% lower overtime spend)" },
  coordinatorReduction: { value: 0.40, label: "Less manual time building and adjusting schedules",   source: "Quickflows Scheduler (40% less coordinator workload)" },
  retentionImprovement: { value: 0.25, label: "Improvement in caregiver retention",                  source: "Quickflows Scheduler (25% caregiver retention improvement)" },
  autoFillRate:         { value: 0.92, label: "Open shifts filled automatically",                    source: "Quickflows Scheduler (92% automatic fill rate)" },
  // Reinforcing facts — DISPLAY ONLY. Never monetized, never in the total.
  scheduleAccuracy: { value: 0.96, label: "Shifts filled meeting skill and compliance requirements", source: "Quickflows Scheduler (96% schedule accuracy)",          displayOnly: true },
  callOffResponse:  { value: 5,    label: "Minutes from call-off to confirmed replacement",         source: "Quickflows Scheduler (<5 min call-off response)",      displayOnly: true },
  advanceWarning:   { value: 2,    label: "Weeks of advance capacity warning",                      source: "Quickflows Scheduler (2+ weeks advance warning)",      displayOnly: true },
  auditCoverage:    { value: 1.00, label: "Every assignment and swap fully traceable",               source: "Quickflows Scheduler (100% audit trail coverage)",     displayOnly: true },
} as const;

// Scheduler source keys namespaced ("sched…") for consistency.
const SCHEDULER_SOURCES: Record<string, { label: string; source: string }> = {
  schedOvertimeReduction:    SCHEDULER_AGENT.overtimeReduction,
  schedCoordinatorReduction: SCHEDULER_AGENT.coordinatorReduction,
  schedRetentionImprovement: SCHEDULER_AGENT.retentionImprovement,
  schedAutoFillRate:         SCHEDULER_AGENT.autoFillRate,
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
  if (key in REFERRAL_SOURCES) {
    const b = REFERRAL_SOURCES[key];
    return { label: b.label, source: b.source };
  }
  if (key in SCHEDULER_SOURCES) {
    const b = SCHEDULER_SOURCES[key];
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
  group?: string; // display group tag for multi-group comparison views (e.g. scheduler)
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
  /** Optional group label for multi-group tables (e.g. scheduler). */
  group?: string;
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
    cashFreed?: number;
    riskAvoided: number;
    label?: string;
    note?: string;
    source?: string;
  };
  /** Optional separate revenue figure (e.g. scheduler filled-shift revenue) — never in the total. */
  revenueSeparate?: {
    amount: number;
    label: string;
    note: string;
    source: string;
  };
  /** Optional capability fact shown beneath the table — no dollar figure, never summed. */
  leakageFact?: {
    label: string;
    value: number;
    display: string;
    source: string;
    note: string;
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
        default: 10000,
        min: 50,
        step: 50,
        unit: "visits/mo",
      },
      {
        key: "manualMinutes",
        label: "Minutes to verify one patient manually",
        type: "number",
        tier: "core",
        default: 20,
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
        default: 40,
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
        default: 2000,
        min: 20,
        step: 10,
        unit: "$",
        hint: "Your organization's average payment per visit.",
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
        default: 80000,
        min: 1000,
        step: 1000,
        unit: "claims/yr",
      },
      {
        key: "avgReimbursement",
        label: "Average payment per claim",
        type: "currency",
        tier: "core",
        default: 500,
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
      // Group: credentialing — new provider verifications
      { key: "newCredentialsPerYear",  label: "New providers credentialed per year",          type: "number",   tier: "core", group: "credentialing",   default: 15000, min: 10,  step: 100, unit: "providers/yr" },
      { key: "minutesPerCredential",   label: "Time to verify one new provider manually",     type: "number",   tier: "core", group: "credentialing",   default: 30,    min: 1,   max: 480, step: 1, unit: "min", hint: "Your team's real number" },
      // Group: recredentialing — ongoing renewals
      { key: "recredentialsPerYear",   label: "Providers recredentialed per year",            type: "number",   tier: "core", group: "recredentialing", default: 40000, min: 10,  step: 100, unit: "providers/yr" },
      { key: "minutesPerRecredential", label: "Time to recredential one provider manually",   type: "number",   tier: "core", group: "recredentialing", default: 6,     min: 1,   max: 120,  step: 1, unit: "min", hint: "Your team's real number" },
      // Shared across both groups
      { key: "staffHourly",            label: "Credentialing staff cost per hour",            type: "currency", tier: "core", group: "shared",          default: 35,    min: 15,  step: 1,   unit: "$/hr" },
    ],

    compute: (v) => {
      const A = PROVIDERCRED_AGENT;
      const credentialingManual  = v.newCredentialsPerYear * (v.minutesPerCredential / 60) * v.staffHourly;
      const credentialingSaved   = credentialingManual * A.credentialingTimeReduction.value;
      const recredentialingManual = v.recredentialsPerYear * (v.minutesPerRecredential / 60) * v.staffHourly;
      const recredentialingSaved  = recredentialingManual * A.recredentialingTimeReduction.value;
      return [
        { category: "timeSaved",   label: "New credentialing time saved (annual)",  amount: credentialingSaved,   sourceKeys: ["pcCredentialingTimeReduction"] },
        { category: "timeSaved",   label: "Recredentialing time saved (annual)",    amount: recredentialingSaved, sourceKeys: ["pcRecredentialingTimeReduction"] },
        { category: "riskAvoided", label: "Compliance exposure avoided (annual)",   amount: A.riskAvoidedPerYear.value, sourceKeys: ["pcRiskAvoidedPerYear"], note: "Separate line, never in the total." },
      ];
    },

    comparison: (v) => {
      const A = PROVIDERCRED_AGENT;
      const credManual  = v.newCredentialsPerYear * (v.minutesPerCredential / 60) * v.staffHourly;
      const credQf      = credManual * (1 - A.credentialingTimeReduction.value);
      const recredManual = v.recredentialsPerYear * (v.minutesPerRecredential / 60) * v.staffHourly;
      const recredQf     = recredManual * (1 - A.recredentialingTimeReduction.value);
      return {
        period: "annual",
        rows: [
          { label: "New credentialing labor",  manual: credManual,  automated: credQf,  saved: credManual - credQf,   group: "Credentialing" },
          { label: "Recredentialing labor",    manual: recredManual, automated: recredQf, saved: recredManual - recredQf, group: "Recredentialing" },
        ],
        totalManual:    credManual + recredManual,
        totalAutomated: credQf + recredQf,
        totalSaved:     (credManual - credQf) + (recredManual - recredQf),
        separate: {
          riskAvoided: A.riskAvoidedPerYear.value,
          label: "Compliance exposure avoided",
          note:  "Kept separate, never in the total above.",
          source: A.riskAvoidedPerYear.source,
        },
      };
    },
  },

  {
    id: "scheduler",
    name: "Quickflows Scheduler",
    segments: ["homeHealth", "provider"],
    blurb: "See what reactive scheduling costs your operation each year, and what the agent saves.",
    outputMode: "comparison",
    period: "annual",

    // ONLY editable inputs = the client's operational reality, grouped for display.
    fields: [
      // GROUP 1 — Staffing costs (drives Part 1 of the total)
      { key: "avgHourlyRate",      label: "Average staff hourly rate",           type: "currency", tier: "core", group: "staffing",   default: 35,    min: 10,   step: 1,    unit: "$/hr" },
      { key: "overtimeHoursWeek",  label: "Overtime hours per week (all staff)", type: "number",  tier: "core", group: "staffing",   default: 120,   min: 0,    step: 5,    unit: "hrs/wk" },
      { key: "overtimeMultiplier", label: "Overtime rate multiplier",             type: "number",  tier: "core", group: "staffing",   default: 1.5,   min: 1,    max: 3,  step: 0.25, hint: "Typically 1.5× for time-and-a-half" },
      { key: "agencyHoursWeek",    label: "Agency hours used per week",           type: "number",  tier: "core", group: "staffing",   default: 150,   min: 0,    step: 5,    unit: "hrs/wk" },
      { key: "agencyHourlyRate",   label: "Agency hourly cost",                   type: "currency", tier: "core", group: "staffing",  default: 85,    min: 20,   step: 5,    unit: "$/hr" },
      // GROUP 2 — Scheduling effort (drives Part 2 of the total)
      { key: "schedulingHoursWeek", label: "Manual scheduling hours per week",   type: "number",  tier: "core", group: "scheduling", default: 25,    min: 1,    step: 1,    unit: "hrs/wk" },
      { key: "schedulerRate",       label: "Scheduler hourly rate",               type: "currency", tier: "core", group: "scheduling", default: 45,   min: 15,   step: 1,    unit: "$/hr" },
      { key: "numSchedulers",       label: "Number of schedulers",                type: "number",  tier: "core", group: "scheduling", default: 3,     min: 1,    step: 1,    unit: "people" },
      { key: "staffReplacementsYr", label: "Staff replacements per year",         type: "number",  tier: "core", group: "scheduling", default: 8,     min: 0,    step: 1,    unit: "per yr" },
      { key: "replacementCost",     label: "Cost to replace one staff member",    type: "currency", tier: "core", group: "scheduling", default: 60000, min: 5000, step: 1000, unit: "$" },
      // GROUP 3 — Unfilled shifts (feeds Part 3 only — the separate revenue line)
      { key: "unfilledShiftsMo",   label: "Unfilled shifts per month",            type: "number",  tier: "core", group: "revenue",    default: 12,    min: 0,    step: 1,    unit: "shifts/mo" },
      { key: "revenuePerShift",    label: "Average revenue per shift (8 hrs)",    type: "currency", tier: "core", group: "revenue",   default: 600,   min: 50,   step: 50,   unit: "$" },
    ],

    // For the app's value-category totals. Parts 1+2 only. Annual.
    compute: (v) => {
      const A = SCHEDULER_AGENT;
      const agencyPremiumAnnual   = v.agencyHoursWeek * (v.agencyHourlyRate - v.avgHourlyRate) * 52;
      const overtimePremiumAnnual = v.overtimeHoursWeek * v.avgHourlyRate * (v.overtimeMultiplier - 1) * 52;
      const agencySaved           = agencyPremiumAnnual   * A.overtimeReduction.value;
      const overtimeSaved         = overtimePremiumAnnual * A.overtimeReduction.value;
      const schedulingLaborAnnual = v.schedulingHoursWeek * v.schedulerRate * v.numSchedulers * 52;
      const schedulingLaborSaved  = schedulingLaborAnnual * A.coordinatorReduction.value;
      const turnoverCostAnnual    = v.staffReplacementsYr * v.replacementCost;
      const turnoverSaved         = turnoverCostAnnual * A.retentionImprovement.value;
      return [
        { category: "moneySaved", label: "Agency premium eliminated (annual)",  amount: agencySaved,         sourceKeys: ["schedOvertimeReduction"] },
        { category: "moneySaved", label: "Overtime premium eliminated (annual)", amount: overtimeSaved,       sourceKeys: ["schedOvertimeReduction"] },
        { category: "timeSaved",  label: "Scheduling labor saved (annual)",      amount: schedulingLaborSaved, sourceKeys: ["schedCoordinatorReduction"] },
        { category: "moneySaved", label: "Turnover cost avoided (annual)",       amount: turnoverSaved,       sourceKeys: ["schedRetentionImprovement"] },
      ];
    },

    // Powers the side-by-side comparison. Part 3 in revenueSeparate.
    comparison: (v) => {
      const A = SCHEDULER_AGENT;
      const agencyPremiumAnnual   = v.agencyHoursWeek * (v.agencyHourlyRate - v.avgHourlyRate) * 52;
      const overtimePremiumAnnual = v.overtimeHoursWeek * v.avgHourlyRate * (v.overtimeMultiplier - 1) * 52;
      const agencyQf    = agencyPremiumAnnual   * (1 - A.overtimeReduction.value);
      const overtimeQf  = overtimePremiumAnnual * (1 - A.overtimeReduction.value);
      const schedulingLaborAnnual = v.schedulingHoursWeek * v.schedulerRate * v.numSchedulers * 52;
      const schedulingQf = schedulingLaborAnnual * (1 - A.coordinatorReduction.value);
      const turnoverAnnual = v.staffReplacementsYr * v.replacementCost;
      const turnoverQf     = turnoverAnnual * (1 - A.retentionImprovement.value);
      const totalManual    = agencyPremiumAnnual + overtimePremiumAnnual + schedulingLaborAnnual + turnoverAnnual;
      const totalAutomated = agencyQf + overtimeQf + schedulingQf + turnoverQf;
      const revenueRecoveredAnnual = v.unfilledShiftsMo * A.autoFillRate.value * v.revenuePerShift * 12;
      return {
        period: "annual",
        rows: [
          { label: "Agency premium cost",   manual: agencyPremiumAnnual,   automated: agencyQf,   saved: agencyPremiumAnnual - agencyQf,   group: "Staffing costs" },
          { label: "Overtime premium cost", manual: overtimePremiumAnnual, automated: overtimeQf, saved: overtimePremiumAnnual - overtimeQf, group: "Staffing costs" },
          { label: "Scheduling labor",      manual: schedulingLaborAnnual, automated: schedulingQf, saved: schedulingLaborAnnual - schedulingQf, group: "Scheduling effort" },
          { label: "Staff turnover cost",   manual: turnoverAnnual,        automated: turnoverQf, saved: turnoverAnnual - turnoverQf,        group: "Scheduling effort" },
        ],
        totalManual,
        totalAutomated,
        totalSaved: totalManual - totalAutomated,
        revenueSeparate: {
          amount: revenueRecoveredAnnual,
          label:  "Revenue from filled shifts",
          note:   "Shown separately, not added to the total above.",
          source: A.autoFillRate.source,
        },
      };
    },
  },

  {
    id: "referral",
    name: "Referral Management",
    segments: ["homeHealth", "provider"],
    blurb: "See what manual referral coordination costs your team each month, and what the agent saves.",
    outputMode: "comparison",
    period: "monthly",

    // ONLY editable inputs = the client's reality (no poster figures here).
    fields: [
      { key: "referralsPerMonth", label: "Referrals handled per month",             type: "number",   tier: "core", default: 1500, min: 10,  step: 10, unit: "referrals/mo" },
      { key: "manualMinutes",     label: "Minutes to process one referral manually", type: "number",   tier: "core", default: 25,   min: 1,   max: 120, step: 1, unit: "min", hint: "Your team's number. Covers intake, validation, auth follow-up, and loop closure." },
      { key: "coordinatorHourly", label: "Coordinator cost per hour",                type: "currency", tier: "core", default: 40,   min: 12,  step: 1,  unit: "$/hr" },
    ],

    compute: (v) => {
      const A = REFERRAL_AGENT;
      const manualLabor = (v.referralsPerMonth * v.manualMinutes / 60) * v.coordinatorHourly;
      const laborSaved  = manualLabor * A.coordinatorWorkReduction.value;
      return [
        { category: "timeSaved", label: "Coordinator labor saved (monthly)", amount: laborSaved, sourceKeys: ["refCoordinatorWorkReduction"] },
      ];
    },

    comparison: (v) => {
      const A = REFERRAL_AGENT;
      const manualLabor = (v.referralsPerMonth * v.manualMinutes / 60) * v.coordinatorHourly;
      const autoLabor   = manualLabor * (1 - A.coordinatorWorkReduction.value);
      return {
        period: "monthly",
        rows: [
          { label: "Referral coordination labor", manual: manualLabor, automated: autoLabor, saved: manualLabor - autoLabor },
        ],
        totalManual:    manualLabor,
        totalAutomated: autoLabor,
        totalSaved:     manualLabor - autoLabor,
        leakageFact: {
          label:   "Referral leakage reduced",
          value:   A.leakageReduction.value,
          display: `${Math.round(A.leakageReduction.value * 100)}% reduction in referral leakage`,
          source:  A.leakageReduction.source,
          note:    "Not expressed as a dollar figure, because the value of a kept referral varies by contract. Shown as a capability fact.",
        },
      };
    },
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
