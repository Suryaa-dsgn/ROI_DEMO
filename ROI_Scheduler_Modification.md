# Modification: Quickflows Scheduler ROI (Claude Code)

**Scope:** This changes ONLY the `scheduler` agent in `ROI_Calculator_BUILD_CONTEXT_FINAL.md`. Every other agent, the design system, the experience architecture, and the floating nav stay exactly as they are. Do not touch them. Same corrected pattern as the other agents.

**Confirmed decisions:**
- Three-part calculation structure with distinct input groups.
- Total = Part 1 (agency + overtime savings) + Part 2 (scheduling labor + turnover savings). All annual.
- Part 3 (revenue from filled shifts) is shown as a separate line below the comparison, never in the total.
- Period: annual throughout. Weekly inputs multiply by 52. Monthly inputs multiply by 12.
- All Quickflows performance figures are locked constants from the poster. No adjustable assumptions.

---

## 1. What changes from the current build

1. The old build had agency spend, overtime spend, and turnover as editable dollar amounts. Now the client enters their operational reality (hours, rates, volume) and the math derives the costs. This is more credible and matches how a conversation in a sales meeting actually goes.
2. The old "Adjust assumptions" panel with editable improvement sliders is removed entirely. All Quickflows performance figures are locked poster constants.
3. Inputs are grouped into three labeled sections matching the three input panels. The right side shows one comparison table combining all four savings lines.
4. Part 3 (revenue from filled shifts) moves below the comparison as a clearly separated line, matching the ProviderCred pattern.

---

## 2. Three kinds of number

1. **Editable, the client's operational reality.** Ten fields across three groups. All have sensible defaults pre-filled so the demo shows real numbers immediately.
2. **Locked, Quickflows performance (poster only).** 18% lower overtime spend, 40% less coordinator workload, 25% caregiver retention improvement, 92% automatic fill rate. Never editable, never shown as assumptions.
3. **Reinforcing facts (display only).** 96% schedule accuracy, under 5 minutes call-off response, 2+ weeks advance capacity warning, 100% audit trail. Shown as capability facts, not monetized.

---

## 3. Data model (drop-in replacement for the `scheduler` entry in `roi-config.ts`)

Add this constant block near `BENCHMARKS`:

```ts
// Quickflows Scheduler performance — LOCKED, from the poster only. Never editable.
export const SCHEDULER_AGENT = {
  overtimeReduction:     { value: 0.18, label: "Reduction in overtime and agency spend",          source: "Quickflows Scheduler (18% lower overtime spend)" },
  coordinatorReduction:  { value: 0.40, label: "Less manual time building and adjusting schedules", source: "Quickflows Scheduler (40% less coordinator workload)" },
  retentionImprovement:  { value: 0.25, label: "Improvement in caregiver retention",               source: "Quickflows Scheduler (25% caregiver retention improvement)" },
  autoFillRate:          { value: 0.92, label: "Open shifts filled automatically",                  source: "Quickflows Scheduler (92% automatic fill rate)" },
  // Reinforcing facts — display only, never monetized
  scheduleAccuracy:      { value: 0.96, label: "Shifts filled meeting skill and compliance requirements", source: "Quickflows Scheduler (96% schedule accuracy)", displayOnly: true },
  callOffResponse:       { value: 5,    label: "Minutes from call-off to confirmed replacement",        source: "Quickflows Scheduler (<5 min call-off response)", displayOnly: true },
  advanceWarning:        { value: 2,    label: "Weeks of advance capacity warning",                      source: "Quickflows Scheduler (2+ weeks advance warning)",  displayOnly: true },
  auditCoverage:         { value: 1.00, label: "Every assignment and swap fully traceable",              source: "Quickflows Scheduler (100% audit trail coverage)", displayOnly: true },
} as const;
```

Replace the whole `scheduler` product object with this:

```ts
{
  id: "scheduler",
  name: "Quickflows Scheduler",
  segments: ["homeHealth", "provider"],
  blurb: "See what reactive scheduling costs your operation each year, and what the agent saves.",
  outputMode: "comparison",
  period: "annual",

  // Editable inputs — the client's operational reality, grouped into three sections
  fields: [
    // GROUP 1: Staffing Costs
    { key: "avgHourlyRate",       label: "Average staff hourly rate",          type: "currency", tier: "core", group: "staffing",   default: 35,  min: 10, step: 1,   unit: "$/hr" },
    { key: "overtimeHoursWeek",   label: "Overtime hours per week (all staff)", type: "number",  tier: "core", group: "staffing",   default: 120, min: 0,  step: 5,   unit: "hrs/wk" },
    { key: "overtimeMultiplier",  label: "Overtime rate multiplier",            type: "number",  tier: "core", group: "staffing",   default: 1.5, min: 1,  max: 3, step: 0.25, hint: "Typically 1.5x for time-and-a-half" },
    { key: "agencyHoursWeek",     label: "Agency hours used per week",          type: "number",  tier: "core", group: "staffing",   default: 150, min: 0,  step: 5,   unit: "hrs/wk" },
    { key: "agencyHourlyRate",    label: "Agency hourly cost",                  type: "currency", tier: "core", group: "staffing",  default: 85,  min: 20, step: 5,   unit: "$/hr" },

    // GROUP 2: Scheduling Effort
    { key: "schedulingHoursWeek", label: "Manual scheduling hours per week",    type: "number",  tier: "core", group: "scheduling", default: 25,  min: 1,  step: 1,   unit: "hrs/wk" },
    { key: "schedulerRate",       label: "Scheduler hourly rate",               type: "currency", tier: "core", group: "scheduling", default: 45, min: 15, step: 1,   unit: "$/hr" },
    { key: "numSchedulers",       label: "Number of schedulers",                type: "number",  tier: "core", group: "scheduling", default: 3,   min: 1,  step: 1,   unit: "people" },
    { key: "staffReplacementsYr", label: "Staff replacements per year",         type: "number",  tier: "core", group: "scheduling", default: 8,   min: 0,  step: 1,   unit: "per yr" },
    { key: "replacementCost",     label: "Cost to replace one staff member",    type: "currency", tier: "core", group: "scheduling", default: 60000, min: 5000, step: 1000, unit: "$" },

    // GROUP 3: Unfilled Shifts (feeds the separate revenue line only)
    { key: "unfilledShiftsMo",    label: "Unfilled shifts per month",           type: "number",  tier: "core", group: "revenue",    default: 12,  min: 0,  step: 1,   unit: "shifts/mo" },
    { key: "revenuePerShift",     label: "Average revenue per shift (8 hrs)",   type: "currency", tier: "core", group: "revenue",   default: 600, min: 50, step: 50,  unit: "$" },
  ],

  // For the app's value-category totals. Parts 1 and 2 only. Annual.
  compute: (v: Record<string, number>) => {
    const A = SCHEDULER_AGENT;

    // PART 1 — Overtime and agency savings
    const agencyPremiumAnnual    = v.agencyHoursWeek * (v.agencyHourlyRate - v.avgHourlyRate) * 52;
    const overtimePremiumAnnual  = v.overtimeHoursWeek * v.avgHourlyRate * (v.overtimeMultiplier - 1) * 52;
    const agencySaved   = agencyPremiumAnnual  * A.overtimeReduction.value;
    const overtimeSaved = overtimePremiumAnnual * A.overtimeReduction.value;

    // PART 2 — Scheduling labor and turnover
    const schedulingLaborAnnual = v.schedulingHoursWeek * v.schedulerRate * v.numSchedulers * 52;
    const schedulingLaborSaved  = schedulingLaborAnnual * A.coordinatorReduction.value;
    const turnoverCostAnnual    = v.staffReplacementsYr * v.replacementCost;
    const turnoverSaved         = turnoverCostAnnual * A.retentionImprovement.value;

    return [
      { category: "moneySaved", label: "Agency premium eliminated (annual)",     amount: agencySaved,         sourceKeys: ["overtimeReduction"] },
      { category: "moneySaved", label: "Overtime premium eliminated (annual)",    amount: overtimeSaved,       sourceKeys: ["overtimeReduction"] },
      { category: "timeSaved",  label: "Scheduling labor saved (annual)",         amount: schedulingLaborSaved, sourceKeys: ["coordinatorReduction"] },
      { category: "moneySaved", label: "Turnover cost avoided (annual)",          amount: turnoverSaved,       sourceKeys: ["retentionImprovement"] },
    ];
  },

  // Powers the side-by-side comparison. Includes Part 3 in the separate block.
  comparison: (v: Record<string, number>) => {
    const A = SCHEDULER_AGENT;

    // PART 1
    const agencyPremiumAnnual    = v.agencyHoursWeek * (v.agencyHourlyRate - v.avgHourlyRate) * 52;
    const overtimePremiumAnnual  = v.overtimeHoursWeek * v.avgHourlyRate * (v.overtimeMultiplier - 1) * 52;
    const agencyManual   = agencyPremiumAnnual;
    const agencyQf       = agencyPremiumAnnual   * (1 - A.overtimeReduction.value);
    const overtimeManual = overtimePremiumAnnual;
    const overtimeQf     = overtimePremiumAnnual * (1 - A.overtimeReduction.value);

    // PART 2
    const schedulingLaborAnnual  = v.schedulingHoursWeek * v.schedulerRate * v.numSchedulers * 52;
    const schedulingManual = schedulingLaborAnnual;
    const schedulingQf     = schedulingLaborAnnual * (1 - A.coordinatorReduction.value);
    const turnoverAnnual   = v.staffReplacementsYr * v.replacementCost;
    const turnoverManual   = turnoverAnnual;
    const turnoverQf       = turnoverAnnual * (1 - A.retentionImprovement.value);

    const totalManual    = agencyManual + overtimeManual + schedulingManual + turnoverManual;
    const totalAutomated = agencyQf    + overtimeQf     + schedulingQf     + turnoverQf;

    // PART 3 — Revenue from filled shifts (separate, not in total)
    const revenueRecoveredAnnual = v.unfilledShiftsMo * A.autoFillRate.value * v.revenuePerShift * 12;

    return {
      period: "annual",
      rows: [
        { label: "Agency premium cost",   manual: agencyManual,    automated: agencyQf,    saved: agencyManual - agencyQf,    group: "Part 1 — Staffing Costs" },
        { label: "Overtime premium cost", manual: overtimeManual,  automated: overtimeQf,  saved: overtimeManual - overtimeQf, group: "Part 1 — Staffing Costs" },
        { label: "Scheduling labor",      manual: schedulingManual, automated: schedulingQf, saved: schedulingManual - schedulingQf, group: "Part 2 — Scheduling Effort" },
        { label: "Staff turnover cost",   manual: turnoverManual,  automated: turnoverQf,  saved: turnoverManual - turnoverQf, group: "Part 2 — Scheduling Effort" },
      ],
      totalManual,
      totalAutomated,
      totalSaved: totalManual - totalAutomated,
      separate: {
        revenueFromFilledShifts: revenueRecoveredAnnual,
        label: "Revenue from filled shifts",
        note: "92% of currently unfilled shifts get filled automatically. Shown separately, not in the total above.",
        source: "Quickflows Scheduler (92% automatic fill rate)",
      },
    };
  },
},
```

---

## 4. The math in plain words (for the team and QA)

**Part 1, staffing cost savings.** Two non-overlapping calculations, both using the 18% reduction:

*Agency premium:* Agency staff cost more than internal staff. Multiply agency hours per week by the premium per hour (agency rate minus internal rate), times 52 weeks. That is what the premium costs today. The agent reduces agency reliance by 18%, so 18% of that premium is saved.

*Overtime premium:* Overtime costs more than regular time. Multiply overtime hours per week by the base hourly rate by the premium above base (multiplier minus 1, not the full multiplier), times 52 weeks. That is what the overtime premium costs today. The agent reduces overtime by 18%, so 18% of that premium is saved.

These two do not overlap because agency cost and overtime cost are separate line items.

**Part 2, scheduling effort savings.** Two non-overlapping calculations:

*Scheduling labor:* Multiply scheduling hours per week by the scheduler rate by the number of schedulers by 52 weeks. That is what manual scheduling costs today. The agent reduces manual scheduling work by 40%, so 40% is saved.

*Staff turnover:* Multiply staff replacements per year by the cost to replace one person. That is what turnover costs today. The agent improves caregiver retention by 25%, so 25% is saved.

These two do not overlap: one is labor cost, the other is replacement cost.

**Part 3, revenue from filled shifts (separate line).** Multiply unfilled shifts per month by 92% (the automatic fill rate) by the revenue per shift by 12 months. That is the revenue currently being lost that the agent recovers. Shown below the comparison table, clearly separate, never added to the total.

---

## 5. UI for this agent

Use the left-inputs / right-comparison layout, but because there are more inputs than the other agents, the left column uses three clearly labeled collapsible groups.

**Left column, three input groups.**

Group 1 — "Staffing costs" with a subtle section label:
- Average staff hourly rate
- Overtime hours per week
- Overtime rate multiplier
- Agency hours per week
- Agency hourly cost

Group 2 — "Scheduling effort":
- Manual scheduling hours per week
- Scheduler hourly rate
- Number of schedulers
- Staff replacements per year
- Cost to replace one staff member

Group 3 — "Unfilled shifts" (feeds the separate revenue line, clearly labeled as such):
- Unfilled shifts per month
- Average revenue per shift

Group 3 has a quiet label beneath it: "Used to calculate the revenue recovery line shown below the total."

**Right column, the comparison.**

Headline in the Doto LED numeral: "You save about $X / year," where X is `totalSaved`. Animate on change.

Table, with group labels as quiet dividers between rows:

| Per year | Doing it manually | With Quickflows | You save |
|---|---|---|---|
| *Staffing costs* | | | |
| Agency premium cost | `rows[0].manual` | `rows[0].automated` | `rows[0].saved` |
| Overtime premium cost | `rows[1].manual` | `rows[1].automated` | `rows[1].saved` |
| *Scheduling effort* | | | |
| Scheduling labor | `rows[2].manual` | `rows[2].automated` | `rows[2].saved` |
| Staff turnover cost | `rows[3].manual` | `rows[3].automated` | `rows[3].saved` |
| **Total per year** | `totalManual` | `totalAutomated` | **`totalSaved`** |

"You save" column in violet. Manual and Quickflows columns neutral.

**Revenue from filled shifts — separate block beneath the table.**

Visually distinct from the total, same treatment as the ProviderCred separate lines:
- Label: "Revenue from filled shifts"
- Amount: `separate.revenueFromFilledShifts` per year in violet
- One-line explanation: "92% of your currently unfilled shifts get assigned automatically. At your average revenue per shift, that is revenue your operation is recovering."
- Small note: "Shown separately, not added to the total above."

**"What Quickflows does" block (locked poster facts).**

Drivers (the four that power the math), badged:
- "18% lower overtime and agency spend"
- "40% less coordinator scheduling work"
- "25% improvement in caregiver retention"
- "92% automatic fill rate for open shifts"

Reinforcing facts shown as stat chips:
- "96% schedule accuracy", "Under 5 min call-off response", "2+ weeks advance capacity warning", "100% audit trail"

Caption: "All figures from Quickflows Scheduler. Not adjustable."

**"How this is calculated" disclosure.**
- State each constant and where it comes from (poster).
- Clarify the overtime formula: the multiplier above 1.0 is the premium portion; the full multiplier is not used, to avoid overstating the cost.
- All labels say "per year."

---

## 6. Acceptance test (at default inputs)

Defaults: $35/hr, 120 OT hrs/wk, 1.5x multiplier, 150 agency hrs/wk, $85 agency rate, 25 scheduling hrs/wk, $45/hr, 3 schedulers, 8 replacements/yr, $60,000 replacement cost, 12 unfilled shifts/mo, $600/shift.

**Part 1:**
- Agency premium annual: 150 × (85−35) × 52 = **$390,000**
- Agency saved (18%): **$70,200**
- Overtime premium annual: 120 × 35 × 0.5 × 52 = **$109,200**
- Overtime saved (18%): **$19,656**

**Part 2:**
- Scheduling labor annual: 25 × 45 × 3 × 52 = **$175,500**
- Scheduling saved (40%): **$70,200**
- Turnover cost annual: 8 × 60,000 = **$480,000**
- Turnover saved (25%): **$120,000**

**Total:**
- Manual total: $390,000 + $109,200 + $175,500 + $480,000 = **$1,154,700**
- With Quickflows: $319,800 + $89,544 + $105,300 + $360,000 = **$874,644**
- **Total saved: $280,056/year**

**Part 3 (separate):**
- Revenue recovered: 12 × 0.92 × 600 × 12 = **$79,488/year**

Headline: "You save about $280,056 every year."
Below it: "Revenue from filled shifts: $79,488/year."

If these do not match on first render, the wiring is wrong.

---

## 7. One design note for cognitive load

Eleven inputs is more than the other agents. Keep each group visually contained with a clear group label and a subtle separator between groups. The groups should feel like three small, separate cards within the left column, not one long form. Each group has 4 to 5 fields maximum, which is manageable. The right column shows the full picture so the user sees why each group matters.

---

## 8. Copy for this agent

- Agent intro: "Reactive scheduling, agency reliance, and avoidable turnover are three of the largest preventable costs in workforce-heavy operations. Here is what they cost today, and what the agent eliminates."
- Group 1 label: "Staffing costs"
- Group 2 label: "Scheduling effort"
- Group 3 label: "Unfilled shifts"
- Group 3 note: "Used to calculate the revenue recovery line shown below the total."
- Revenue line label: "Revenue from filled shifts"
- Revenue line note: "Shown separately, not added to the total above."
- Comparison headline: "You save about $X every year."
- "What Quickflows does" caption: "All figures from Quickflows Scheduler. Not adjustable."
- Disclosure trigger: "How this is calculated."
- Calm, plain voice. No hype, no emoji. Annual throughout.
