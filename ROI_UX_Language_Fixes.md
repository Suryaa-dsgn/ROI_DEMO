# Fix: Remove Org Picker + Clean All Client-Facing Language (Claude Code)

**What this covers:** two non-functional changes only.
1. Remove the org-type picker. CTA goes directly to the Provider / Hospital calculator.
2. Fix all internal/meta language across the UI so the site reads as a professional client-facing product.

**What does not change:** all formulas, all constants, all calculations, all layouts, the floating nav, the method section, the sources section, the footer. Touch nothing except what is listed here.

---

## CHANGE 1: Remove org-type picker, go directly to calculator

### What to do

In `page.tsx` (or wherever `View` state and the `segment` state live):

- Set `segment` as a constant: `const segment: Segment = "provider"` — not state, not switchable.
- Remove the `OrgTypePicker` / `org-type-picker.tsx` component. Delete the file.
- In `view-calculator.tsx`, remove sub-step 1 (the org-type question) entirely. The calculator now starts directly at the workspace (what was sub-step 2).
- The CTA button on the landing view navigates to `view = "calculator"` which now renders the workspace immediately, with the provider segment always active.
- Remove the `segment-switcher.tsx` component. There is only one segment, no switcher is needed.
- `PRODUCTS` filtering still runs: only products where `segments.includes("provider")` are shown. This hides RCM Payer automatically since it is `["payer"]` only. No other product is affected.

### What stays the same

- Floating nav appears on calculator, method, and sources views.
- Logo returns to landing.
- All product tabs, workspace layout, comparison tables, result panels — unchanged.
- The `segment` value "provider" flows through all existing filtering logic exactly as before — just hardcoded instead of chosen.

### File changes

| File | Action |
|---|---|
| `page.tsx` | Replace `const [segment, setSegment] = useState<Segment>(...)` with `const segment: Segment = "provider"`. Remove any segment setter calls. |
| `view-calculator.tsx` | Remove the org-type step. Render the workspace directly. Remove any conditional that gated on segment selection. |
| `components/org-type-picker.tsx` | Delete entirely. |
| `components/segment-switcher.tsx` | Delete entirely. |

---

## CHANGE 2: Fix all client-facing language

The site is used by clients and the sales team together. Any language that reads like internal notes, references to source materials by name, or sounds like it was written for one person must be updated.

Apply every find-and-replace below exactly as written. These are UI strings — in JSX copy, tooltip text, label strings, note text, and caption text. Do not touch the `source` field inside constant objects in `roi-config.ts` (those are internal config, never rendered directly to users). Only change what renders visibly in the browser.

---

### "What Quickflows does" captions

These captions appear below the reinforcing fact chips in every agent.

| Find (any variant of) | Replace with |
|---|---|
| "Reinforcing outcomes from the poster. Not added to the savings total." | "Additional performance outcomes. Not added to the savings total." |
| "Reinforcing outcomes. Shown to support the story, intentionally not added to the savings total, so the number stays defensible." | "Additional performance outcomes. Not added to the savings total." |
| "All figures from Quickflows Scheduler. Not adjustable." | "Quickflows performance figures. Not adjustable." |
| "Quickflows performance figures. Fixed, not adjustable." | "Quickflows performance figures. Not adjustable." |
| "All figures from Quickflows ProviderCred." | "Quickflows performance figures. Not adjustable." |
| "Reinforcing outcomes from the poster." | "Additional performance outcomes." |

---

### "How this is calculated" disclosure text

These strings appear inside the expandable disclosure section in each agent.

| Find (any variant of) | Replace with |
|---|---|
| "performance figures are from the ProviderCred poster" | "performance figures are from Quickflows ProviderCred" |
| "performance figures (80%, 40%) are from the Referral Management poster" | "performance figures are from Quickflows Referral Management" |
| "figures are from the Quickflows Scheduler poster" | "figures are from Quickflows Scheduler" |
| "from the poster" (anywhere in disclosure) | "from Quickflows" |
| "poster claims" | "Quickflows performance data" |
| "per agreed approach" | (delete this phrase entirely) |
| "per our agreed approach" | (delete this phrase entirely) |
| "Shown as a fact. No dollar figure added, per agreed approach." | "Shown as a performance indicator. No dollar figure is applied." |
| "No dollar figure is applied, because the value of a kept referral varies by contract." | "The value of a kept referral varies by contract, so no dollar figure is applied." |

---

### Separate-line labels and notes (the lines below comparison tables)

| Find (any variant of) | Replace with |
|---|---|
| "Compliance exposure avoided (poster average, kept separate)" | "Compliance exposure avoided" |
| "poster average. Kept separate, never in the total." | "Kept separate, never in the total." |
| "Shown separately, not added to the total above." | "Shown separately. Not included in the total above." |
| "Timing, not new money. Separate line." | "This is revenue arriving sooner, not new money. Not included in the total above." |
| "Reference figure, not summed" | "Shown for reference. Not included in the total above." |
| "Never in the total." | "Not included in the total above." |

---

### Input field hint text

These are the small helper texts under input fields.

| Find (any variant of) | Replace with |
|---|---|
| "Your team's real number. Placeholder, not a poster figure." | "Enter your organization's actual number." |
| "Your team's real number, not a poster figure." | "Enter your organization's actual number." |
| "Your own average; used for the money-lost line" | "Your organization's average payment per visit." |
| "Placeholder, not a poster figure." | (delete — just remove the hint entirely for those fields) |
| "RN benchmark; use your role-specific cost for aides" | "Default is the industry benchmark for RNs. Adjust to your role." |

---

### Agent intro / blurb text

| Find | Replace with |
|---|---|
| "Here is what that costs, and what the agent saves." | "Here is what that costs today, and what Quickflows saves." |
| "Here is what they cost today, and what the agent prevents and recovers." | "Here is what denials cost today, and what Quickflows prevents and recovers." |
| "Here is what manual credentialing costs your team today, and what the agent saves." | "Here is what manual credentialing costs today, and what Quickflows saves." |
| "Here is what manual coordination costs your team today, and what the agent saves." | "Here is what manual referral coordination costs today, and what Quickflows saves." |
| "Here is what reactive scheduling costs your operation each year, and what the agent saves." | "Here is what reactive scheduling costs each year, and what Quickflows saves." |
| "what the agent saves" | "what Quickflows saves" |
| "what the agent prevents" | "what Quickflows prevents" |

---

### Referral leakage fact block

| Find | Replace with |
|---|---|
| "Shown as a performance indicator. No dollar figure is applied. (source pending)" | "No dollar figure is applied. The value of a kept referral varies by network and contract." |
| "Shown as a capability fact." | (delete this sentence) |
| "Not expressed as a dollar figure, because the value of a kept referral varies by contract. Shown as a capability fact." | "The value of a kept referral varies by network and contract, so no specific dollar amount is shown." |

---

### Footer disclaimer

| Find | Replace with |
|---|---|
| "illustrative improvement rates" | "improvement rates based on Quickflows performance data" |
| "Improvement rates shown are placeholders pending Quickflows deployment data." | (delete this sentence from the footer) |
| "Conservative estimates from published benchmarks and illustrative improvement rates. Actual results vary." | "Estimates are based on published industry benchmarks and Quickflows performance data. Actual results vary." |

---

### Any remaining instances of these words in visible UI text

Do a global search across all JSX/TSX files for each of the following. If found in a rendered string (not a code comment or config value), apply the substitution shown.

| Word / phrase to find | What to do |
|---|---|
| "poster" | Replace with "Quickflows" or remove entirely depending on context |
| "marketing material" | Remove entirely |
| "our marketing claim" | Replace with "Quickflows performance data" |
| "per agreed" | Remove entirely |
| "held below our marketing claim" | Replace with "based on Quickflows performance data" |
| "Benchmark overrides and improvement rates. Rates marked Assumption are our estimate, held below our marketing claim." | Replace with "Adjust the inputs below to match your organization's situation." |

---

## What does not change

- All `source` fields inside constant objects in `roi-config.ts` — these are internal config, not rendered UI.
- All formula logic, compute functions, comparison functions.
- All layout, styling, animations, floating nav.
- Method section and sources section content (those are factual, not meta-language).
- Any code comments.

---

## How to apply this

1. Delete `org-type-picker.tsx` and `segment-switcher.tsx`. Hard-code segment to `"provider"`. Verify the calculator loads directly on CTA click.
2. Run a global search in the project for each "Find" string above and apply the replacement. Work through the table sections in order: captions → disclosures → separate-line notes → hints → intros → footer.
3. After each agent, read through the visible UI once as if you were a client seeing it for the first time. Any sentence that sounds like a note written to an internal reader should be flagged and simplified.
4. Do not change anything that is not in this list.
