# Modification: Referral Management ROI (Claude Code)

**Scope:** This changes ONLY the `referral` agent in `ROI_Calculator_BUILD_CONTEXT_FINAL.md`. Every other agent, the design system, the experience architecture, and the floating nav stay exactly as they are. Do not touch them. Same corrected pattern as eligibility, RCM Provider, and ProviderCred.

**Source rule for this agent:** every Quickflows performance number comes only from the Referral Management poster. Nothing external, nothing invented. Client inputs are the only non-poster numbers.

**Confirmed decisions (from Suryaa):**
- Dollar total = coordinator labor saved only (driven by the poster's 80% less manual coordinator work).
- Referral leakage = shown as a percentage fact only ("40% reduction in referral leakage"). No dollar figure. No client input for it.
- Period = monthly.
- Stick strictly to this poster. Nothing else.

---

## 1. What changes from the current build

The current build had:
- Two editable inputs (coordinator hours, hourly cost) that were not grounded in the poster's own figures.
- A revenue-retention line that was disabled because the source was pending. That line is now replaced by the leakage fact (no dollar figure), which matches the confirmed decision.
- No side-by-side comparison view. This adds one, consistent with the other agents.

---

## 2. Three kinds of number

1. **Editable, the client's reality.** Three fields only: referrals per month, minutes to process one referral manually, coordinator hourly cost.
2. **Locked, Quickflows performance (poster only).** 80% less manual coordinator work drives the total. Everything else from the poster is a reinforcing fact shown but never monetized.
3. **No industry constants.** No external benchmarks are used for this agent. Every figure is either a poster claim or a client input.

---

## 3. Data model (drop-in replacement for the `referral` entry in `roi-config.ts`)

Add this constant block near `BENCHMARKS`:

```ts
// Quickflows agent performance — LOCKED, from the Referral Management poster ONLY. Never editable.
export const REFERRAL_AGENT = {
  coordinatorWorkReduction: { value: 0.80, label: "Less manual coordinator work",              source: "Quickflows (poster: 80% less manual coordinator work)" },
  leakageReduction:         { value: 0.40, label: "Reduction in referral leakage",              source: "Quickflows (poster: 40% reduction in referral leakage)" },
  // Reinforcing facts — DISPLAY ONLY, from poster. Never monetized, never in the total.
  cycleDays:         { before: 7, after: 1, label: "Avg referral cycle time",                  source: "Quickflows (poster: 7→1 days)",              displayOnly: true },
  inNetworkRate:     { value: 0.27,         label: "More referrals kept in-network",            source: "Quickflows (poster: 27% more in-network)",   displayOnly: true },
  authDelays:        { value: 0.26,         label: "Faster insurance approvals",                source: "Quickflows (poster: 26% fewer auth delays)",  displayOnly: true },
  referralVisibility:{ value: 0.92,         label: "Real-time referral status tracking",        source: "Quickflows (poster: 92% referral visibility)", displayOnly: true },
  intakeProcessing:  { value: 0.90,         label: "Less intake processing vs fax-based",       source: "Quickflows (poster: 90% less intake processing)", displayOnly: true },
  hoursSavedRef:     { value: 2000,         label: "Coordinator hours saved per year (reference figure)", source: "Quickflows (poster: 2,000+ hours saved)", displayOnly: true },
} as const;
```

Replace the whole `referral` product object with this:

```ts
{
  id: "referral",
  name: "Referral Management",
  segments: ["homeHealth", "provider"],
  blurb: "See what manual referral coordination costs your team each month, and what the agent saves.",
  outputMode: "comparison",
  period: "monthly",

  // ONLY editable inputs = the client's reality
  fields: [
    { key: "referralsPerMonth",   label: "Referrals handled per month",          type: "number",   tier: "core", default: 400,  min: 10, step: 10, unit: "referrals/mo" },
    { key: "manualMinutes",       label: "Minutes to process one referral manually", type: "number", tier: "core", default: 25, min: 1, max: 120, step: 1, unit: "min", hint: "Includes intake, validation, auth, follow-up, and loop closure" },
    { key: "coordinatorHourly",   label: "Coordinator cost per hour",             type: "currency", tier: "core", default: 25, min: 12, step: 1, unit: "$/hr" },
  ],

  // For the app's value-category totals. Hard dollar, monthly.
  compute: (v: Record<string, number>) => {
    const A = REFERRAL_AGENT;
    const manualLabor = (v.referralsPerMonth * v.manualMinutes / 60) * v.coordinatorHourly;
    const laborSaved  = manualLabor * A.coordinatorWorkReduction.value;
    return [
      { category: "timeSaved", label: "Coordinator labor saved (monthly)", amount: laborSaved, sourceKeys: ["coordinatorWorkReduction"] },
    ];
  },

  // Powers the side-by-side comparison view.
  comparison: (v: Record<string, number>) => {
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
      totalSaved:     manualLabor - autoLabor,   // the headline "You save"
      leakageFact: {
        label: "Referral leakage reduced",
        value: A.leakageReduction.value,         // 0.40
        display: "40% reduction in referral leakage",
        source: A.leakageReduction.source,
        note: "Shown as a fact. No dollar figure added, per agreed approach.",
      },
    };
  },
},
```

The old revenue-retention placeholder line (disabled, "source pending") is fully removed and replaced by the leakage fact block above.

---

## 4. The math in plain words (for the team and QA)

**The total, coordinator labor saved.** Referrals per month, times the minutes your coordinator spends on each one by hand (intake, validation, auth follow-up, loop closure), divided by 60, times their hourly cost, is what manual referral handling costs today. The agent removes 80% of that coordinator work (the poster's number), so the saving is 80% of the manual cost. That is the only figure in the headline total.

**Separate fact, referral leakage.** The poster states 40% reduction in referral leakage. This is a real and important outcome, and it is shown prominently as a capability fact. It is not given a dollar figure because the value of a kept referral varies too much by network and contract to state one honestly. Showing it as a percentage keeps it clean and defensible.

The other poster numbers (7→1 days cycle time, 27% more in-network, 26% fewer auth delays, 92% visibility, 90% less intake processing, 2,000+ hours saved per year) are shown as reinforcing facts, not monetized.

---

## 5. UI for this agent (side-by-side, matching the other agents)

When `outputMode === "comparison"`, use the left-inputs / right-comparison layout.

**Left column, "Your process today."**
- Three editable fields: referrals per month, minutes per referral, coordinator hourly cost.
- Generous spacing, Geist Sans labels, large tap targets.
- A small quiet note beneath: "Minutes per referral should cover intake, validation, prior auth follow-up, and closing the loop."

**Right column, the comparison.**
- Headline in the Doto LED numeral: "You save about $X / month," where X is `totalSaved`. Animate on change.
- Table:

| Per month | Doing it manually | With Quickflows | You save |
|---|---|---|---|
| Referral coordination labor | `rows[0].manual` | `rows[0].automated` | `rows[0].saved` |
| **Total per month** | `totalManual` | `totalAutomated` | **`totalSaved`** |

- "You save" column in violet. Manual and Quickflows columns neutral so the gap does the talking.

**Leakage fact, clearly separated beneath the table.**
A distinct block, visually separated from the total:
- Large label: "40% reduction in referral leakage"
- One-line explanation: "Every out-of-network referral is lost revenue and a gap in patient care continuity. Quickflows reduces leakage by 40% by prioritizing in-network providers automatically."
- Small note: "Not expressed as a dollar figure, because the value of a kept referral varies by contract. Shown as a capability fact."

**"What Quickflows does" block (locked poster facts).**
- Driver, badged: "80% less manual coordinator work."
- Reinforcing facts shown as clean stat chips: "7→1 days cycle time", "27% more referrals in-network", "26% fewer auth delays", "92% referral visibility", "90% less intake processing", "2,000+ coordinator hours saved per year."
- Caption: "Reinforcing outcomes from the poster. Not added to the savings total."

**"How this is calculated" disclosure.**
- State: performance figures (80%, 40%) are from the Referral Management poster. Manual minutes per referral and coordinator cost are your team's own numbers. No external benchmarks are used for this agent.
- All labels say "per month."

Everything else about the calculator is unchanged.

---

## 6. Acceptance test (at default inputs)

Defaults: 400 referrals/month, 25 min/referral, $25/hr coordinator.

- Manual labor: **$4,167/mo** (400 × 25 / 60 × 25)
- With Quickflows: **$833/mo** (20% of manual)
- Labor saved (the total): **$3,333/mo**

Headline: "You save about $3,333 every month."
Below it: "40% reduction in referral leakage" as a fact with explanation, not added to total.

If these do not appear on first render, the wiring is wrong.

---

## 7. Two inputs to note (the only non-poster numbers)

The poster does not state how long manual referral processing takes, because that is the client's reality. The default of 25 minutes is a neutral placeholder covering intake, validation, prior-auth follow-up, and loop closure. The sales team should invite the client to adjust this live. It is labeled in the UI as "your team's number, not a poster figure."

---

## 8. Copy for this agent

- Agent intro: "Referral leakage is one of the largest preventable revenue losses in any care network. Here is what manual coordination costs your team today, and what the agent saves."
- Leakage fact label: "40% reduction in referral leakage."
- Leakage explanation: "Every out-of-network referral is lost revenue and a gap in care continuity. Quickflows reduces leakage by 40% by prioritizing in-network providers automatically."
- Leakage note: "Not expressed as a dollar figure, because the value of a kept referral varies by contract. Shown as a capability fact."
- Comparison headline: "You save about $X every month."
- "What Quickflows does" caption: "Reinforcing outcomes from the poster. Not added to the savings total."
- Disclosure trigger: "How this is calculated."
- Calm, plain voice. No hype, no emoji. Monthly throughout.
