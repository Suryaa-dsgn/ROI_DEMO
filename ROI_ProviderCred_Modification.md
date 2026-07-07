# Modification: ProviderCred (Credentialing) ROI (Claude Code)

**Scope:** This changes ONLY the `providercred` agent in `ROI_Calculator_BUILD_CONTEXT_FINAL.md`. Every other agent, the design system, the experience architecture, and the floating nav stay exactly as they are. Do not touch them. Same corrected pattern as the eligibility and RCM Provider modifications.

**Source rule for this agent:** every Quickflows performance number here comes only from the ProviderCred poster. Nothing external. The only non-poster numbers are the client's own inputs (their volume, their staff cost, their manual times), which the client supplies. See the two flagged inputs in Section 6.

**Confirmed decisions (from Suryaa):**
- The dollar total is credentialing labor saved only.
- Faster time-to-billing and compliance risk are shown as separate labeled lines, never added to the total.
- The labor math is driven by the poster's 70% (reduction in manual verification time).
- Risk is the poster's $2M+, shown as a separate "risk avoided" line, never in the total.

---

## 1. Fixes to the current build

1. **Risk figure changes from $6.5M to $2M+.** The $6.5M on screen came from an external OIG figure. Per your instruction to stick to the poster, use the poster's "$2M+ compliance exposure eliminated per year." Never added to the total.
2. **The "Adjust assumptions" panel is removed for this agent.** Hours-saved and days-sooner were framed as editable assumptions. Our performance is now a locked poster constant (70%). The editable numbers are only the client's manual reality.
3. **The unclear headline number is replaced** by the side-by-side "You save about $X" comparison, matching the eligibility and RCM views, with the faster-billing and risk figures shown clearly beneath it as separate lines.

---

## 2. Three kinds of number

1. **Editable, the client's reality.** Their credentialing volume, manual verification time, staff cost, and onboarding time.
2. **Locked, Quickflows performance (poster only).** 70% less manual verification time (drives the total). $2M+ risk avoided (separate line). Reinforcing facts: 85% less manual work, 80% less compliance exposure, 90% faster recredentialing, 92% alert precision, 100% audit-ready, 75% more roster capacity.
3. **No external industry constants.** Unlike the other agents, nothing here is sourced from outside. Everything is either a poster figure or a client input.

---

## 3. Data model (drop-in replacement for the `providercred` entry in `roi-config.ts`)

Add this constant block near `BENCHMARKS`:

```ts
// Quickflows agent performance — LOCKED, from the ProviderCred poster ONLY. Never editable.
export const PROVIDERCRED_AGENT = {
  verificationTimeReduction: { value: 0.70,    label: "Reduction in manual provider verification time", source: "Quickflows (poster: 70% faster onboarding)" },
  onboardingSpeedup:         { value: 0.70,    label: "Faster onboarding (same 70% figure)",            source: "Quickflows (poster: 70% faster onboarding)" },
  riskAvoidedPerYear:        { value: 2000000, label: "Average compliance exposure eliminated per year", source: "Quickflows (poster: $2M+ risk avoided)" },
  // Reinforcing facts — DISPLAY ONLY, from poster. Never monetized, never in the total.
  lessManualWork:      { value: 0.85, label: "Less spreadsheet-based credentialing work",        source: "Quickflows (poster: 85% less manual work)",     displayOnly: true },
  complianceExposure:  { value: 0.80, label: "Less undetected compliance exposure",              source: "Quickflows (poster: 80% compliance exposure)",  displayOnly: true },
  recredentialingTime: { value: 0.90, label: "Faster recredentialing cycles",                    source: "Quickflows (poster: 90% recredentialing time)", displayOnly: true },
  alertPrecision:      { value: 0.92, label: "Improvement in match accuracy vs name-only screening", source: "Quickflows (poster: 92% alert precision)",  displayOnly: true },
  auditReady:          { value: 1.00, label: "Audit-ready reporting on demand",                  source: "Quickflows (poster: 100% audit-ready)",         displayOnly: true },
  rosterCapacity:      { value: 0.75, label: "More providers credentialed with the same team",   source: "Quickflows (poster: 75% roster capacity)",      displayOnly: true },
} as const;
```

Replace the whole `providercred` product object with this:

```ts
{
  id: "providercred",
  name: "ProviderCred (Credentialing)",
  segments: ["provider", "homeHealth"],
  blurb: "See what manual credentialing costs your team each year, and what the agent saves.",
  outputMode: "comparison",
  period: "annual",

  // ONLY editable inputs = the client's reality
  fields: [
    // Credentialing labor (drives the total)
    { key: "providersPerYear", label: "Providers credentialed per year", type: "number",   tier: "core", default: 500, min: 10, step: 10, unit: "providers/yr" },
    { key: "manualHours",      label: "Hours to verify one provider manually", type: "number", tier: "core", default: 6, min: 0.5, max: 40, step: 0.5, unit: "hrs", hint: "Your team's real number. Placeholder, not a poster figure." },
    { key: "staffHourly",      label: "Credentialing staff cost per hour", type: "currency", tier: "core", default: 35, min: 15, step: 1, unit: "$/hr" },
    // Onboarding speed (feeds the separate faster-billing line, NOT the total)
    { key: "newBillingProviders", label: "New billing providers per year", type: "number",   tier: "core", default: 100, min: 0, step: 5, unit: "providers" },
    { key: "onboardingDays",      label: "Days to onboard a new provider today", type: "number", tier: "core", default: 30, min: 1, max: 180, step: 1, unit: "days", hint: "Your team's real number. Placeholder, not a poster figure." },
    { key: "billingPerDay",       label: "Revenue a provider bills per day", type: "currency", tier: "core", default: 2000, min: 100, step: 100, unit: "$/day" },
  ],

  compute: (v: Record<string, number>) => {
    const A = PROVIDERCRED_AGENT;
    // TOTAL = labor saved only
    const manualLabor = v.providersPerYear * v.manualHours * v.staffHourly;
    const laborSaved = manualLabor * A.verificationTimeReduction.value;
    // SEPARATE line: faster billing (cash freed, timing)
    const daysSooner = v.onboardingDays * A.onboardingSpeedup.value;
    const cashFreed = v.newBillingProviders * daysSooner * v.billingPerDay;
    // SEPARATE line: risk avoided (poster flat figure)
    const riskAvoided = A.riskAvoidedPerYear.value;
    return [
      { category: "timeSaved",   label: "Credentialing labor saved (annual)",   amount: laborSaved,  sourceKeys: ["verificationTimeReduction"] },
      { category: "cashFreed",   label: "Revenue captured earlier (annual)",     amount: cashFreed,   sourceKeys: ["onboardingSpeedup"], note: "Timing, not new money. Separate line." },
      { category: "riskAvoided", label: "Compliance exposure avoided (annual)",  amount: riskAvoided, sourceKeys: ["riskAvoidedPerYear"], note: "Poster average. Separate line, never in the total." },
    ];
  },

  comparison: (v: Record<string, number>) => {
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
      totalManual: manualLabor,
      totalAutomated: autoLabor,
      totalSaved: manualLabor - autoLabor,   // the headline "You save"
      separate: {
        cashFreed,                            // shown below, labeled, NOT in the total
        riskAvoided: A.riskAvoidedPerYear.value, // shown below, labeled, NOT in the total
      },
    };
  },
},
```

In `aggregate()` this is already correct: `timeSaved` counts toward `hardDollar`; `cashFreed` and `riskAvoided` are separate categories and stay out of the total.

Removed from the old config: the editable hours-saved, staff-cost, and days-sooner "assumptions" as adjustable estimates, and the external OIG risk figure. All performance now comes from the poster.

---

## 4. The math in plain words (for the team and QA)

**The total, credentialing labor saved.** Providers credentialed per year, times the hours your team spends verifying one provider by hand, times the staff hourly cost, is what manual verification costs today. The agent removes 70% of that verification time (the poster's number), so the saving is 70% of the manual cost. That is the only figure in the headline total.

**Separate line, revenue captured earlier.** New billing providers per year, times the days sooner they can bill (your current onboarding days times the poster's 70% faster), times what a provider bills per day. This is cash arriving sooner, not new money, so it sits on its own line and is never added to the total.

**Separate line, compliance risk avoided.** The poster's $2M+ average compliance exposure eliminated per year, shown as-is on its own line, never added to the total.

The other poster numbers (85% less manual work, 80% less compliance exposure, 90% faster recredentialing, 92% alert precision, 100% audit-ready, 75% more roster capacity) are shown as reinforcing facts, not monetized.

---

## 5. UI for this agent (side-by-side, matching the eligibility and RCM views)

When `outputMode === "comparison"`, use the left-inputs / right-comparison layout.

**Left column, "Your process today."** Group into two small sets:
- Credentialing labor: providers per year, hours to verify one provider manually, staff cost per hour.
- Onboarding speed (for the separate faster-billing line): new billing providers per year, days to onboard today, revenue a provider bills per day.

**Right column, the comparison.**
- Headline in the Doto LED numeral: "You save about $X / year," where X is `totalSaved` (labor only). Animate on change.
- Table:

| Per year | Doing it manually | With Quickflows | You save |
|---|---|---|---|
| Credentialing verification labor | `rows[0].manual` | `rows[0].automated` | `rows[0].saved` |
| **Total per year** | `totalManual` | `totalAutomated` | **`totalSaved`** |

- Beneath the table, two clearly separated lines, visually distinct from the total:
  - "Revenue captured earlier: about $`separate.cashFreed` / year. Cash arriving sooner, not new money. Not in the total above."
  - "Compliance exposure avoided: $2M+ / year. Poster average. Kept separate, never in the total."

**"What Quickflows does" block (poster facts).**
- Driver, badged: "70% less manual verification time."
- Reinforcing facts: "85% less manual work", "80% less compliance exposure", "90% faster recredentialing", "92% alert precision", "100% audit-ready reporting", "75% more roster capacity."
- Caption: "Reinforcing outcomes from the poster. Not added to the savings total."

**"How this is calculated" disclosure.**
- State plainly: performance figures are from the ProviderCred poster (70% verification time, $2M+ risk). The manual hours per provider and current onboarding days are your team's own numbers, not poster claims. No external benchmarks are used for this agent.
- All labels say "per year."

Everything else about the calculator is unchanged.

---

## 6. Two inputs you must confirm (the only non-poster numbers)

The poster does not state how long manual verification takes or how long onboarding takes, because those are the client's reality. I set neutral placeholder defaults so the demo shows a number. Confirm or replace them:

- **Hours to verify one provider manually:** placeholder 6 hrs.
- **Days to onboard a new provider today:** placeholder 30 days.

These are the client's own figures in the room. They are labeled in the UI as "your team's real number, not a poster figure." Tell me your preferred defaults and I will set them, or leave them for the sales team to fill live.

---

## 7. Acceptance test (at default inputs)

Defaults: 500 providers/yr, 6 manual hours, $35/hr, 100 new billing providers, 30 onboarding days, $2,000/day.

- Manual verification labor: **$105,000/yr** (500 x 6 x $35)
- With Quickflows: **$31,500/yr** (30% of manual)
- Labor saved (the total): **$73,500/yr**
- Days sooner: 21 (30 x 70%)
- Revenue captured earlier (separate): **$4,200,000/yr** (100 x 21 x $2,000)
- Compliance exposure avoided (separate): **$2,000,000+/yr** (poster)

Headline "You save about $73,500 / year." Below it: $4.2M captured earlier and $2M+ risk avoided, both clearly separate.

If these do not appear on first render, the wiring is wrong.

---

## 8. Copy for this agent

- Agent intro: "Every provider you cannot bill yet is revenue waiting. Here is what manual credentialing costs your team today, and what the agent saves."
- Comparison headline: "You save about $X every year."
- Separate-line labels: "Revenue captured earlier (arrives sooner, not new money)", "Compliance exposure avoided (poster average, kept separate)."
- "What Quickflows does" caption: "Reinforcing outcomes from the poster. Not added to the savings total."
- Disclosure trigger: "How this is calculated."
- Calm, plain voice. No hype, no emoji. Annual throughout.
