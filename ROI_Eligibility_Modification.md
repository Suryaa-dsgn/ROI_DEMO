# Modification: AI Eligibility Verification ROI (Claude Code)

**Scope:** This changes ONLY the `eligibility` agent in `ROI_Calculator_BUILD_CONTEXT_FINAL.md`. Every other agent, the design system, the experience architecture, and the floating nav stay exactly as they are. Do not touch them.

**Why this change:** the old eligibility model was copied from claims/RCM logic (claims denied, average reimbursement, recovery). That is wrong. Eligibility verification is a pre-care service. Quickflows is not touching claims here. What it actually replaces is the manual work of checking, for every scheduled visit, whether coverage is active, whether the provider is in-network or out-of-network, the benefit details, and the authorization and referral requirements. So the ROI is (1) the staff time and cost of doing that by hand, and (2) the money lost when eligibility errors slip through. All figures are monthly.

**The framing that must come through in the UI:** what the client does manually costs them X. Our agent does it automatically and saves them Y. Show it as a clean side-by-side comparison the sales team can present live. Our agent's performance numbers are fixed facts (constants, not editable). The only editable numbers are the client's own manual reality.

---

## 1. Three kinds of number (this is the key structural fix)

1. **Editable — the client's manual reality.** Only these four are inputs. Sensible sourced defaults are pre-filled.
2. **Locked — Quickflows agent performance.** Fixed constants from the poster. Rendered as capability facts, never as sliders or inputs. The client cannot change what our agent does.
3. **Locked — industry constants.** Sourced benchmark rates used in the math. Shown with citations in a small "How this is calculated" area. Not editable in the main flow.

Do not present any Quickflows performance number as an adjustable "assumption." That was the old mistake.

---

## 2. Data model (drop-in replacement for the `eligibility` entry in `roi-config.ts`)

Add these constant blocks near `BENCHMARKS`:

```ts
// Quickflows agent performance — LOCKED, from the Eligibility poster. Never editable.
export const ELIGIBILITY_AGENT = {
  manualEffortRemoved: { value: 0.65, label: "Manual verification effort removed", source: "Quickflows (poster: front-desk productivity)" },
  denialReduction:     { value: 0.45, label: "Reduction in coverage/network denials", source: "Quickflows (poster: fewer denials)" },
  secondsPerCheck:     { value: 10,   label: "Automated verification time", source: "Quickflows (poster: under 10s to confidence)" },
} as const;

// Industry constants — LOCKED, sourced. Shown with citations, not edited in the main flow.
export const ELIGIBILITY_INDUSTRY = {
  initialDenialRate: { value: 0.118, label: "Initial claim denial rate", source: "Experian State of Claims 2025 / Kodiak 2024" },
  eligibilityShare:  { value: 0.24,  label: "Share of denials caused by eligibility/registration errors", source: "MGMA 2024" },
  neverRecovered:    { value: 0.65,  label: "Denied claims never recovered", source: "MGMA" },
} as const;

// Sourced defaults for the client-editable inputs
export const ELIGIBILITY_DEFAULTS = {
  manualMinutes: { value: 12.64, source: "MGMA analysis (avg minutes per manual verification)" },
  staffHourly:   { value: 21,    source: "PayScale / Salary.com / ZipRecruiter 2025-2026 (front-desk ~$18-21, verification specialist ~$20-24)" },
};
```

Replace the whole `eligibility` product object with this:

```ts
{
  id: "eligibility",
  name: "AI Eligibility Verification",
  segments: ["provider", "homeHealth"],
  blurb: "See what manual insurance verification costs you each month, and what the agent saves.",
  outputMode: "comparison",           // tells the UI to render the manual-vs-automated table (see Section 4)
  period: "monthly",                  // this agent is monthly; others remain annual

  // ONLY editable inputs = the client's manual reality
  fields: [
    { key: "appointmentsPerMonth", label: "Scheduled appointments per month", type: "number",   tier: "core", default: 2000,  min: 50, step: 50,  unit: "visits/mo" },
    { key: "manualMinutes",        label: "Minutes to verify one patient manually", type: "number", tier: "core", default: 12.64, min: 1, max: 60, step: 0.5, unit: "min", sourceKey: "manualMinutes", hint: "Includes coverage, in/out-of-network, benefits, and auth checks" },
    { key: "staffHourly",          label: "Verification staff cost per hour", type: "currency", tier: "core", default: 21, min: 12, step: 1, unit: "$/hr", sourceKey: "staffHourly", hint: "Front-desk staffer or verification specialist; use a loaded rate if you have one" },
    { key: "avgReimbursement",     label: "Your average payment per visit", type: "currency", tier: "core", default: 150, min: 20, step: 10, unit: "$", hint: "Your own average; used for the money-lost line" },
  ],

  // For the aggregate total (kept in the app's value-category system). Both are hard-dollar, monthly.
  compute: (v: Record<string, number>) => {
    const A = ELIGIBILITY_AGENT, I = ELIGIBILITY_INDUSTRY;
    const manualLaborCost = (v.appointmentsPerMonth * v.manualMinutes / 60) * v.staffHourly;
    const laborSaved = manualLaborCost * A.manualEffortRemoved.value;

    const eligDenials = v.appointmentsPerMonth * I.initialDenialRate.value * I.eligibilityShare.value;
    const revenueLost = eligDenials * I.neverRecovered.value * v.avgReimbursement;
    const revenueProtected = revenueLost * A.denialReduction.value;

    return [
      { category: "timeSaved",      label: "Verification labor saved (monthly)",       amount: laborSaved,       sourceKeys: ["manualEffortRemoved"] },
      { category: "moneyRecovered", label: "Eligibility write-offs avoided (monthly)",  amount: revenueProtected, sourceKeys: ["initialDenialRate","eligibilityShare","neverRecovered","denialReduction"] },
    ];
  },

  // Powers the side-by-side comparison view (Section 4). Same math, expressed as manual vs automated.
  comparison: (v: Record<string, number>) => {
    const A = ELIGIBILITY_AGENT, I = ELIGIBILITY_INDUSTRY;
    const manualLabor = (v.appointmentsPerMonth * v.manualMinutes / 60) * v.staffHourly;
    const autoLabor = manualLabor * (1 - A.manualEffortRemoved.value);

    const eligDenials = v.appointmentsPerMonth * I.initialDenialRate.value * I.eligibilityShare.value;
    const revLostManual = eligDenials * I.neverRecovered.value * v.avgReimbursement;
    const revLostAuto = revLostManual * (1 - A.denialReduction.value);

    return {
      period: "monthly",
      rows: [
        { label: "Verification labor",                manual: manualLabor,   automated: autoLabor,   saved: manualLabor - autoLabor },
        { label: "Revenue lost to eligibility errors", manual: revLostManual, automated: revLostAuto, saved: revLostManual - revLostAuto },
      ],
      totalManual: manualLabor + revLostManual,
      totalAutomated: autoLabor + revLostAuto,
      totalSaved: (manualLabor - autoLabor) + (revLostManual - revLostAuto),
    };
  },
},
```

Notes:
- Add `outputMode?: "single" | "comparison"` and `period?: "monthly" | "annual"` and an optional `comparison?` function to the `Product` interface. Default `outputMode` to `"single"` and `period` to `"annual"` so no other agent changes.
- `sourceKey` on a field may now point at `ELIGIBILITY_DEFAULTS` keys as well as `BENCHMARKS`; make the tooltip resolver handle both, or copy those two default sources into the shared source map.

---

## 3. The math in plain words (for the team and for QA)

Two monthly lines, both real hard dollars, no overlap between them.

**Line A, verification labor.** How many visits a month, times minutes per manual check, gives total hours. Times the hourly cost gives what manual verification costs today. The agent removes 65% of that effort (staff only handle the exceptions), so the saving is 65% of the manual cost.

**Line B, money lost to eligibility errors.** Of all visits, about 11.8% end in a denied claim, and about 24% of denials are caused by eligibility or registration errors. Of those eligibility denials, about 65% are never recovered and become write-offs (for example, care given under inactive or out-of-network coverage). Multiplied by the client's own average payment per visit, that is the money lost today. The agent cuts eligibility denials by 45%, so the saving is 45% of that lost money.

The two together are the monthly ROI, shown as manual cost versus automated cost.

---

## 4. UI for this agent only (replaces the generic module for `eligibility`)

When `outputMode === "comparison"`, render three calm blocks instead of the standard inputs-then-number module. Keep the light Apple-grade styling and low-cognitive-load rules from the main context.

**Block 1, "Your process today."** The four editable fields, generously spaced, each with its sourced default shown quietly and an info tooltip. This is the only editable area.

**Block 2, "What Quickflows does."** Three fixed capability facts as small cards or a clean row, clearly badged as Quickflows performance, not interactive:
- "65% less manual verification effort"
- "45% fewer coverage and network denials"
- "Verification in under 10 seconds"
A small caption: "Quickflows performance figures. Fixed, not adjustable."

**Block 3, "Manual vs Quickflows (per month)."** The comparison, which is the thing the sales team presents:

| | Doing it manually | With Quickflows | You save |
|---|---|---|---|
| Verification labor | `rows[0].manual` | `rows[0].automated` | `rows[0].saved` |
| Revenue lost to eligibility errors | `rows[1].manual` | `rows[1].automated` | `rows[1].saved` |
| **Total per month** | `totalManual` | `totalAutomated` | **`totalSaved`** |

- Headline above or beside the table, in the Doto LED numeral: "You save about $X / month," where X is `totalSaved`. Animate on input change.
- The "You save" column is the emphasis (violet). Manual column is neutral ink; Quickflows column is neutral too, so the gap does the talking.
- A quiet "How this is calculated" disclosure lists the industry constants with their sources: 11.8% initial denial rate (Experian/Kodiak 2024), 24% of denials from eligibility errors (MGMA 2024), 65% of denials never recovered (MGMA), plus the input defaults (12.64 min, MGMA; staff rate, PayScale/Salary.com/ZipRecruiter). Every number visible and sourced.
- All labels say "per month." No annual figures in this view.

Everything else about the calculator (segment picker, floating nav, other agents) is unchanged.

---

## 5. Acceptance test (at default inputs)

Defaults: 2,000 visits/mo, 12.64 min, $21/hr, $150 avg payment.

- Verification labor, manual: **~$8,848/mo** (2,000 × 12.64 / 60 × 21)
- Verification labor, with Quickflows: **~$3,097/mo** (35% of manual)
- Labor saved: **~$5,751/mo**
- Eligibility denials/mo: ~56.6 (2,000 × 11.8% × 24%)
- Revenue lost, manual: **~$5,522/mo** (56.6 × 65% × $150)
- Revenue lost, with Quickflows: **~$3,037/mo** (55% of manual)
- Money protected: **~$2,485/mo**
- **Total manual ~$14,370/mo, total with Quickflows ~$6,134/mo, total saved ~$8,236/mo.**

If these do not appear on first render, the wiring is wrong.

---

## 6. Two things to flag (not assumptions, decisions for Suryaa)

1. **Period mismatch with the combined total.** This agent is monthly; the others are annual. In the eligibility view, show monthly. If eligibility ever feeds the app's combined annual running total, multiply its two `compute` amounts by 12 there. Confirm whether you want eligibility in any combined total at all, or presented on its own.
2. **Overlap with RCM Provider.** RCM Provider's denial-recovery line uses the overall denial rate; eligibility's money line uses the eligibility subset (24% of denials). If a client is shown both agents together, do not add both denial figures, or you double-count the eligibility portion. For a single-agent eligibility demo this does not apply.

---

## 7. Copy for this agent

- Agent intro: "Your team verifies coverage, network status, benefits, and authorizations by hand for every visit. Here is what that costs, and what the agent saves."
- Block 2 caption: "Quickflows performance figures. Fixed, not adjustable."
- Comparison headline: "You save about $X every month."
- Disclosure trigger: "How this is calculated."
- Keep the calm, plain voice. No hype, no emoji, monthly throughout.
