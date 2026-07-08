# Minor Updates Across Agents (Claude Code)

**What this is:** targeted, surgical changes to four agents. Nothing else changes. The design system, experience architecture, floating nav, RCM Payer, and Scheduler are untouched. Read each section in isolation and apply only what it specifies.

---

## AGENT 1: RCM — Provider

**Two changes only.**

### Change 1A: Denial reduction constant

In `roi-config.ts`, find `RCM_PROVIDER_AGENT` and update `denialReduction`:

```ts
// BEFORE
denialReduction: { value: 0.35, label: "Fewer denials with pre-submission AI review", source: "Quickflows (poster: 35% fewer denials)" },

// AFTER
denialReduction: { value: 0.45, label: "Fewer denials with pre-submission AI review", source: "Quickflows RCM Provider" },
```

Update the label in the "What Quickflows does" block and "How this is calculated" disclosure to read "45% fewer denials" everywhere it currently says 35%.

### Change 1B: Default input values

In the `rcm-provider` product fields, update the defaults:

```ts
// BEFORE
{ key: "claimsPerYear",    default: 200000 }
{ key: "avgReimbursement", default: 300 }

// AFTER
{ key: "claimsPerYear",    default: 80000 }
{ key: "avgReimbursement", default: 500 }
```

### Acceptance test after these two changes

Defaults: 80,000 claims, $500 avg payment.
- Annual revenue (derived, read-only): **$40,000,000**
- Denials per year: 9,440 (80,000 × 11.8%)
- Prevented (45%): 4,248
- Revenue recovered: 4,248 × 65% × $500 = **$1,380,600**
- Rework saved: 4,248 × 35% × $50 = **$74,340**
- **Total saved: $1,454,940/year**

---

## AGENT 2: AI Eligibility Verification

**One change only — default input values.**

In the `eligibility` product fields, update the four defaults:

```ts
// BEFORE
{ key: "appointmentsPerMonth", default: 2000  }
{ key: "manualMinutes",        default: 12.64 }
{ key: "staffHourly",          default: 21    }
{ key: "avgReimbursement",     default: 150   }

// AFTER
{ key: "appointmentsPerMonth", default: 10000 }
{ key: "manualMinutes",        default: 20    }
{ key: "staffHourly",          default: 21    }
{ key: "avgReimbursement",     default: 2000  }
```

No formula changes. No constant changes. Defaults only.

### Acceptance test after this change

Defaults: 10,000 visits/mo, 20 min, $21/hr, $2,000/visit.
- Manual labor: (10,000 × 20/60) × $21 = **$70,000/mo**
- Labor saved (65%): **$45,500/mo**
- Eligibility denials: 10,000 × 11.8% × 24% = 283.2/mo
- Revenue lost manually: 283.2 × 65% × $2,000 = **$368,160/mo**
- Revenue protected (45%): **$165,672/mo**
- **Total saved: $211,172/mo**

---

## AGENT 3: ProviderCred — Comprehensive rework

**Most changes. Read every sub-section.**

### What is being removed

Remove entirely:
- The three fields: `newBillingProviders`, `onboardingDays`, `billingPerDay`
- The `cashFreed` line from `compute()`
- The `separate.cashFreed` block from `comparison()`
- The "Onboarding Speed" input group from the UI
- The "Revenue captured earlier" line from the UI output
- The "75% more roster capacity" chip from the "What Quickflows does" block
- The old `verificationTimeReduction` (70%) and the old `onboardingSpeedup` (70%)
- The display of 85% "less manual work" as a separate featured stat

### 3A: New constant block (replaces the old `PROVIDERCRED_AGENT`)

```ts
export const PROVIDERCRED_AGENT = {
  // Drives new credentialing labor calculation
  credentialingTimeReduction: {
    value: 0.90,
    label: "Manual credentialing time eliminated",
    source: "Quickflows ProviderCred"
  },
  // Drives recredentialing labor calculation
  recredentialingTimeReduction: {
    value: 0.95,
    label: "Recredentialing time eliminated",
    source: "Quickflows ProviderCred"
  },
  // Compliance risk — separate line, never in total (unchanged)
  riskAvoidedPerYear: {
    value: 2000000,
    label: "Average compliance exposure eliminated per year",
    source: "Quickflows ProviderCred ($2M+ risk avoided)"
  },
  // Reinforcing facts — display only, never monetized
  complianceExposure:   { value: 0.80, label: "Less undetected compliance exposure",     source: "Quickflows ProviderCred (80%)", displayOnly: true },
  recredentialingFact:  { value: 0.90, label: "Faster recredentialing cycles",           source: "Quickflows ProviderCred (90%)", displayOnly: true },
  alertPrecision:       { value: 0.92, label: "Improvement in alert match accuracy",     source: "Quickflows ProviderCred (92%)", displayOnly: true },
  auditReady:           { value: 1.00, label: "Compliance reports generated on demand",  source: "Quickflows ProviderCred (100%)", displayOnly: true },
  // Roster capacity removed — do not include
} as const;
```

### 3B: New field list (replaces the old `providercred` fields array)

Two calculation groups plus one shared rate. Time inputs are in minutes.

```ts
fields: [
  // GROUP 1: New credentialing
  { key: "newCredentialsPerYear",     label: "New providers credentialed per year",     type: "number",   tier: "core", group: "credentialing",     default: 15000, min: 10,  step: 100, unit: "providers/yr" },
  { key: "minutesPerCredential",      label: "Time to verify one new provider manually", type: "number",  tier: "core", group: "credentialing",     default: 30,    min: 1,   max: 480,  step: 1,   unit: "min", hint: "Your team's real number" },

  // GROUP 2: Recredentialing
  { key: "recredentialsPerYear",      label: "Providers recredentialed per year",        type: "number",  tier: "core", group: "recredentialing",   default: 40000, min: 10,  step: 100, unit: "providers/yr" },
  { key: "minutesPerRecredential",    label: "Time to recredential one provider manually", type: "number", tier: "core", group: "recredentialing",  default: 6,     min: 1,   max: 120,  step: 1,   unit: "min", hint: "Your team's real number" },

  // Shared across both groups
  { key: "staffHourly",               label: "Credentialing staff cost per hour",         type: "currency", tier: "core", group: "shared",          default: 35,    min: 15,  step: 1,   unit: "$/hr" },
],
```

### 3C: New compute function

```ts
compute: (v: Record<string, number>) => {
  const A = PROVIDERCRED_AGENT;

  const credentialingManual = v.newCredentialsPerYear * (v.minutesPerCredential / 60) * v.staffHourly;
  const credentialingSaved  = credentialingManual * A.credentialingTimeReduction.value;

  const recredentialingManual = v.recredentialsPerYear * (v.minutesPerRecredential / 60) * v.staffHourly;
  const recredentialingSaved  = recredentialingManual * A.recredentialingTimeReduction.value;

  return [
    { category: "timeSaved",   label: "New credentialing time saved (annual)",    amount: credentialingSaved,   sourceKeys: ["credentialingTimeReduction"] },
    { category: "timeSaved",   label: "Recredentialing time saved (annual)",      amount: recredentialingSaved, sourceKeys: ["recredentialingTimeReduction"] },
    { category: "riskAvoided", label: "Compliance exposure avoided (annual)",     amount: A.riskAvoidedPerYear.value, sourceKeys: ["riskAvoidedPerYear"], note: "Separate line, never in the total" },
  ];
},
```

### 3D: New comparison function

```ts
comparison: (v: Record<string, number>) => {
  const A = PROVIDERCRED_AGENT;

  const credManual = v.newCredentialsPerYear * (v.minutesPerCredential / 60) * v.staffHourly;
  const credQf     = credManual * (1 - A.credentialingTimeReduction.value);

  const recredManual = v.recredentialsPerYear * (v.minutesPerRecredential / 60) * v.staffHourly;
  const recredQf     = recredManual * (1 - A.recredentialingTimeReduction.value);

  return {
    period: "annual",
    rows: [
      { label: "New credentialing labor",  manual: credManual,  automated: credQf,  saved: credManual - credQf,  group: "Credentialing" },
      { label: "Recredentialing labor",    manual: recredManual, automated: recredQf, saved: recredManual - recredQf, group: "Recredentialing" },
    ],
    totalManual:    credManual + recredManual,
    totalAutomated: credQf + recredQf,
    totalSaved:     (credManual - credQf) + (recredManual - recredQf),
    separate: {
      riskAvoided: A.riskAvoidedPerYear.value,
      label: "Compliance exposure avoided",
      note: "Kept separate, never in the total above.",
      source: A.riskAvoidedPerYear.source,
    },
    // cashFreed removed entirely
  };
},
```

### 3E: UI changes for ProviderCred

**Left column — two input groups:**

Group 1, labeled "New credentialing":
- New providers credentialed per year
- Time to verify one new provider manually (minutes)

Group 2, labeled "Recredentialing":
- Providers recredentialed per year
- Time to recredential one provider manually (minutes)

Shared field beneath both groups:
- Credentialing staff cost per hour

Remove entirely: the old "Onboarding Speed" group (new billing providers, days to onboard, revenue per day).

**Right column — comparison table:**

| Per year | Doing it manually | With Quickflows | You save |
|---|---|---|---|
| *Credentialing* | | | |
| New credentialing labor | `rows[0].manual` | `rows[0].automated` | `rows[0].saved` |
| *Recredentialing* | | | |
| Recredentialing labor | `rows[1].manual` | `rows[1].automated` | `rows[1].saved` |
| **Total per year** | `totalManual` | `totalAutomated` | **`totalSaved`** |

Below the table, one separate block:
- "Compliance exposure avoided: $2M+ / yr — Kept separate, never in the total above."

Remove entirely: the "Revenue captured earlier" line.

**"What Quickflows does" block:**

One featured stat (the primary driver):
- "90% of manual credentialing work eliminated"

Two calculation stats (shown as secondary, since they drive the math):
- "95% of recredentialing time eliminated"

Reinforcing facts (display only):
- "80% less compliance exposure"
- "90% faster recredentialing cycles"
- "92% alert precision"
- "100% audit-ready reporting"

Remove: "75% more roster capacity" — do not show anywhere.

### Acceptance test after all ProviderCred changes

Defaults: 15,000 new credentials/yr, 30 min each, 40,000 recredentials/yr, 6 min each, $35/hr.

- Credentialing manual annual: 15,000 × (30/60) × $35 = **$262,500**
- Credentialing saved (90%): **$236,250**
- Recredentialing manual annual: 40,000 × (6/60) × $35 = **$140,000**
- Recredentialing saved (95%): **$133,000**
- **Total labor saved: $369,250/year**
- Compliance risk (separate): **$2,000,000+ / year**

Headline: "You save about $369,250 every year."
Below: "Compliance exposure avoided: $2M+ / yr — kept separate."

---

## AGENT 4: Referral Management

**Two changes only.**

### Change 4A: Default input values

```ts
// BEFORE
{ key: "referralsPerMonth",  default: 400 }
{ key: "manualMinutes",      default: 25  }
{ key: "coordinatorHourly",  default: 25  }

// AFTER
{ key: "referralsPerMonth",  default: 1500 }
{ key: "manualMinutes",      default: 25   }
{ key: "coordinatorHourly",  default: 40   }
```

### Change 4B: Copy and framing for the 80% constant

Update everywhere the 80% coordinator reduction is described, across the agent intro, the comparison headline context, and the "What Quickflows does" block:

```
// BEFORE (any of these phrasings)
"80% less manual coordinator work"
"Less manual coordinator work"

// AFTER
"80% of manual referral coordination time eliminated"
```

The "What Quickflows does" featured stat should read:
- **"80% of manual referral coordination time eliminated"**

The agent intro copy:
- "Your coordinators spend significant time on every referral — capturing, validating, matching, chasing authorizations, and closing the loop. Here is what that costs today, and how much of it the agent handles."

No formula changes. No constant changes. Defaults and copy only.

### Acceptance test after these changes

Defaults: 1,500 referrals/mo, 25 min each, $40/hr.
- Manual labor: (1,500 × 25/60) × $40 = **$25,000/mo**
- With Quickflows (20% remains): **$5,000/mo**
- Labor saved (80%): **$20,000/mo**
- Annual equivalent: **$240,000/yr**

Headline: "You save about $20,000 every month."

---

## Summary of what changes and what stays the same

| Agent | What changes | What stays the same |
|---|---|---|
| RCM Provider | Denial reduction 35% → 45%; defaults (80K claims, $500) | All formulas, all UI structure, all other constants |
| Eligibility | 4 default values only | All formulas, all constants, all UI structure |
| ProviderCred | New constants, new fields, new two-part compute, remove onboarding/cashFreed/roster | Risk line ($2M+), side-by-side layout, compliance exposure, reinforcing facts (minus roster) |
| Referral | 2 default values + copy reframe of 80% | All formulas, all constants, all UI structure |
| RCM Payer | Nothing | Everything |
| Scheduler | Nothing | Everything |
| Design / nav / shell | Nothing | Everything |

Apply each agent section in isolation. Verify the acceptance test for that agent before moving to the next.
