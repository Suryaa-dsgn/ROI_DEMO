# Modification: RCM — Provider ROI (Claude Code)

**Scope:** This changes ONLY the `rcm-provider` agent in `ROI_Calculator_BUILD_CONTEXT_FINAL.md`. Every other agent, the design system, the experience architecture, and the floating nav stay exactly as they are. Do not touch them. This follows the same corrected pattern as the eligibility modification.

**Confirmed decisions (from Suryaa):**
- Monetize denials only: denial rework labor + denial write-offs. The other poster figures (3x appeals, 28% more revenue, 31% AR recovery) are shown as reinforcing facts, never added to the total, to avoid double-counting.
- Current denial rate is a locked industry constant (11.8%), not editable.
- Annual figures. Annual revenue is derived from claims times average payment, shown read-only, not editable.

**The framing that must come through:** what denials cost the provider today, done their current way, versus what Quickflows prevents and recovers. A clean side-by-side comparison the sales team presents live. Our agent's performance is a fixed fact. The only editable numbers are the client's own volume and payment.

---

## 1. Fixes to the exact issues raised in the screenshots

1. **Annual revenue is now derived, not editable.** `annualRevenue = claimsPerYear * avgReimbursement`, shown read-only for context. The old editable Annual revenue field is removed.
2. **The single headline number that "did not signify anything" is replaced** by the side-by-side comparison (Section 5), the same layout as the eligibility "You save about $X" view.
3. **The "Adjust assumptions" panel is removed for this agent.** Denial rate becomes a locked sourced constant. Our denial reduction becomes a locked poster constant, not an adjustable slider. There are no editable "assumptions" here anymore.

---

## 2. Three kinds of number

1. **Editable, the client's reality.** Only two fields: claims per year, average payment per claim.
2. **Locked, Quickflows performance.** From the poster. The one that drives the math is 35% fewer denials. The rest (3x appeals, 28% more revenue, 31% AR recovery, 80% clean claim rate) are shown as reinforcing facts, not monetized.
3. **Locked, industry constants.** Sourced rates used in the math: 11.8% denial rate, $50 rework cost, 65% never recovered. Shown with citations in a "How this is calculated" area.

No Quickflows number is an adjustable assumption.

---

## 3. Data model (drop-in replacement for the `rcm-provider` entry in `roi-config.ts`)

Add these constant blocks near `BENCHMARKS`:

```ts
// Quickflows agent performance — LOCKED, from the RCM Provider poster. Never editable.
export const RCM_PROVIDER_AGENT = {
  denialReduction: { value: 0.35, label: "Fewer denials with pre-submission AI review", source: "Quickflows (poster: 35% fewer denials)" },
  // Reinforcing facts — DISPLAY ONLY. Shown as capability facts, never added to the dollar total.
  fasterAppeals:  { value: 3,    label: "Faster appeals vs manual preparation",            source: "Quickflows (poster: 3x faster appeals)",    displayOnly: true },
  moreRevenue:    { value: 0.28, label: "Improvement in net collection rate per provider", source: "Quickflows (poster: 28% more revenue)",     displayOnly: true },
  arRecovery:     { value: 0.31, label: "Improvement in outstanding balance collection",   source: "Quickflows (poster: 31% AR recovery)",      displayOnly: true },
  cleanClaimRate: { value: 0.80, label: "Clean claim rate on first submission",            source: "Quickflows (poster: 80% clean claim rate)", displayOnly: true },
} as const;

// Industry constants — LOCKED, sourced. Used in the math, shown with citations.
export const RCM_PROVIDER_INDUSTRY = {
  denialRate:     { value: 0.118, label: "Initial claim denial rate", source: "Experian State of Claims 2025 / Kodiak 2024" },
  reworkCost:     { value: 50,    label: "Cost to rework one denied claim (midpoint of $25-$118)", source: "MGMA / Change Healthcare" },
  neverRecovered: { value: 0.65,  label: "Denied claims never recovered", source: "MGMA" },
} as const;
```

Replace the whole `rcm-provider` product object with this:

```ts
{
  id: "rcm-provider",
  name: "RCM — Provider",
  segments: ["provider"],
  blurb: "See what claim denials cost you each year, and what the agent prevents and recovers.",
  outputMode: "comparison",   // renders the side-by-side comparison (Section 5)
  period: "annual",

  // ONLY editable inputs = the client's reality
  fields: [
    { key: "claimsPerYear",    label: "Claims per year",           type: "number",   tier: "core", default: 200000, min: 1000, step: 1000, unit: "claims/yr" },
    { key: "avgReimbursement", label: "Average payment per claim", type: "currency", tier: "core", default: 300,    min: 10,   step: 10,   unit: "$" },
  ],

  // Derived, read-only. Shown for context, not editable, not part of the denial math.
  derived: (v: Record<string, number>) => ({
    annualRevenue: v.claimsPerYear * v.avgReimbursement,
  }),

  // For the app's value-category totals. Both are hard dollars, annual.
  compute: (v: Record<string, number>) => {
    const A = RCM_PROVIDER_AGENT, I = RCM_PROVIDER_INDUSTRY;
    const denials = v.claimsPerYear * I.denialRate.value;
    const prevented = denials * A.denialReduction.value;
    const revenueRecovered = prevented * I.neverRecovered.value * v.avgReimbursement;   // money recovered
    const reworkSaved = prevented * (1 - I.neverRecovered.value) * I.reworkCost.value;  // time saved
    return [
      { category: "moneyRecovered", label: "Denial write-offs recovered (annual)", amount: revenueRecovered, sourceKeys: ["denialRate","neverRecovered","denialReduction"] },
      { category: "timeSaved",      label: "Denial rework labor saved (annual)",   amount: reworkSaved,      sourceKeys: ["reworkCost","denialReduction"] },
    ];
  },

  // Powers the manual-vs-Quickflows comparison. Same math, expressed as manual vs automated.
  comparison: (v: Record<string, number>) => {
    const A = RCM_PROVIDER_AGENT, I = RCM_PROVIDER_INDUSTRY;
    const denials = v.claimsPerYear * I.denialRate.value;

    const writeOffManual = denials * I.neverRecovered.value * v.avgReimbursement;
    const writeOffQf     = writeOffManual * (1 - A.denialReduction.value);

    const reworkManual = denials * (1 - I.neverRecovered.value) * I.reworkCost.value;
    const reworkQf     = reworkManual * (1 - A.denialReduction.value);

    const totalManual = writeOffManual + reworkManual;

    return {
      period: "annual",
      rows: [
        { label: "Revenue lost to denials", manual: writeOffManual, automated: writeOffQf, saved: writeOffManual - writeOffQf },
        { label: "Denial rework labor",     manual: reworkManual,   automated: reworkQf,   saved: reworkManual - reworkQf },
      ],
      totalManual,
      totalAutomated: writeOffQf + reworkQf,
      totalSaved: (writeOffManual - writeOffQf) + (reworkManual - reworkQf),
      context: {
        annualRevenue: v.claimsPerYear * v.avgReimbursement,
        denialsPerYear: denials,
        denialCostShareOfRevenue: totalManual / (v.claimsPerYear * v.avgReimbursement),
      },
    };
  },
},
```

Removed from the old config: the editable `annualRevenue` field, the `denialRate` advanced field, `daysARReduced`, and the `denialReduction` slider. The cash-freed / AR line is gone because we are monetizing denials only.

---

## 4. The math in plain words (for the team and QA)

Two annual lines, both real hard dollars, no overlap.

Start with denials per year: claims times the industry denial rate of 11.8%. Quickflows prevents 35% of those denials before submission. Split the prevented denials the way the industry splits denials today: about 65% would never have been recovered, and about 35% would have been worked by staff.

**Line 1, revenue lost to denials (write-offs).** The 65% that would have been written off, valued at the client's average payment per claim, is money lost today. Quickflows prevents 35% of it, so that is revenue recovered.

**Line 2, denial rework labor.** The 35% that staff would have worked, at $50 of rework cost each, is labor spent today. Quickflows removes 35% of it, so that is labor saved.

The two together are the annual ROI, shown as manual denial cost versus Quickflows denial cost.

The other poster numbers (3x faster appeals, 28% more revenue, 31% better AR recovery) are real and reinforce the story, but they overlap with denial prevention, so they are shown as facts and deliberately not added to the total.

---

## 5. UI for this agent only (side-by-side, matching the eligibility "You save" view)

When `outputMode === "comparison"`, use the same left-inputs / right-comparison layout the team approved. Light, Apple-grade styling and low-load rules from the main context.

**Left column, "Your process today."**
- The two editable fields: claims per year, average payment per claim.
- Below them, a read-only derived line: "Annual revenue: $X" with a small derived/lock indicator so it is clearly not editable. Tooltip: "Calculated from claims times average payment."
- One quiet context stat: "Denials are costing you about Y% of revenue today" (from `context.denialCostShareOfRevenue`). This is a strong, honest hook for the sales conversation.

**Right column, the comparison.**
- Headline in the Doto LED numeral: "You save about $X / year," where X is `totalSaved`. Animate on input change.
- The table:

| Per year | Doing it manually | With Quickflows | You save |
|---|---|---|---|
| Revenue lost to denials | `rows[0].manual` | `rows[0].automated` | `rows[0].saved` |
| Denial rework labor | `rows[1].manual` | `rows[1].automated` | `rows[1].saved` |
| **Total per year** | `totalManual` | `totalAutomated` | **`totalSaved`** |

- The "You save" column is the emphasis (violet). Manual and Quickflows columns stay neutral so the gap does the talking.

**"What Quickflows does" block (locked facts).**
- The driver, badged as performance: "35% fewer denials with pre-submission AI review."
- Reinforcing facts, in a clearly separated row: "3x faster appeals", "28% higher net collection", "31% better AR recovery", "80% clean claim rate."
- Caption: "Reinforcing outcomes. Shown to support the story, intentionally not added to the savings total, so the number stays defensible."

**"How this is calculated" disclosure.**
- Lists the constants with sources: 11.8% initial denial rate (Experian/Kodiak 2024), $50 to rework a denial (MGMA / Change Healthcare), 65% of denials never recovered (MGMA), and the 35% Quickflows reduction (poster).
- All figures visible and sourced. All labels say "per year."

Everything else about the calculator is unchanged.

---

## 6. Acceptance test (at default inputs)

Defaults: 200,000 claims/year, $300 average payment.

- Annual revenue (derived, read-only): **$60,000,000**
- Denials per year: 23,600 (200,000 x 11.8%)
- Revenue lost to denials, manual: **$4,602,000** (23,600 x 65% x $300)
- Revenue lost to denials, with Quickflows: **$2,991,300** (65% of manual)
- Recovered: **$1,610,700**
- Denial rework labor, manual: **$413,000** (23,600 x 35% x $50)
- Denial rework labor, with Quickflows: **$268,450**
- Labor saved: **$144,550**
- **Total manual $5,015,000, total with Quickflows $3,259,750, total saved $1,755,250.**
- Context stat: denials cost about **8.4% of revenue** today ($5,015,000 / $60,000,000).

If these do not appear on first render, the wiring is wrong.

---

## 7. One thing to flag (not an assumption, a note)

The rework cost is set to $50, the midpoint of the sourced $25 to $118 range (MGMA / Change Healthcare), matching the figure used in the eligibility model for consistency. If you want a more conservative or more aggressive number, change `RCM_PROVIDER_INDUSTRY.reworkCost` in one place. It stays a locked, sourced constant either way.

---

## 8. Copy for this agent

- Agent intro: "Denials are one of the biggest preventable losses in your revenue cycle. Here is what they cost you today, and what the agent prevents and recovers."
- Context stat: "Denials are costing you about Y% of revenue today."
- "What Quickflows does" caption: "Reinforcing outcomes. Not added to the savings total, so the number stays defensible."
- Comparison headline: "You save about $X every year."
- Disclosure trigger: "How this is calculated."
- Calm, plain voice. No hype, no emoji. Annual throughout.

---

## Note on ProviderCred

Your message also mentioned modifying ProviderCred, but the screenshots, poster, and your explicit request were all RCM Provider, so this plan covers RCM Provider only. ProviderCred is a good next one to redo in this same pattern (its value is credentialing labor saved, faster time to billing, and exclusion-fine risk avoided, which maps cleanly to the manual-vs-Quickflows comparison). Say the word and I will produce the ProviderCred modification the same way, with its own confirmation questions first.
