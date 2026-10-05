

# NEXT - Home / Operational Dashboard

This is the first **actual application page inside the shell**.

The source calls it **Screen 02 - Executive Dashboard (`LabDashboard.tsx`)** and specifies four KPI cards, a recent verification sessions table, a compliance donut chart, and four one-click synthetic preset cards. `Pasted markdown(20261004-065148).md`

I would make one important UX adjustment from the original wording: despite being called “Executive Dashboard,” it should visually behave as an **operational laboratory home screen**, not a corporate analytics dashboard.

---

## 1. What the page must communicate in 5 seconds

When the user opens Home, they should immediately understand:

```text
WHERE AM I?
→ Laboratory Home

WHAT IS HAPPENING?
→ 12 active verification sessions

WHAT NEEDS ATTENTION?
→ 3 waiting for Director sign-off

IS THE LAB READY?
→ Traceability valid

WHAT SHOULD I DO NEXT?
→ Resume / review a session or start a new instrument
```

No giant charts, no unnecessary analytics, no dense paragraphs.

---

# 2. Overall layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                       │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ SIDEBAR       │ Home                                                        │
│               │ Laboratory Operations                                       │
│ WORK          │                                                              │
│ ● Home        │ [12 Active] [3 Sign-Off] [94.2% Pass] [100% Traceability] │
│   Sessions    │                                                              │
│   Instruments │                                                              │
│               │                                                              │
│ ASSURANCE     │ ┌──────────────────────────────┐ ┌────────────────────────┐ │
│   Review      │ │ Recent Verification          │ │ Compliance Overview    │ │
│   Standards   │ │ Sessions                     │ │                        │ │
│   Audit       │ │                              │ │       ◔ 94.2%          │ │
│               │ │ AV-2026-8812   IN TEST       │ │                        │ │
│ OUTPUT        │ │ MT-2026-1042   REVIEW        │ │ PASS   21              │ │
│   Reports     │ │ ...                          │ │ FAIL    2              │ │
│               │ │                              │ │ WARN    1              │ │
│ SYSTEM        │ │ [View all sessions]          │ │                        │ │
│   Settings    │ └──────────────────────────────┘ └────────────────────────┘ │
│               │                                                              │
│               │ Quick Start                                                  │
│               │                                                              │
│               │ [Avery III] [Mettler I] [Sansui II] [Essae IIII]            │
│               │                                                              │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

---

# 3. Page header

At the top of the content area:

```text
Home

Laboratory Operations
Monitor verification activity, review pending work,
and start a new test session.
```

But keep the supporting text very small.

Right side:

```text
[ + Register New Instrument ]
```

This is the main action.

---

# 4. Top KPI row

Exactly four `MetricCard` components as specified by the source. `Pasted markdown(20261004-065148).md`

### Card 1 - Active Verifications

```text
ACTIVE VERIFICATIONS

12
sessions

● 8 currently testing
```

Primary number:

```text
12
```

Supporting context:

```text
8 currently testing
4 paused
```

---

### Card 2 - Pending Director Sign-Off

```text
PENDING SIGN-OFF

3
sessions

2 due today
```

This card should be clickable and navigate to Review.

---

### Card 3 - 24h Pass Rate

```text
24H PASS RATE

94.2%

21 of 23 sessions

↑ 2.1% vs previous 24h
```

Do not over-emphasize the trend. The actual operational metric is the pass rate.

---

### Card 4 - Traceability

```text
TRACEABILITY

100%

VALID

All active standard sets valid
```

This card should be green when everything is valid.

When there is a problem:

```text
TRACEABILITY

87%

ATTENTION

1 standard set expires today
```

And when expired:

```text
TRACEABILITY

LOCKED

Testing blocked
```

That connects directly to the global traceability lockout behavior defined in the source. `Pasted markdown(20261004-065148).md`

---

# 5. Recent Verification Sessions

This is the most important area of the dashboard.

### Card header

```text
Recent Verification Sessions

Latest laboratory activity

                                    [View all →]
```

### Table

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Instrument       Class    Test Stage       Progress   Status   Action │
├───────────────────────────────────────────────────────────────────────┤
│ AV-2026-8812     III      Weighing         3 / 7      ACTIVE   Resume │
│ MT-2026-1042     I        Review           7 / 7      REVIEW   Review │
│ SN-2026-7721     II       Repeatability    5 / 7      ACTIVE   Resume │
│ ES-2026-4418     IIII     Sign-off         7 / 7      PENDING  Open   │
│ AV-2026-7720     III      Inspection      2 / 7      ACTIVE   Resume │
└───────────────────────────────────────────────────────────────────────┘
```

The source specifies the recent sessions table with status pills and a one-click review shortcut. `Pasted markdown(20261004-065148).md`

---

# 6. Table row anatomy

Each row should make the instrument recognizable without forcing the user to read everything.

Example:

```text
AV-2026-8812
Avery ZM201
```

Then:

```text
Class III
```

using `StatusPill`.

Then:

```text
Weighing Error
```

Then:

```text
3 / 7
```

with a tiny progress bar.

Then:

```text
● IN TEST
```

Then the action:

```text
Resume →
```

---

# 7. Status hierarchy

Use the already-established status language:

```text
ACTIVE
PENDING REVIEW
REMANDED
APPROVED
PAUSED
BLOCKED
```

Don't create five different visual styles for every situation.

One badge system should handle this globally.

---

# 8. Compliance Overview

On the right side of the dashboard:

```text
┌───────────────────────────────┐
│ Compliance Overview            │
│ Last 24 hours                  │
│                                │
│              ╭──────╮         │
│           ╭──│94.2% │──╮      │
│          ╱   ╰──────╯   ╲     │
│                                │
│  ● PASS       21               │
│  ● FAIL        2               │
│  ● WARNING     1               │
│                                │
│ Total verified: 24             │
└───────────────────────────────┘
```

The source specifically requires an SVG compliance donut showing Pass / Fail / Warning. `Pasted markdown(20261004-065148).md`

### Important UI rule

The donut should **not** become a decorative pie chart.

Hovering a segment should reveal:

```text
PASS
21 sessions
87.5% of completed tests
```

Clicking it can filter the session list.

---

# 9. Quick Start / Synthetic Scenarios

This is where the dashboard becomes extremely useful for your hackathon demo.

The source specifies four one-click synthetic preset cards. `Pasted markdown(20261004-065148).md`

### Section

```text
Quick Start

Load a realistic instrument scenario and begin testing instantly.
```

Cards:

### Avery Class III

```text
AVERy
Class III Retail

30 kg capacity
e = 5 g

[ Start Scenario → ]
```

### Mettler Class I

```text
METTLER
Class I Laboratory

120 g capacity
e = 1 mg

[ Start Scenario → ]
```

### Sansui Class II

```text
SANSUI
Class II Gold Balance

6000 g capacity
e = 0.1 g

[ Start Scenario → ]
```

### Essae Class IIII

```text
ESSAE
Class IIII Industrial

150 kg capacity
e = 50 g

[ Start Scenario → ]
```

These should feel like **scenario launchers**, not marketing cards.

---

# 10. Hover behavior

A card should subtly lift:

```text
normal:
border + very small shadow

hover:
border becomes blue
shadow slightly increases
arrow becomes visible
```

No excessive animation.

---

# 11. Starting a scenario

Click:

```text
Start Scenario →
```

Then:

```text
Loading synthetic instrument...
```

After loading:

```text
✓ Instrument loaded

Avery ZM201
AV-2026-8812
Class III · 30 kg

[ Begin Preflight → ]
```

Toast:

```text
✓ Demo instrument loaded
AV-2026-8812 is ready for preflight.
```

The source specifically calls for one-click synthetic presets so users can begin without manually entering a long instrument form. `Pasted markdown(20261004-065148).md`

---

# 12. Empty state

Suppose the laboratory has no sessions.

Do **not** show:

```text
No data.
```

Instead:

```text
┌─────────────────────────────────────────────┐
│                                             │
│             [scale illustration]            │
│                                             │
│     No verification sessions yet            │
│                                             │
│     Register an instrument or load a        │
│     demonstration scenario to begin.       │
│                                             │
│     [ Register Instrument ]                 │
│     [ Load Demo Scenario ]                  │
│                                             │
└─────────────────────────────────────────────┘
```

The source specifically requires informative empty states with an actionable primary button rather than blank tables. `Pasted markdown(20261004-065148).md`

---

# 13. Loading state

While dashboard data loads:

```text
[████████████]   [████████]   [████████]   [████████]
```

Table rows use skeleton placeholders.

No giant spinner in the middle of the application.

---

# 14. Traceability warning state

If a standard expires:

```text
┌──────────────────────────────────────────────────────────────┐
│ ⚠ Traceability attention required                            │
│                                                               │
│ Weight Set E2-014 expires today.                              │
│                                                               │
│ [Review Standards →]                                         │
└──────────────────────────────────────────────────────────────┘
```

If already expired:

```text
┌──────────────────────────────────────────────────────────────┐
│ 🔒 TESTING LOCKED                                            │
│                                                               │
│ An expired standard weight set is currently assigned to      │
│ active verification work.                                    │
│                                                               │
│ Testing input has been disabled.                             │
│                                                               │
│ [Resolve Traceability →]                                     │
└──────────────────────────────────────────────────────────────┘
```

---

# 15. Role-specific Home

The same dashboard should adapt based on role.

### Metrologist

Main CTA:

```text
+ Register New Instrument
```

and:

```text
Resume Testing →
```

### Reviewer

Prioritize:

```text
3 Pending Reviews
```

Main action:

```text
Review Queue →
```

### Director

Promote:

```text
3 Pending Sign-Off
```

Main action:

```text
Open Sign-Off Queue →
```

### Auditor

Promote:

```text
Audit Events
Certificates
```

and keep the workspace read-only.

This follows the source's role-based UI permission model. `Pasted markdown(20261004-065148).md`

---

# 16. Dashboard interaction map

```text
ACTIVE VERIFICATIONS
        ↓
Sessions

PENDING SIGN-OFF
        ↓
Review

TRACEABILITY
        ↓
Standards

SESSION ROW
        ↓
Instrument / Session

RESUME
        ↓
Current OIML test

PRESET
        ↓
New Test Session

DONUT SEGMENT
        ↓
Filtered Sessions
```

So the dashboard isn't just displaying information-it becomes the **launchpad for the workflow**.

---

# 17. Desktop spacing

Recommended:

```text
Header                  64px
Sidebar                 248px
Content top padding      24px
Page max-width        1440px

KPI gap                  16px
Section gap              24px
Card padding             20-24px
```

Keep the dashboard breathable.

---

# 18. What we should NOT put here

Do not put:

```text
❌ 30+ filters
❌ full instrument form
❌ OIML formulas
❌ raw SHA-256 hashes
❌ detailed test observations
❌ all 7 test procedures
❌ huge analytics charts
❌ Excel migration controls
❌ hardware terminal logs
```

Those belong in their specialized workspaces.

The dashboard's job is simply:

> **See the state of the laboratory → identify what needs attention → continue or start work.**

---

# 19. Final Home screen

The ideal first viewport should look conceptually like:

```text
Home                                      + Register New Instrument

Laboratory Operations
Today's verification activity

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐
│ ACTIVE     │ │ PENDING    │ │ 24H PASS   │ │ TRACEABILITY │
│            │ │ SIGN-OFF   │ │ RATE       │ │              │
│    12      │ │     3      │ │   94.2%    │ │    100%      │
│ sessions   │ │ sessions   │ │            │ │ VALID        │
└────────────┘ └────────────┘ └────────────┘ └──────────────┘

┌───────────────────────────────────┐ ┌──────────────────────────┐
│ Recent Verification Sessions     │ │ Compliance Overview      │
│                                   │ │                          │
│ AV-2026-8812   III   ACTIVE       │ │          ◯ 94.2%        │
│ MT-2026-1042   I     REVIEW       │ │                          │
│ SN-2026-7721   II    ACTIVE       │ │ PASS       21            │
│ ES-2026-4418   IIII  SIGN-OFF     │ │ FAIL        2            │
│                                   │ │ WARNING     1            │
│ View all →                        │ │                          │
└───────────────────────────────────┘ └──────────────────────────┘

Quick Start
Load a realistic scenario

┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────────┐
│ Avery III │ │ Mettler I │ │ Sansui II │ │ Essae IIII │
│ 30 kg     │ │ 120 g     │ │ 6000 g    │ │ 150 kg     │
│           │ │           │ │           │ │            │
│ Start →   │ │ Start →   │ │ Start →   │ │ Start →    │
└───────────┘ └───────────┘ └───────────┘ └────────────┘
```

**This is the Home page we should actually implement from the shell.**

### Next

After Home, the next screen is **Sessions / Active Verification Workspace** - the work queue where the user sees every ongoing verification session and resumes the exact OIML step they are on. The source defines it as a responsive session-card workspace with progress rings and `Resume Testing →`. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:19:35 PM

next

## Response:
10/4/2026, 6:19:40 PM · gpt-5-6-t-mini

# NEXT - Sessions / Active Verification Workspace

This is the **work queue of METROLOGIX-76**.

The Home page tells the user *what is happening*.  
The Sessions page answers:

> **“Which verification session should I work on right now?”**

The source defines this as **Screen 10 - Active Tests Workspace (`ActiveTestsWorkspace.tsx`)**, with a responsive grid of active session cards containing serial/model, accuracy class, test progress, status, and `Resume Testing →`. `Pasted markdown(20261004-065148).md`

---

# 1. Page goal

The screen should immediately show:

```text
WHAT AM I LOOKING AT?
→ All verification sessions

WHICH ONE NEEDS ME?
→ Sessions needing attention

WHERE IS EACH SESSION?
→ Current test + progress

WHAT CAN I DO?
→ Resume / Open / Review
```

This should feel like a **laboratory work queue**, not a generic CRM table.

---

# 2. Overall page structure

```text id="6jzqfa"
Sessions                                      + New Verification

Verification Work Queue
All instrument verification sessions

[ All 12 ] [ In Testing 8 ] [ Needs Attention 2 ]
[ Pending Review 3 ] [ Approved 6 ] [ Remanded 1 ]

[ Search serial, model, certificate... ]   [ Status ▾ ] [ Class ▾ ]

┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ AV-2026-8812       │ │ MT-2026-1042       │ │ SN-2026-7721       │
│ Avery ZM201        │ │ Mettler XPR        │ │ Sansui Gold        │
│ CLASS III          │ │ CLASS I            │ │ CLASS II           │
│                    │ │                    │ │                    │
│  ● IN TEST         │ │ ✓ REVIEW           │ │ ● IN TEST          │
│                    │ │                    │ │                    │
│      ◔ 3 / 7       │ │      ◔ 7 / 7       │ │      ◔ 5 / 7       │
│                    │ │                    │ │                    │
│ Weighing Error     │ │ Awaiting review    │ │ Repeatability      │
│                    │ │                    │ │                    │
│ [Resume Testing →] │ │ [Review →]         │ │ [Resume Testing →] │
└────────────────────┘ └────────────────────┘ └────────────────────┘
```

---

# 3. Page header

```text
Sessions

Verification Work Queue
Manage active, pending, remanded and completed verification sessions.

                               [ + New Verification ]
```

### Primary CTA

`+ New Verification`

Clicking it should offer:

```text
New Verification

[ Register New Instrument ]
[ Load Demo Instrument ]
```

This keeps the flow aligned with the instrument-registration workflow.

---

# 4. Status filter bar

The first interaction area should be extremely simple.

```text
[All] [In Testing] [Needs Attention] [Pending Review] [Approved] [Remanded]
```

Use segmented controls rather than six dropdowns.

Example:

```text id="2it53t"
┌────────┬──────────────┬──────────────────┬─────────────────┐
│ ALL 24 │ IN TEST 12   │ NEEDS ATTENTION 3│ PENDING REVIEW 4│
└────────┴──────────────┴──────────────────┴─────────────────┘
```

The number should be secondary, while the status remains the primary information.

---

# 5. Search

Search should be global across session identity:

```text
⌕  Search serial number, model or session ID
```

Examples it should find:

```text
AV-2026-8812
Avery ZM201
SES-2026-0041
Class III
```

Do not make the user open an advanced filter panel for basic searching.

---

# 6. Secondary filters

Right side:

```text
Status ▾
Accuracy Class ▾
Verification Stage ▾
Sort: Most Recently Updated ▾
```

Keep these compact.

---

# 7. Session Card

This is the core reusable object.

Every card follows one consistent anatomy.

```text id="0rt8dg"
┌──────────────────────────────────────────┐
│ AV-2026-8812                             │
│ Avery Weigh-Tronix ZM201                 │
│                                          │
│ [Class III]               ● IN TEST      │
│                                          │
│             ◔ 3 / 7                      │
│        verification steps                │
│                                          │
│ CURRENT TEST                             │
│ Weighing Error & Linearity               │
│                                          │
│ Last updated 4 min ago                   │
│                                          │
│ [ Resume Testing → ]                     │
└──────────────────────────────────────────┘
```

The source specifically calls for serial number, instrument model, accuracy class, circular progress ring and `Resume Testing →`. `Pasted markdown(20261004-065148).md`

---

# 8. Progress Ring

Example:

```text id="onm8nm"
       ╭─────╮
      ╱  3   ╲
     │   /7   │
      ╲       ╱
       ╰─────╯
```

Inside:

```text
3
/7
```

Below:

```text
tests complete
```

Don't show only a percentage.

`3 / 7` is more meaningful in this application.

---

# 9. Current test indication

Under progress:

```text
CURRENT STEP

03  Weighing Error
```

or:

```text
CURRENT STEP

05  Repeatability
```

A user should know immediately where they will land after pressing Resume.

---

# 10. Status-specific cards

## Active

```text id="z6v0kf"
● IN TEST

Current:
03 Weighing Error

[ Resume Testing → ]
```

---

## Needs Attention

This needs more visual priority.

```text id="ffq93q"
⚠ NEEDS ATTENTION

Reviewer flagged:
Observation #7

[ Open Issue → ]
```

This card should appear toward the top when filtered by attention.

---

## Pending Review

```text id="1zjn7j"
PENDING REVIEW

7 / 7 completed

Reviewer action required

[ Open Review → ]
```

---

## Remanded

```text id="6xg3li"
↩ REMANDED

Reason:
"Eccentricity observation requires re-check."

[ Resume Session → ]
```

---

## Approved

Approved sessions are quieter.

```text id="7tljms"
✓ APPROVED

Certificate:
CERT-2026-00192

🔒 Read only

[ View Certificate → ]
```

---

# 11. Card hierarchy

The most important information should visually appear in this order:

```text
1. Instrument identity
2. Status
3. Progress
4. Current test
5. Next action
```

Not:

```text
manufacturer
address
approval number
date
operator
certificate
temperature
humidity
...
```

Those belong inside the session.

---

# 12. Needs Attention strip

Above the cards, show a compact operational summary when required:

```text
┌─────────────────────────────────────────────────────────────────┐
│ ⚠ 2 sessions need attention                                    │
│                                                                  │
│ 1 reviewer flag · 1 expired prerequisite                         │
│                                                                  │
│ [ View Attention Items → ]                                      │
└─────────────────────────────────────────────────────────────────┘
```

This gives the operator a very fast starting point.

---

# 13. Sort behavior

Default:

```text
Most Recently Updated
```

Other options:

```text
Needs Attention First
Progress
Newest
Oldest
Instrument ID
```

When sorting by attention, cards with blockers move to the front.

---

# 14. Session card interactions

### Clicking card

Opens:

```text
Instrument Details & Test Session Overview
```

### Clicking Resume

Opens:

```text
Current OIML test
```

### Clicking status

Filters the workspace.

### Clicking class pill

Filters by accuracy class.

This creates a very fluid workflow.

---

# 15. Session quick preview

Hovering the card shouldn't trigger a giant popup.

Instead, an information icon:

```text id="4mrlxk"
ⓘ
```

opens a lightweight preview:

```text
Session Details

Serial
AV-2026-8812

Verification Stage
Initial Type Approval

Operator
Rahul Kumar

Started
02 Oct 2026, 10:42

Current test
Weighing Error

Last saved
18:04
```

More detailed information remains in the session overview.

---

# 16. Empty state

When there are genuinely no sessions:

```text id="27tjv5"
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   [ scale icon ]                    │
│                                                     │
│            No verification sessions                │
│                                                     │
│       Start a new instrument verification or        │
│       load a demonstration scenario.                │
│                                                     │
│       [ + New Verification ]                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

# 17. No search results

Different state:

```text id="jnl5z9"
No sessions match your search

Try a different serial number, model or session ID.

[ Clear Search ]
```

Don't treat this as the same thing as an empty laboratory.

---

# 18. Loading state

Instead of a spinner:

```text id="6uk57r"
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ ▬▬▬▬▬▬▬▬▬          │ │ ▬▬▬▬▬▬▬▬▬          │ │ ▬▬▬▬▬▬▬▬▬          │
│ ▬▬▬▬▬▬▬            │ │ ▬▬▬▬▬▬▬            │ │ ▬▬▬▬▬▬▬            │
│                    │ │                    │ │                    │
│      ◯             │ │      ◯             │ │      ◯             │
│                    │ │                    │ │                    │
└────────────────────┘ └────────────────────┘ └────────────────────┘
```

Skeleton cards preserve the page structure.

---

# 19. Traceability lockout

If the global standard-weight lockout is active, the Sessions page should still let users **see their sessions**, but testing actions change:

```text
┌────────────────────────────────────────────────────────────┐
│ 🔒 TESTING LOCKED                                          │
│ Standard weight set E2-014 has expired.                    │
│ Active test inputs are temporarily disabled.               │
│ [ Resolve Traceability → ]                                 │
└────────────────────────────────────────────────────────────┘
```

Cards then show:

```text
[ Resume Testing 🔒 ]
```

instead of allowing test input.

The source requires the traceability failure to disable testing input rather than merely displaying a warning. `Pasted markdown(20261004-065148).md`

---

# 20. Responsive grid

Desktop:

```text
3 cards / row
```

Large monitor:

```text
4 cards / row
```

Tablet:

```text
2 cards / row
```

Small screen:

```text
1 card / row
```

The cards should never become tiny.

---

# 21. Dummy dataset

For the first frontend build, we should populate it with realistic sessions:

```text
SES-2026-0041
AV-2026-8812
Avery ZM201
Class III
Step 3 / 7
ACTIVE

SES-2026-0042
MT-2026-1042
Mettler XPR 120
Class I
Step 7 / 7
PENDING REVIEW

SES-2026-0043
SN-2026-7721
Sansui Gold Balance
Class II
Step 5 / 7
ACTIVE

SES-2026-0044
ES-2026-4418
Essae Platform Pro
Class IIII
Step 7 / 7
APPROVED

SES-2026-0045
AV-2026-7720
Avery Retail
Class III
Step 2 / 7
REMANDED
```

This will let us test every important state before connecting the backend.

---

# 22. Main interaction flow

The core user journey becomes:

```text
HOME
  ↓
Sessions
  ↓
Select session
  ↓
Session Overview
  ↓
Resume current test
  ↓
OIML test workspace
```

And for review:

```text
SESSIONS
  ↓
Pending Review
  ↓
Review
  ↓
Director
  ↓
Certificate
```

This is exactly why Sessions needs to be a **work queue**, rather than just another database table.

---

# 23. Final screen

The finished visual composition should be approximately:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                      │
├───────────────┬─────────────────────────────────────────────────────────────┤
│               │ Sessions                          [+ New Verification]      │
│ WORK          │ Verification Work Queue                                     │
│ ● Home        │                                                             │
│ ● Sessions    │ [All] [In Testing] [Attention] [Review] [Approved]         │
│   Instruments │                                                             │
│               │ [ Search sessions... ]   [Class ▾] [Sort ▾]                │
│ ASSURANCE     │                                                             │
│   Review      │ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│   Standards   │ │ AV-8812    │ │ MT-1042    │ │ SN-7721    │                │
│   Audit       │ │ Class III  │ │ Class I    │ │ Class II   │                │
│               │ │ ● ACTIVE   │ │ ● REVIEW   │ │ ● ACTIVE   │                │
│ OUTPUT        │ │    3 / 7   │ │    7 / 7   │ │    5 / 7   │                │
│   Reports     │ │ Weighing   │ │ Review     │ │ Repeat.    │                │
│               │ │ [Resume →] │ │ [Review →] │ │ [Resume →] │                │
│ SYSTEM        │ └────────────┘ └────────────┘ └────────────┘                │
│   Settings    │                                                             │
│               │ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│               │ │ ES-4418    │ │ AV-7720    │ │ ...        │                │
│               │ │ APPROVED 🔒│ │ REMANDED   │ │            │                │
│               │ └────────────┘ └────────────┘ └────────────┘                │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

## Design principle for this page

**Don't make the operator hunt.**

The card should answer in a glance:

> **What instrument? → What status? → How far? → Which test? → What button?**

That is the right mental model for the Sessions workspace and is directly aligned with the source's active-session card architecture. `Pasted markdown(20261004-065148).md`

### Next screen

**Instrument Registration / Intake** - the first real data-entry workspace, including the four synthetic presets, OCR/nameplate area, instrument identification, metrological specifications, live specification validation, photo dossier, and registration action. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:20:11 PM

next

## Response:
10/4/2026, 6:20:17 PM · gpt-5-6-t-mini

# NEXT - Instrument Registration / Intake

Now we move to the **first real data-entry workspace**.

This page is where a physical weighing instrument enters the METROLOGIX-76 system and becomes a **Test Session**.

The source defines Screen 03 as `InstrumentIntakeForm.tsx` with four modular cards, four one-click presets, OCR/nameplate capture, metrological specification validation, five-photo statutory dossier, and the final registration action. `Pasted markdown(20261004-065148).md`

The key design rule here is:

> **Do not make this look like a 30-field government form.**

The source explicitly says forms should be broken into clean cards with no more than roughly 4-6 fields per card. `Pasted markdown(20261004-065148).md`

---

# 1. What this page must communicate in 5 seconds

The operator should immediately understand:

```text
WHAT AM I DOING?
→ Registering a weighing instrument

WHAT INFORMATION DO I NEED?
→ Identity + metrological specifications + evidence

IS THE INSTRUMENT VALID?
→ Live specification check

WHAT IS STILL MISSING?
→ Photos / required fields / validation issue

WHAT HAPPENS NEXT?
→ Register → Preflight → Testing
```

---

# 2. Overall page structure

```text id="w4sv4k"
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                      │
├───────────────┬─────────────────────────────────────────────────────────────┤
│ Sidebar       │ Instruments / New Registration                              │
│               │                                                             │
│               │ Register New Instrument                     [Save Draft]   │
│               │ Add the instrument details needed to begin verification.   │
│               │                                                             │
│               │ ┌────────────────────────────────────────────────────────┐  │
│               │ │ QUICK START                                            │  │
│               │ │                                                        │  │
│               │ │ [Avery III] [Mettler I] [Sansui II] [Essae IIII]      │  │
│               │ └────────────────────────────────────────────────────────┘  │
│               │                                                             │
│               │ ┌──────────────────────────┐ ┌──────────────────────────┐  │
│               │ │ 01 NAMEPLATE              │ │ 02 IDENTIFICATION        │  │
│               │ │ OCR / Upload              │ │ Manufacturer             │  │
│               │ │                            │ │ Model                     │  │
│               │ │                            │ │ Serial                    │  │
│               │ │                            │ │ Approval No.              │  │
│               │ └──────────────────────────┘ └──────────────────────────┘  │
│               │                                                             │
│               │ ┌────────────────────────────────────────────────────────┐  │
│               │ │ 03 METROLOGICAL SPECIFICATIONS                         │  │
│               │ │                                                        │  │
│               │ │ Accuracy Class   Max   Min   e   d   Unit             │  │
│               │ │                                                        │  │
│               │ │ ✓ Specification validation                             │  │
│               │ └────────────────────────────────────────────────────────┘  │
│               │                                                             │
│               │ ┌────────────────────────────────────────────────────────┐  │
│               │ │ 04 STATUTORY PHOTO DOSSIER                             │  │
│               │ │ [Nameplate] [Front] [Seal] [Level] [Documents]         │  │
│               │ └────────────────────────────────────────────────────────┘  │
│               │                                                             │
│               │                          [Register & Begin Testing →]       │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

---

# 3. Page header

Top:

```text id="4n9f3a"
Instruments / New Registration

Register New Instrument

Capture the instrument identity, specifications and supporting evidence
before starting verification.
```

Right side:

```text id="y0o6c0"
[ Save Draft ]
```

`Save Draft` is secondary.

The main action should remain the registration workflow.

---

# 4. Quick Start Preset Banner

This is one of the most important hackathon-demo features.

The source specifies these four one-click presets: Avery Class III, Mettler Class I, Sansui Class II and Essae Class IIII. `Pasted markdown(20261004-065148).md`

Design:

```text id="cq2c6n"
┌──────────────────────────────────────────────────────────────────────────┐
│ QUICK START                                                              │
│ Load a realistic instrument profile to see the complete workflow.       │
│                                                                          │
│ [ Avery Class III ] [ Mettler Class I ] [ Sansui Class II ]             │
│ [ Essae Class IIII ]                                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

Each preset is basically a **scenario launcher**.

When clicked:

```text id="fow2x8"
✓ Avery Class III loaded

Manufacturer
Avery Weigh-Tronix

Model
ZM201 Retail Platform

Serial
AV-2026-8812
```

and all supported fields populate.

---

# 5. Card 01 - Nameplate Scanner

This should be visually engaging but still professional.

The source calls for an **Optical Nameplate Scanner** with a drag-and-drop zone, OCR confidence, and `Apply OCR Data`. `Pasted markdown(20261004-065148).md`

### Initial state

```text id="1z8azv"
┌─────────────────────────────────────────────────────────┐
│ 01  NAMEPLATE SCANNER                                   │
│                                                         │
│             ┌──────────────────────────────┐            │
│             │                              │            │
│             │        ↑ Upload image        │            │
│             │                              │            │
│             │   Drag nameplate photo here  │            │
│             │   or click to browse         │            │
│             │                              │            │
│             └──────────────────────────────┘            │
│                                                         │
│ Supported: JPG, PNG                                    │
└─────────────────────────────────────────────────────────┘
```

---

# 6. OCR result state

After upload:

```text id="x9dybf"
┌─────────────────────────────────────────────────────────┐
│ NAMEPLATE SCANNER                                       │
│                                                         │
│ [ image preview ]       OCR Extraction                 │
│                         ██████████ 94.2% confidence     │
│                                                         │
│ Manufacturer     Avery Weigh-Tronix                     │
│ Model            ZM201                                  │
│ Serial           AV-2026-8812                           │
│ Max              30 kg                                  │
│                                                         │
│              [ Apply OCR Data ]                         │
└─────────────────────────────────────────────────────────┘
```

Do not automatically overwrite fields without confirmation.

---

# 7. OCR confidence

Use:

```text id="zcfyqy"
94.2%
High confidence
```

rather than:

```text id="1juj2z"
OCR score = 0.942
```

The user should understand it immediately.

---

# 8. Card 02 - Identification

This card contains only identity information.

```text id="g78q9d"
02
IDENTIFICATION

Manufacturer
[ Avery Weigh-Tronix                         ]

Model Name
[ ZM201 Retail Platform                     ]

Serial Number
[ AV-2026-8812                              ]

Type Approval Number
[ TAC-2026-III-0142                         ]
```

Four fields. Clean.

This follows the source's specified manufacturer, model, serial and approval-number fields. `Pasted markdown(20261004-065148).md`

---

# 9. Inline validation

Validation should happen while typing.

For example:

```text id="e0j2ng"
Serial Number
[ AV-2026-8812                        ]
✓ Serial number format accepted
```

Error:

```text id="s8o9wq"
Serial Number
[                                      ]
✕ Serial number required
```

The source explicitly specifies immediate red borders/helper text for invalid inputs. `Pasted markdown(20261004-065148).md`

---

# 10. Card 03 - Metrological Specifications

This is the most technical card, but it still needs to be understandable.

Header:

```text id="w9ox8j"
03
METROLOGICAL SPECIFICATIONS

Define how the instrument is legally evaluated.
```

---

# 11. Accuracy Class selector

Instead of a dropdown:

```text id="l4q9t3"
Accuracy Class

[ Class I ] [ Class II ] [ Class III ] [ Class IIII ]
```

Selected:

```text id="lqg3sp"
[ Class III ]
```

This is faster and easier to understand.

The source explicitly calls for segmented accuracy-class pills. `Pasted markdown(20261004-065148).md`

---

# 12. Capacity fields

Use friendly labels:

```text id="q2e08f"
Maximum Capacity
[ 30.000 ] kg

Minimum Capacity
[ 0.100 ] kg
```

Don't expose cryptic variables such as `Max` or `Min` as the visible labels.

---

# 13. Verification interval

```text id="xo8avv"
Verification Interval (e)
[ 0.005 ] kg

Scale Interval (d)
[ 0.005 ] kg
```

A small info icon can explain:

```text id="xby8pq"
ⓘ What is e?
The verification scale interval used for statutory evaluation.
```

That is progressive disclosure.

---

# 14. Unit

```text id="9txxzi"
Base Unit
[ kg ▾ ]
```

Keep it simple.

---

# 15. Live specification validator

This is one of the strongest pieces of the page.

Under the fields:

```text id="yl4m10"
┌──────────────────────────────────────────────────────────┐
│ SPECIFICATION VALIDATION                                 │
│                                                          │
│ Verification Scale Interval                              │
│ e = 0.005 kg                                             │
│                                                          │
│ Number of Verification Intervals                        │
│ n = Max / e = 30 / 0.005 = 6000                        │
│                                                          │
│ Statutory Range                                          │
│ ✓ Within expected limits                                 │
│                                                          │
│ Overall specification                                    │
│                 ✓ VALID                                  │
└──────────────────────────────────────────────────────────┘
```

The source specifically requires a **Live Table 3 Validator HUD** calculating `n = Max/e`, `n_min`, `n_max`, and statutory status. `Pasted markdown(20261004-065148).md`

---

# 16. Validator states

### Valid

```text id="8b0w2y"
✓ SPECIFICATION VALID
```

### Warning

```text id="r8f7mx"
⚠ CHECK SPECIFICATION
```

### Invalid

```text id="9h43cb"
✕ SPECIFICATION INVALID

Max capacity must be greater than Min capacity.
```

The invalid state should prevent final registration.

---

# 17. Calculation details

Don't show mathematical proof by default.

Give:

```text id="h4wz0k"
ⓘ How was this calculated?
```

Click → small modal:

```text id="23kmdd"
Calculation Proof

n = Max Capacity ÷ Verification Interval

n = 30 kg ÷ 0.005 kg
n = 6,000

[ Close ]
```

That follows the source's progressive-disclosure principle for calculation proofs. `Pasted markdown(20261004-065148).md`

---

# 18. Card 04 - Statutory Photo Dossier

This is not just a generic image uploader.

The source defines five specific evidence categories. `Pasted markdown(20261004-065148).md`

```text id="m8x0ru"
04
STATUTORY PHOTO DOSSIER

Capture the evidence required for verification.

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ NAMEPLATE  │ │ FRONT VIEW │ │ SEALING    │ │ LEVEL      │ │ DOC / SPEC │
│            │ │            │ │ POINT      │ │ BUBBLE     │ │            │
│   + Add    │ │   + Add    │ │   + Add    │ │   + Add    │ │   + Add    │
└────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
```

---

# 19. Photo uploaded state

```text id="uj76i4"
┌────────────┐
│ [PHOTO]    │
│            │
│ ✓ Captured │
│            │
│ View       │
└────────────┘
```

Clicking opens a photo-preview modal.

---

# 20. Missing evidence state

Don't turn everything bright red.

Instead:

```text id="h6h0wp"
3 / 5 evidence items captured
```

Then:

```text id="3vw8hl"
NAMEPLATE       ✓
FRONT VIEW      ✓
SEALING POINT   ✓
LEVEL BUBBLE    ○
DOC / SPEC      ○
```

This gives the operator immediate progress.

---

# 21. Bottom action bar

Sticky footer:

```text id="3jv7rj"
──────────────────────────────────────────────────────────────────────

4/4 information sections complete          Specification: ✓ VALID

[ Save Draft ]             [ Register Instrument & Begin Testing → ]
```

The primary button should remain visible.

---

# 22. Registration confirmation

When clicked:

```text id="7cqm4f"
┌───────────────────────────────────────────────────┐
│ Register Instrument?                              │
│                                                   │
│ Avery ZM201                                       │
│ AV-2026-8812                                      │
│ Class III · 30 kg                                 │
│                                                   │
│ ✓ Specifications valid                            │
│ ✓ Identity complete                               │
│ ✓ Required evidence captured                      │
│                                                   │
│ [ Cancel ] [ Register & Continue → ]              │
└───────────────────────────────────────────────────┘
```

---

# 23. Success transition

After registration:

```text id="mbkqyl"
✓ Instrument registered

Session SES-2026-0046 created.

Next:
Preflight Readiness
```

Then route to:

```text id="jsv9us"
Instrument Details / Test Session Overview
```

or directly to the preflight screen depending on the final navigation flow.

---

# 24. Error state

Suppose required information is missing:

```text id="m2jlxu"
Cannot register instrument yet

2 items need attention:

• Verification interval is invalid
• Level bubble photo is missing

[ Review Issues ]
```

Clicking an issue should jump directly to that card.

---

# 25. Draft state

The user can leave the page:

```text id="qbzj67"
Draft saved
Last saved 18:42
```

Then Sessions or Instruments can show:

```text id="h9pmu9"
DRAFT
```

This prevents accidental loss of intake data.

---

# 26. Role behavior

### Metrologist

Full editing access:

```text id="9u4q76"
Edit
Upload
Validate
Register
```

### Reviewer

The page should be read-only if entered from an existing session:

```text id="t8a3se"
READ ONLY
```

### Director

Read-only.

### Auditor

Read-only.

This follows the role enforcement rules in the source. `Pasted markdown(20261004-065148).md`

---

# 27. Important design rule

**Don't show all technical validation constantly.**

Normal state:

```text
Specifications

Class III
30 kg
0.005 kg

✓ Specification Valid
```

Expanded:

```text
ⓘ View calculation details
```

Then show:

```text
n = 6,000
n_min = ...
n_max = ...
```

This keeps the screen understandable to a judge or inspector who isn't deeply familiar with the formulas.

---

# 28. Dummy data

For the first implementation, this page should open with:

```text id="0qvqlr"
Manufacturer
Avery Weigh-Tronix

Model
ZM201 Retail Platform

Serial
AV-2026-8812

Approval
TAC-2026-III-0142

Class
III

Max
30 kg

Min
0.100 kg

e
0.005 kg

d
0.005 kg

Unit
kg
```

and five realistic photo placeholders.

Then each other preset replaces the complete dataset.

---

# 29. State machine

The page should have these explicit states:

```text id="hr4a9m"
EMPTY
  ↓
PARTIALLY FILLED
  ↓
VALIDATING
  ↓
VALID
  ↓
READY TO REGISTER
  ↓
REGISTERING
  ↓
REGISTERED
```

And exception states:

```text id="lm5il4"
INVALID
OCR REVIEW REQUIRED
MISSING EVIDENCE
DRAFT
ACCESS DENIED
```

Building these now will make the later backend integration much cleaner.

---

# 30. Final screen composition

```text id="q9hlam"
Instruments / New Registration

Register New Instrument                         [Save Draft]

Capture identity, specifications and evidence before verification.

┌────────────────────────────────────────────────────────────────────┐
│ QUICK START                                                        │
│                                                                    │
│ [Avery III] [Mettler I] [Sansui II] [Essae IIII]                 │
└────────────────────────────────────────────────────────────────────┘

┌───────────────────────┐ ┌─────────────────────────────────────────┐
│ 01 NAMEPLATE          │ │ 02 IDENTIFICATION                       │
│                       │ │                                         │
│ [Upload / OCR]        │ │ Manufacturer                            │
│                       │ │ Model                                   │
│ OCR 94.2%             │ │ Serial                                  │
│ [Apply OCR Data]      │ │ Approval Number                         │
└───────────────────────┘ └─────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ 03 METROLOGICAL SPECIFICATIONS                                     │
│                                                                    │
│ [Class I] [Class II] [Class III] [Class IIII]                    │
│                                                                    │
│ Max       Min       e       d       Unit                          │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ ✓ SPECIFICATION VALID                                       │   │
│ │ n = Max / e = 6,000                                         │   │
│ │ [View calculation details]                                  │   │
│ └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ 04 STATUTORY PHOTO DOSSIER                             5 / 5 ✓    │
│                                                                    │
│ [Nameplate] [Front] [Seal] [Level] [Document]                    │
└────────────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────────────
✓ Ready to register

[Save Draft]                 [Register & Begin Testing →]
```

---

## The key UX outcome

After completing this screen, the user should **not** wonder:

> “What do I enter next?”

The page should naturally guide:

```text
LOAD PRESET
   ↓
VERIFY IDENTITY
   ↓
VERIFY METROLOGICAL SPECS
   ↓
CAPTURE EVIDENCE
   ↓
REGISTER
   ↓
TEST SESSION CREATED
```

That is the right foundation for the rest of METROLOGIX-76, and it stays faithful to the source's prescribed intake architecture. `Pasted markdown(20261004-065148).md`

### Next screen

**Test Session Overview / Instrument Details** - the bridge between registration and actual testing: instrument header, overall status, test progress, next action, traceability state, and the 7-step verification workflow.

## Prompt:
10/4/2026, 6:20:54 PM

next

## Response:
10/4/2026, 6:21:00 PM · gpt-5-6-t-mini

> **Designed Screen 18 instrument details**
>
> 
>
> Worked for 5s

# NEXT - Instrument Details & Test Session Overview

Now we move from **registration** into the actual **Test Session mental model**.

This screen is the bridge between:

```text
Instrument Registration
        ↓
Test Session
        ↓
OIML Testing
```

The key idea is that the user should never feel like they have left the instrument and entered a collection of unrelated test pages.

The source establishes a persistent session context containing the instrument identity, metrological specifications, traceability status, and the 7-step workflow. `Pasted markdown(20261004-065148).md`

> **Note:** this overview is a supporting workspace from our architecture rather than a separately numbered screen in the pasted specification.

---

# 1. What this screen must answer

Within 5 seconds:

```text
WHAT INSTRUMENT?
→ Avery ZM201 / AV-2026-8812

WHAT SESSION?
→ SES-2026-0046

HOW FAR ALONG?
→ 3 of 7 steps

WHAT HAS PASSED?
→ Inspection ✓
→ Weighing ✓ / or current

WHAT DO I DO NOW?
→ Continue Weighing

IS TESTING BLOCKED?
→ Traceability / prerequisite status
```

This is the **control center for one instrument verification**.

---

# 2. Overall page

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                       │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ Sidebar       │ Sessions / AV-2026-8812                                     │
│               │                                                              │
│               │ ┌────────────────────────────────────────────────────────┐ │
│               │ │ INSTRUMENT                                               │ │
│               │ │ Avery Weigh-Tronix ZM201                                 │ │
│               │ │ AV-2026-8812                                             │ │
│               │ │ Class III · 30 kg · e 5 g                                │ │
│               │ │                                      ● IN PROGRESS       │ │
│               │ └────────────────────────────────────────────────────────┘ │
│               │                                                              │
│               │ ┌────────────────────────────────────────────────────────┐ │
│               │ │ ✓ Traceability Valid     Session SES-2026-0046         │ │
│               │ └────────────────────────────────────────────────────────┘ │
│               │                                                              │
│               │ ① Preflight ✓ → ② Inspection ✓ → ③ Weighing ●             │
│               │        → ④ Eccentricity ○ → ⑤ Repeatability ○             │
│               │        → ⑥ Environmental ○ → ⑦ Review ○                   │
│               │                                                              │
│               │ ┌─────────────────────┐ ┌────────────────────────────────┐ │
│               │ │ OVERALL STATUS      │ │ NEXT ACTION                    │ │
│               │ │                     │ │                                │ │
│               │ │      IN PROGRESS    │ │ Continue                       │ │
│               │ │      2 / 7 complete │ │ Weighing Error & Linearity     │ │
│               │ │                     │ │                                │ │
│               │ │                     │ │ [ Continue Testing → ]         │ │
│               │ └─────────────────────┘ └────────────────────────────────┘ │
│               │                                                              │
│               │ Test Results                                                │
│               │ [Inspection ✓] [Weighing ●] [Eccentricity ○] ...           │
│               │                                                              │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

---

# 3. Instrument identity header

This must be extremely clear.

```text id="j2g3sq"
Avery Weigh-Tronix ZM201
AV-2026-8812

Class III    30 kg Max    0.100 kg Min
e = 0.005 kg    d = 0.005 kg

● Verification In Progress
```

Use `StatusPill` for:

```text
Class III
```

and a `Badge/StatusPill` for:

```text
IN PROGRESS
```

---

# 4. Session metadata

Small secondary strip:

```text id="ycd7n2"
Session ID
SES-2026-0046

Verification Stage
Initial Type Approval

Operator
Metrologist

Started
04 Oct 2026 · 14:42
```

The session ID is important because eventually it will connect to audit events, reports and certificates.

---

# 5. Traceability status

Immediately below the identity:

### Valid

```text id="zazp9t"
┌─────────────────────────────────────────────────────────────────────┐
│ ✓ TRACEABILITY VALID                                                │
│ Standard weight set E2-014 · Calibration valid                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Attention

```text id="2c8rj7"
⚠ TRACEABILITY EXPIRING
Weight set E2-014 expires in 2 days.
```

### Locked

```text id="wo2ne9"
🔒 TESTING LOCKED

The assigned standard weight set is no longer valid.
Test inputs are disabled until traceability is resolved.

[ Resolve Traceability → ]
```

The source explicitly requires the traceability state to persist in the testing context and to become a hard lockout when standards are invalid. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 6. Seven-step progress

This is the heart of the screen.

```text id="sd0qwo"
01                 02                 03                 04
Preflight          Inspection         Weighing            Eccentricity
   ✓                  ✓                  ●                    ○

05                 06                 07
Repeatability      Environmental       Review & Sign
   ○                  ○                    ○
```

Better on desktop:

```text id="g3f7gt"
✓ Preflight ─── ✓ Inspection ─── ● Weighing ─── ○ Eccentricity
                                             
               ○ Repeatability ─── ○ Environmental ─── ○ Review
```

The workflow in the source is seven stages from intake/testing through review and seal. `Pasted markdown(20261004-065148).md`

---

# 7. Step states

### Completed

```text
✓ Inspection
Completed
```

### Current

```text
● Weighing
In progress
```

### Upcoming

```text
○ Eccentricity
Not started
```

### Blocked

```text
!
Repeatability
Blocked
```

### Locked/approved

```text
🔒 Review
Read only
```

---

# 8. Current-step emphasis

The current step should be impossible to miss.

Example:

```text id="1og0in"
CURRENT STEP

03
WEIGHING ERROR & LINEARITY

Record test observations and evaluate compliance.

[ Continue Testing → ]
```

Don't make the operator infer the current action from the stepper alone.

---

# 9. Overall compliance summary

A compact card:

```text id="d6zy6c"
OVERALL COMPLIANCE

2 / 7 completed

Completed tests
2 PASS

Warnings
0

Failures
0

Current status
IN PROGRESS
```

As the session progresses, this changes.

---

# 10. Test Result Cards

Below the main status area:

```text id="m4ecr9"
TEST RESULTS

┌──────────────────────┐ ┌──────────────────────┐
│ 01 Preflight         │ │ 02 Inspection        │
│                      │ │                      │
│ ✓ READY               │ │ ✓ PASS              │
│ Complete             │ │ Complete             │
│                      │ │                      │
│ View →               │ │ View →               │
└──────────────────────┘ └──────────────────────┘

┌──────────────────────┐ ┌──────────────────────┐
│ 03 Weighing          │ │ 04 Eccentricity      │
│                      │ │                      │
│ ● IN PROGRESS        │ │ ○ NOT STARTED        │
│ 0 / required rows    │ │                      │
│                      │ │                      │
│ Continue →           │ │ Locked until step 3  │
└──────────────────────┘ └──────────────────────┘
```

This gives a clean bird's-eye view.

---

# 11. Test card anatomy

Every card uses the same structure:

```text id="8v0sxy"
STEP NUMBER

Test Name

Status

One-line result

[Action]
```

Never put all calculations on the overview.

For example:

```text
Weighing
PASS
Maximum observed error: 1.8 g
View details →
```

not:

```text
Ec = ...
P = ...
ΔL = ...
MPE = ...
...
```

Those belong inside the test workspace.

---

# 12. Next-action card

This is probably the most important card on the entire page.

```text id="8e8caj"
┌─────────────────────────────────────────────────────────────┐
│ NEXT ACTION                                                  │
│                                                             │
│ Continue Weighing Error & Linearity                         │
│                                                             │
│ The instrument is ready for the current test.               │
│                                                             │
│ ✓ Preflight complete                                        │
│ ✓ Physical inspection complete                              │
│ ✓ Standard weights valid                                    │
│                                                             │
│                         [ Continue Testing → ]              │
└─────────────────────────────────────────────────────────────┘
```

This is what turns the page into a guided workflow instead of a dashboard.

---

# 13. If there is a blocker

Example:

```text id="j84w2h"
┌─────────────────────────────────────────────────────────────┐
│ BLOCKED                                                      │
│                                                             │
│ Testing cannot continue.                                   │
│                                                             │
│ Standard weight set E2-014 has expired.                    │
│                                                             │
│ [ Resolve Blocker → ]                                      │
└─────────────────────────────────────────────────────────────┘
```

Another possible blocker:

```text
Physical inspection incomplete.
```

The user should get the **reason + action**, not just a red status.

---

# 14. Instrument details section

Lower on the page:

```text id="hkzk1c"
Instrument Details

Identification
Manufacturer      Avery Weigh-Tronix
Model             ZM201
Serial            AV-2026-8812
Approval No.      TAC-2026-III-0142

Metrological
Accuracy Class    III
Max               30 kg
Min               0.100 kg
e                 0.005 kg
d                 0.005 kg
```

This should be collapsible.

The user normally doesn't need this information while testing.

---

# 15. Evidence summary

A small evidence card:

```text id="dg4ed1"
EVIDENCE

Photos
5 / 5 captured ✓

Nameplate       ✓
Front View      ✓
Sealing Point   ✓
Level Bubble    ✓
Documentation   ✓

[ View Evidence → ]
```

This connects the intake evidence to the session.

---

# 16. Audit summary

Another compact section:

```text id="2b2b95"
SESSION ACTIVITY

Last saved
18:42

Last action
Observation #4 recorded

Operator
Metrologist

Audit events
18
```

`View Audit Trail →`

This keeps the cryptographic detail out of the main view while still surfacing trust.

---

# 17. Footer actions

Role-aware action bar.

### Metrologist

```text
[ Save Session ]          [ Continue Testing → ]
```

### Reviewer

```text
[ Open Review ]           [ Add Audit Comment ]
```

### Director

```text
[ Review Results ]        [ Sign & Stamp Certificate ]
```

### Auditor

```text
[ View Audit Trail ]      [ View Certificate ]
```

Role-based visibility is explicitly required by the source. `Pasted markdown(20261004-065148).md`

---

# 18. Approved state

Once the Director signs:

```text id="qgakxk"
┌──────────────────────────────────────────────────────────────┐
│ 🔒 APPROVED · READ ONLY                                     │
│                                                              │
│ This verification session has been digitally signed.         │
│                                                              │
│ Certificate: CERT-2026-00192                                │
│                                                              │
│ Signed by: Laboratory Director                              │
│                                                              │
│ [ View Certificate ] [ View Audit Trail ]                   │
└──────────────────────────────────────────────────────────────┘
```

The source explicitly requires approved sessions to become permanently read-only. `Pasted markdown(20261004-065148).md`

---

# 19. Remanded state

Example:

```text id="0acwk8"
⚠ SESSION REMANDED

Reviewer requested correction:

"Eccentricity observation requires re-check."

Current action:
Repeat Eccentricity Test

[ Resume Correction → ]
```

This is much clearer than simply showing:

```text REMANDED
```

---

# 20. Fresh session state

For a newly registered instrument:

```text id="zo7qb8"
Session Created

AV-2026-8812
Avery ZM201

Ready to begin preflight

0 / 7 tests complete

[ Start Preflight → ]
```

This is the natural destination after registration.

---

# 21. Active session state

Example:

```text id="2yiear"
2 / 7 complete

✓ Preflight
✓ Inspection
● Weighing
○ Eccentricity
○ Repeatability
○ Environmental
○ Review

[ Continue Weighing → ]
```

---

# 22. Finished testing state

```text id="j4w8os"
6 / 7 complete

✓ Preflight
✓ Inspection
✓ Weighing
✓ Eccentricity
✓ Repeatability
✓ Environmental
● Review & Sign

[ Open Review → ]
```

This makes the final transition obvious.

---

# 23. Navigation behavior

This page should act as a **hub**.

```text id="7sx2h4"
Session Overview
      │
      ├── Preflight
      ├── Inspection
      ├── Weighing
      ├── Eccentricity
      ├── Repeatability
      ├── Environmental
      └── Review
```

Clicking a completed step:

```text
→ View results
```

Clicking the active step:

```text
→ Continue testing
```

Clicking a locked future step:

```text
→ Explain why unavailable
```

Never silently do nothing.

---

# 24. Progressive disclosure

Main screen:

```text
PASS
CURRENT TEST
NEXT ACTION
PROGRESS
BLOCKER
```

Secondary details:

```text
↓
instrument specifications
evidence
activity
audit
```

Technical calculations:

```text
↓
inside individual test screens
```

This preserves the source's core requirement that the interface stay clean and use progressive disclosure for technical detail. `Pasted markdown(20261004-065148).md`

---

# 25. Final visual composition

```text id="hn5m6s"
Sessions / AV-2026-8812

Avery Weigh-Tronix ZM201
AV-2026-8812
[Class III]   30 kg   e = 0.005 kg                    ● IN PROGRESS

┌──────────────────────────────────────────────────────────────────────┐
│ ✓ Traceability Valid · E2-014                                       │
└──────────────────────────────────────────────────────────────────────┘

✓ Preflight ─── ✓ Inspection ─── ● Weighing ─── ○ Eccentricity
                              ─── ○ Repeatability ─── ○ Environmental
                              ─── ○ Review

┌──────────────────────────────┐  ┌──────────────────────────────────┐
│ OVERALL STATUS               │  │ NEXT ACTION                      │
│                              │  │                                  │
│ IN PROGRESS                  │  │ Weighing Error & Linearity       │
│ 2 / 7 complete               │  │                                  │
│ 2 PASS                       │  │ [ Continue Testing → ]            │
└──────────────────────────────┘  └──────────────────────────────────┘

TEST RESULTS

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Preflight  │ │ Inspection │ │ Weighing   │ │ Eccentric  │
│ ✓ READY    │ │ ✓ PASS     │ │ ● ACTIVE   │ │ ○ PENDING  │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

┌────────────┐ ┌────────────┐ ┌────────────┐
│ Repeat.    │ │ Environment│ │ Review     │
│ ○ PENDING  │ │ ○ PENDING  │ │ ○ PENDING  │
└────────────┘ └────────────┘ └────────────┘

Instrument Details ↓
Evidence Summary ↓
Session Activity ↓
```

## The mental model

This screen should make the user think:

> **“This is my instrument, this is my verification session, this is where I am, these tests are done, and this is exactly what I need to do next.”**

That is the foundation for all the specialized OIML testing screens that follow.

### Next

**Test Readiness / Preflight** - the final gate before actual testing: instrument readiness, traceability, test-plan readiness, blockers, environmental baseline, and the `Ready to Begin Testing` action.

## Prompt:
10/4/2026, 6:21:35 PM

next

## Response:
10/4/2026, 6:21:45 PM · gpt-5-6-t-mini

> **Searched files for relevant information**
>
> 
>
> Worked for 5s

# NEXT - Test Readiness / Preflight

This is the **gate immediately before actual OIML test execution**.

The purpose is very simple:

> **Before the operator can start measuring anything, METROLOGIX-76 tells them clearly whether the session is ready, and exactly what is blocking it.**

This fits the application's guided workflow and persistent session context around instrument, traceability and test progression. `Pasted markdown(20261004-065148).md`

---

# 1. The page's 5-second message

The operator should instantly see one of these:

```text
✓ READY TO BEGIN TESTING
```

or

```text
⚠ 2 ITEMS NEED ATTENTION
```

or

```text
🔒 TESTING BLOCKED
```

Then immediately:

```text
WHY?
→ what is missing

WHAT DO I DO?
→ exact action to resolve it
```

No ambiguity.

---

# 2. Overall layout

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Sessions / AV-2026-8812                                                    │
│                                                                             │
│ Test Readiness                                                             │
│ Final checks before measurement begins                                     │
│                                                                             │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ READY TO BEGIN TESTING                                               │ │
│ │ All required preconditions have been satisfied.                        │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌────────────────┐ ┌────────────────┐ ┌───────────────────────────────┐    │
│ │ INSTRUMENT     │ │ TRACEABILITY   │ │ TEST PLAN                     │    │
│ │                │ │                │ │                               │    │
│ │ ✓ Ready        │ │ ✓ Valid       │ │ ✓ Ready                       │    │
│ │ Specs valid    │ │ E2-014        │ │ Required tests identified     │    │
│ └────────────────┘ └────────────────┘ └───────────────────────────────┘    │
│                                                                             │
│ Readiness Checklist                                                        │
│                                                                             │
│ ✓ Instrument identity verified                                             │
│ ✓ Metrological specifications valid                                        │
│ ✓ Physical inspection completed                                            │
│ ✓ Standard weights traceable                                               │
│ ✓ Test plan generated                                                      │
│ ✓ Environmental baseline recorded                                          │
│                                                                             │
│ ┌───────────────────────────────┐ ┌────────────────────────────────────┐  │
│ │ ENVIRONMENTAL BASELINE        │ │ CURRENT BLOCKER / STATUS            │  │
│ │                               │ │                                    │  │
│ │ Temperature   23.4 °C         │ │ No blockers                        │  │
│ │ Humidity      48 %            │ │                                    │  │
│ │ Pressure      1013 hPa        │ │ Ready to start                    │  │
│ └───────────────────────────────┘ └────────────────────────────────────┘  │
│                                                                             │
│                                      [ Start Testing → ]                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Header

```text
Sessions / AV-2026-8812

Test Readiness

Complete the preflight checks before recording test observations.
```

Keep the copy short.

The persistent session header above it continues to show:

```text
Avery ZM201
AV-2026-8812
Class III · 30 kg · e = 0.005 kg
```

---

# 4. Primary readiness banner

## Ready state

```text
┌──────────────────────────────────────────────────────────────┐
│ ✓ READY TO BEGIN TESTING                                     │
│                                                              │
│ All required preconditions have been satisfied.              │
│ Standard weight traceability is valid.                       │
└──────────────────────────────────────────────────────────────┘
```

This should be the strongest visual element.

---

## Warning state

```text
┌──────────────────────────────────────────────────────────────┐
│ ⚠ READY WITH ATTENTION                                       │
│                                                              │
│ 1 non-blocking item needs review before testing.             │
│                                                              │
│ [ Review Item → ]                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## Blocked state

```text
┌──────────────────────────────────────────────────────────────┐
│ 🔒 TESTING BLOCKED                                           │
│                                                              │
│ The assigned standard weight set has expired.                │
│ Test input is disabled until traceability is restored.       │
│                                                              │
│ [ Resolve Blocker → ]                                        │
└──────────────────────────────────────────────────────────────┘
```

The source explicitly establishes traceability as a hard gate that can disable testing. `Pasted markdown(20261004-065148).md`

---

# 5. Three readiness cards

These are the core model.

## A. Instrument

```text
INSTRUMENT

✓ READY

Identity verified
Specifications valid
Physical inspection complete

[ View Instrument → ]
```

---

## B. Traceability

```text
TRACEABILITY

✓ VALID

Weight Set E2-014
Calibration status valid

[ View Standards → ]
```

---

## C. Test Plan

```text
TEST PLAN

✓ READY

Applicable test scope determined
Required procedures available

[ View Test Plan → ]
```

This gives the user three extremely understandable answers:

```text
Is the scale okay?
Are my standards okay?
Do I know what tests I have to perform?
```

---

# 6. Readiness checklist

Instead of exposing technical internals, use plain-language checks.

```text
READINESS CHECKLIST

✓ Instrument registered
✓ Manufacturer / model / serial verified
✓ Metrological specifications validated
✓ Physical inspection completed
✓ Required evidence available
✓ Standard weight traceability valid
✓ Test applicability determined
✓ Laboratory conditions recorded
```

Each row should have:

```text
✓ Complete
⚠ Attention
✕ Failed
🔒 Blocked
```

---

# 7. Clicking a checklist item

Click:

```text
Metrological specifications validated
```

Then open a small drawer:

```text
Specification Check

Maximum capacity
30 kg

Verification interval
0.005 kg

Number of verification intervals
6,000

Status
✓ Valid

[ Open Instrument Details ]
```

Do not navigate away unnecessarily.

---

# 8. Readiness progress

At the top of the checklist:

```text
Preflight completion

████████████████████ 100%

8 / 8 checks complete
```

For a partial case:

```text
██████████████░░░░░░ 75%

6 / 8 checks complete
```

Use the reusable `ProgressRing` or a simple progress bar depending on available space.

---

# 9. Environmental baseline

The source defines environmental conditions as part of the testing workflow, with automatic laboratory baseline population in the environmental testing area. `Pasted markdown(20261004-065148).md`

On preflight:

```text
ENVIRONMENTAL BASELINE

Temperature
23.4 °C

Relative Humidity
48 %

Atmospheric Pressure
1013 hPa

✓ Baseline captured
```

Button:

```text
[ Refresh Reading ]
```

This gives a clear indication that the lab conditions have been established before testing.

---

# 10. Why blocked?

This deserves its own interaction.

Example:

```text
BLOCKER

Standard weight set E2-014 is expired.

Why does this matter?
Testing requires a currently valid traceable standard.

Required action
Select a valid standard weight set.

[ Resolve Traceability → ]
```

Another example:

```text
BLOCKER

Physical inspection is incomplete.

Missing:
• Seal integrity result

[ Complete Inspection → ]
```

The user should never see a generic:

```text
Cannot continue.
```

without an explanation.

---

# 11. Ready-to-start confirmation

When everything is green and the user clicks:

```text
[ Start Testing → ]
```

show:

```text
┌───────────────────────────────────────────────────────────────┐
│ Begin Verification Testing?                                  │
│                                                               │
│ Instrument                                                     │
│ Avery ZM201 · AV-2026-8812                                   │
│                                                               │
│ Test plan                                                     │
│ Ready                                                         │
│                                                               │
│ Traceability                                                  │
│ ✓ Valid                                                       │
│                                                               │
│ The session will open at the first applicable test.           │
│                                                               │
│ [ Cancel ]                         [ Start Testing → ]         │
└───────────────────────────────────────────────────────────────┘
```

This is a confirmation, not a long explanation.

---

# 12. Starting the actual workflow

After confirmation:

```text
Preflight
   ✓
   ↓
First applicable OIML test
```

For our standard demo:

```text
03 Weighing Error & Linearity
```

The exact test destination should come from the session's test plan rather than being hard-coded into the UI.

---

# 13. Not-ready state

Example:

```text
Test Readiness

⚠ NOT READY

2 items need attention

✓ Instrument
✓ Evidence
✕ Traceability
⚠ Test Plan

─────────────────────────

BLOCKING ISSUE

Standard weight set expired

[ Resolve Traceability → ]

─────────────────────────

[ Start Testing ]  ← disabled
```

This is much better than allowing the user to click through and discover problems later.

---

# 14. Read-only roles

### Reviewer

```text
READ ONLY
```

Can inspect readiness but cannot alter prerequisites.

### Director

Same.

### Auditor

Entire page read-only.

The role rules from the source require observation/test controls to be disabled for Reviewer and Director personas, and approved sessions to become read-only. `Pasted markdown(20261004-065148).md`

---

# 15. Approved session

This page shouldn't behave like an active preflight anymore.

Instead:

```text
🔒 APPROVED SESSION

Preflight completed
Testing completed
Certificate digitally signed

This session is immutable.

[ View Certificate ]
[ View Audit Trail ]
```

---

# 16. Remanded session

```text
⚠ SESSION REMANDED

Preflight status requires correction.

Reviewer note:
"Repeat physical inspection after seal verification."

[ Resolve Remand → ]
```

The operator should be brought directly to the relevant step.

---

# 17. Dummy-data example

For the initial frontend:

```text
Instrument
Avery Weigh-Tronix ZM201
AV-2026-8812

Class
III

Max
30 kg

e
0.005 kg

Weight Set
E2-014

Traceability
Valid

Inspection
Complete

Evidence
5 / 5

Test Plan
Ready

Environment
23.4 °C
48 %
1013 hPa

Overall
READY
```

---

# 18. State model

This page should have explicit states:

```text
CHECKING
   ↓
READY
   ↓
STARTING
   ↓
TESTING
```

or:

```text
CHECKING
   ↓
ATTENTION
   ↓
BLOCKED
   ↓
RESOLVED
   ↓
READY
```

This is important because later, real backend responses can map cleanly onto these states.

---

# 19. What NOT to put here

Don't turn Preflight into another testing page.

Keep out:

```text
❌ weighing observations
❌ eccentricity readings
❌ repeatability table
❌ thermal graphs
❌ raw formulas
❌ audit hash chains
❌ certificate preview
❌ hardware terminal
```

Those belong to their own workspaces.

Preflight has exactly one job:

> **Prove the session is ready before measurement begins.**

---

# 20. Final visual

```text
Test Readiness
Final checks before measurement begins.

┌────────────────────────────────────────────────────────────────────┐
│ ✓ READY TO BEGIN TESTING                                          │
│ All required preconditions have been satisfied.                   │
└────────────────────────────────────────────────────────────────────┘

┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐
│ INSTRUMENT     │ │ TRACEABILITY   │ │ TEST PLAN                  │
│ ✓ READY        │ │ ✓ VALID        │ │ ✓ READY                    │
│ Specs valid    │ │ E2-014         │ │ Scope determined            │
└────────────────┘ └────────────────┘ └────────────────────────────┘

Readiness Checklist                                  8 / 8 ✓

✓ Instrument registered
✓ Identity verified
✓ Specifications validated
✓ Physical inspection complete
✓ Evidence complete
✓ Standard weights valid
✓ Test plan ready
✓ Environment captured

┌──────────────────────────────┐ ┌─────────────────────────────────┐
│ ENVIRONMENTAL BASELINE       │ │ STATUS                          │
│                              │ │                                 │
│ 23.4 °C   48 %   1013 hPa   │ │ No blockers                     │
│ ✓ Captured                   │ │ Session ready                   │
└──────────────────────────────┘ └─────────────────────────────────┘

                                      [ Start Testing → ]
```

### The critical UX principle

This page should be the application's **traffic light before the laboratory starts measuring**:

```text
GREEN  → Go
AMBER  → Fix / review
RED    → Stop
```

That makes the workflow much safer and much easier for a judge to understand immediately.

### Next

**Physical & Visual Inspection** - the first actual inspection workspace, with the camera/photo evidence area, digital spirit-level visualization, seal/security checklist, inspection findings, and clear `PASS / FAIL / Needs Attention` result. The source specifies the camera inspector, spirit-level bubble and security-seal checks for this stage. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:22:15 PM

next

## Response:
10/4/2026, 6:22:21 PM · gpt-5-6-t-mini

# NEXT - Physical & Visual Inspection

Now we enter the **first actual inspection workspace** after Preflight.

This screen should feel like a **digital laboratory inspection station**, not a normal form.

The operator is physically looking at the instrument and recording whether its visible condition, leveling and security controls are acceptable. The source specifies a left-side camera/photo inspector, an interactive spirit-level bubble, and security-seal checks. `Pasted markdown(20261004-065148).md`

The page's single job is:

> **Inspect the physical instrument → capture evidence → identify defects → produce a clear inspection verdict.**

---

# 1. What the user should understand in 5 seconds

```text id="i5m9u8"
WHAT AM I INSPECTING?
→ Avery ZM201 · AV-2026-8812

WHAT DO I NEED TO CHECK?
→ Visual condition
→ Level
→ Security / sealing

IS EVERYTHING OK?
→ PASS / ATTENTION / FAIL

WHAT DO I DO NEXT?
→ Save inspection → Continue to Weighing
```

---

# 2. Overall layout

```text id="l3q3z4"
┌──────────────────────────────────────────────────────────────────────────────┐
│ SESSION HEADER                                                               │
│ Avery ZM201 · AV-2026-8812 · Class III · 30 kg                             │
│ ✓ Traceability Valid                                                        │
│ ✓ Preflight Complete                                                        │
│                                                                             │
│ ✓ Preflight → ● Inspection → ○ Weighing → ○ Eccentricity → ...             │
├──────────────────────────────────────────────────────────────────────────────┤
│ Breadcrumb: Session / Physical Inspection                                  │
│                                                                             │
│ Physical & Visual Inspection                         [ Save Inspection ]    │
│ Verify the instrument's physical condition, leveling and security.         │
│                                                                             │
│ ┌───────────────────────────────────┐ ┌──────────────────────────────────┐ │
│ │                                   │ │ SPIRIT LEVEL                    │ │
│ │       CAMERA / PHOTO INSPECTOR    │ │                                  │ │
│ │                                   │ │             ◯                    │ │
│ │       [ instrument image ]        │ │            ●                     │ │
│ │                                   │ │                                  │ │
│ │                                   │ │ Tilt: 0.18°                     │ │
│ │                                   │ │ ✓ Within acceptance range       │ │
│ └───────────────────────────────────┘ ├──────────────────────────────────┤ │
│                                       │ SECURITY & SEAL                  │ │
│                                       │                                  │ │
│                                       │ ✓ Lead wire seal                 │ │
│                                       │ ✓ Holographic sticker             │ │
│                                       │ ✓ Calibration jumper              │ │
│                                       │                                  │ │
│                                       │ [ Add Finding ]                  │ │
│                                       └──────────────────────────────────┘ │
│                                                                             │
│ INSPECTION FINDINGS                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Check                  Result       Evidence       Notes                │ │
│ │ Housing / display      ✓ PASS       Photo          -                    │ │
│ │ Level                  ✓ PASS       Bubble         0.18°                │ │
│ │ Security seal           ✓ PASS       Photo          Intact               │ │
│ │ Identification plate   ✓ PASS       Photo          Legible              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌──────────────────────────────────────┐                                    │
│ │ OVERALL INSPECTION                   │                                    │
│ │                                      │                                    │
│ │             ✓ PASS                   │                                    │
│ │                                      │                                    │
│ │ All required physical checks passed. │                                    │
│ └──────────────────────────────────────┘                                    │
│                                                                             │
│                         [ Continue to Weighing → ]                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Session context stays pinned

The operator must never lose instrument context.

Top:

```text id="p3gk4q"
Avery Weigh-Tronix ZM201
AV-2026-8812

[Class III]   30 kg   e = 0.005 kg

● INSPECTION
```

Then:

```text id="g4h9g7"
✓ Traceability Valid
```

and the seven-step session progress.

This follows the source's requirement for a persistent session header carrying instrument context and the interactive workflow stepper. `Pasted markdown(20261004-065148).md`

---

# 4. Page header

```text id="h0s4s2"
Physical & Visual Inspection

Verify the instrument's visible condition, leveling and security controls.
```

Right side:

```text id="7lgf0p"
[ Save Inspection ]
```

The main forward action will appear later.

---

# 5. Left - Camera / Photo Inspector

This is the main visual area.

The source specifically defines the left column as a live optical camera feed / photo inspector. `Pasted markdown(20261004-065148).md`

## No image yet

```text id="j1ln4m"
┌─────────────────────────────────────────────┐
│ CAMERA INSPECTOR                            │
│                                             │
│                                             │
│               ◉                             │
│                                             │
│      No inspection image loaded             │
│                                             │
│ [ Open Camera ] [ Upload Inspection Photo ] │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 6. Camera active state

```text id="y5eu7w"
┌─────────────────────────────────────────────────────┐
│ LIVE INSPECTION                           ● LIVE     │
│                                                     │
│                                                     │
│              [camera feed]                          │
│                                                     │
│                                                     │
│                                                     │
│ ─────────────────────────────────────────────────── │
│ Exposure     Focus       Evidence                   │
│                                                     │
│              [ Capture Evidence ]                   │
└─────────────────────────────────────────────────────┘
```

Don't make the camera UI look like a consumer photo app.

It should feel like an evidence-capture station.

---

# 7. Evidence capture

After clicking:

```text id="t5tpuy"
✓ Evidence captured

Inspection Photo 03
04 Oct 2026 · 15:08
```

Buttons:

```text id="qzv4pb"
[ Retake ]
[ Mark as Evidence ]
```

---

# 8. Evidence categories

The page should make clear what the current image is proving.

Example selector:

```text id="1eqjwk"
Evidence Type

[ Overall Condition ▾ ]
```

Options can be:

```text id="w6no26"
Overall Condition
Level
Security Seal
Identification Plate
Other Finding
```

This connects inspection evidence back to the dossier captured during intake.

---

# 9. Spirit Level Card

This is the second major visual element.

The source specifies an interactive circular spirit-level bubble and says the centered bubble is green within the stated tilt threshold, with amber when off-center. `Pasted markdown(20261004-065148).md`

### Normal state

```text id="0uw3l0"
SPIRIT LEVEL

                 ╭─────────╮
               ╱             ╲
              │       ●       │
              │               │
               ╲             ╱
                 ╰─────────╯

Tilt
0.18°

Acceptance
Within range

✓ LEVEL OK
```

---

# 10. Slightly off-center

```text id="ndw75u"
SPIRIT LEVEL

             ╭─────────╮
            │         │
            │     ●   │
            │         │
             ╰─────────╯

Tilt
0.42°

⚠ NEAR LIMIT
```

This should not immediately become a failure.

Use the source's visual distinction:

```text
green → acceptable
amber → off-center / attention
```

---

# 11. Fail state

```text id="n9j0m1"
SPIRIT LEVEL

             ╭─────────╮
            │ ●       │
            │         │
            │         │
             ╰─────────╯

Tilt
0.73°

✕ LEVEL CHECK FAILED
```

Then:

```text id="1x5bfi"
[ Record Finding ]
```

---

# 12. Make the bubble interactive

For dummy data, allow the tester to simulate:

```text id="aqg5e7"
Tilt
[ 0.18° ─────●────── 0.90° ]
```

Moving the slider moves the bubble.

That makes the UI useful during the hackathon demo because the judge can immediately see the system react.

---

# 13. Security & Seal Card

The source explicitly specifies checks for:

- lead wire tamper seal
- holographic sticker
- calibration jumper integrity `Pasted markdown(20261004-065148).md`

Design:

```text id="6enf0w"
SECURITY & SEAL

Lead Wire Tamper Seal

○ Intact
○ Damaged
○ Missing

Holographic Sticker

○ Present
○ Damaged
○ Missing

Calibration Jumper

○ Intact
○ Tampered
○ Not Accessible
```

But don't expose all options simultaneously as radio-button clutter.

Better:

```text id="b6bfr5"
Lead Wire Tamper Seal

[ ✓ INTACT ▾ ]

Holographic Sticker

[ ✓ PRESENT ▾ ]

Calibration Jumper

[ ✓ INTACT ▾ ]
```

---

# 14. Evidence shortcut

Each check can have:

```text id="fn2s53"
📷 View Evidence
```

Clicking opens the captured image in a focused modal.

This follows the overall progressive-disclosure rule from the specification. `Pasted markdown(20261004-065148).md`

---

# 15. Inspection checklist

Under the main workspace:

```text id="h3cjya"
Inspection Findings
```

Table:

```text id="tb2rj7"
┌─────────────────────────┬────────────┬─────────────┬─────────────────┐
│ Inspection Check        │ Result     │ Evidence    │ Notes           │
├─────────────────────────┼────────────┼─────────────┼─────────────────┤
│ Physical condition      │ ✓ PASS     │ 2 photos    │ No damage       │
│ Display / markings      │ ✓ PASS     │ 1 photo     │ Legible         │
│ Level                   │ ✓ PASS     │ Bubble      │ 0.18°           │
│ Lead wire seal          │ ✓ PASS     │ 1 photo     │ Intact          │
│ Holographic sticker     │ ✓ PASS     │ 1 photo     │ Present         │
│ Calibration jumper      │ ✓ PASS     │ 1 photo     │ Intact          │
└─────────────────────────┴────────────┴─────────────┴─────────────────┘
```

---

# 16. Findings are progressive disclosure

Don't make Notes huge.

Normal:

```text id="w2v87q"
Physical condition
✓ PASS

No damage
```

Click:

```text id="3d6ztc"
Inspect →
```

opens:

```text id="0f0ge1"
Inspection Detail

Physical Condition

Result
PASS

Evidence
IMG-004

Observation
No cracks or deformation visible.

Inspector
Metrologist

Captured
04 Oct 2026 · 15:08
```

---

# 17. Add Finding

Button:

```text id="6o0xji"
+ Add Finding
```

Opens drawer:

```text id="f78vys"
Add Inspection Finding

Category
[ Physical condition ▾ ]

Severity
[ Note ▾ ]

Description
[________________________________]

Evidence
[ Attach photo ]

[ Cancel ] [ Add Finding ]
```

This uses the same Drawer primitive we already established.

---

# 18. Severity

Keep terminology understandable:

```text id="7czw6r"
NOTE
ATTENTION
CRITICAL
```

Rather than:

```text OBS-03
NONCONFORMITY-2
DEFECT_CLASS_B
```

---

# 19. Overall result card

Bottom/right:

### All good

```text id="b6z47o"
┌────────────────────────────────────────┐
│ OVERALL INSPECTION                     │
│                                        │
│             ✓ PASS                    │
│                                        │
│ 6 of 6 checks passed                  │
│ 6 evidence items captured             │
└────────────────────────────────────────┘
```

---

# 20. One issue

```text id="jyrt2v"
┌────────────────────────────────────────┐
│ OVERALL INSPECTION                     │
│                                        │
│          ⚠ NEEDS ATTENTION             │
│                                        │
│ 5 passed                               │
│ 1 observation requires review           │
│                                        │
│ [ Review Finding ]                     │
└────────────────────────────────────────┘
```

---

# 21. Critical failure

```text id="lw6g4x"
┌────────────────────────────────────────┐
│ OVERALL INSPECTION                     │
│                                        │
│             ✕ FAIL                    │
│                                        │
│ Security seal integrity failed.       │
│ Testing cannot continue.              │
│                                        │
│ [ View Finding ]                       │
└────────────────────────────────────────┘
```

Don't let the operator blindly continue.

---

# 22. Bottom navigation

When passing:

```text id="0i7vi4"
✓ Inspection complete

[ Back ]                      [ Continue to Weighing → ]
```

When failing:

```text id="g1d0aj"
✕ Inspection failed

[ Review Issues ]             [ Save & Exit ]
```

When attention required:

```text id="h8qp9d"
⚠ Resolve 1 inspection finding

[ Review Finding ]            [ Save Draft ]
```

---

# 23. Example dummy scenario

For the standard Avery demo:

```text id="k4wv9d"
Instrument
Avery ZM201
AV-2026-8812

Class III
30 kg
e = 0.005 kg

Tilt
0.18°

Lead Wire Seal
Intact

Holographic Sticker
Present

Calibration Jumper
Intact

Physical Condition
Pass

Overall
PASS
```

This gives us a very clean first successful walkthrough.

---

# 24. Demo failure scenario

We can also provide a synthetic inspection state:

```text id="vh9g2g"
Scenario:
Physical Seal Failure
```

Then:

```text id="6paxkm"
Lead Wire Tamper Seal

✕ DAMAGED

Evidence:
IMG-011

Finding:
Seal wire shows visible interruption.
```

Overall:

```text id="nq3m7d"
✕ INSPECTION FAILED
```

and:

```text id="qbyj2a"
[ Continue to Weighing ] ← disabled
```

This is much better for the hackathon because the judge can see that the application isn't just a pretty form-it enforces workflow logic.

---

# 25. Role behavior

### Metrologist

Can:

```text id="q1jhds"
Capture evidence
Change inspection result
Add findings
Save
Continue
```

### Reviewer

```text id="k1ydlx"
Read only

[ View Evidence ]
[ Add Audit Comment ]
```

### Director

Read-only.

### Auditor

Read-only.

This stays aligned with the source's role-based permission model. `Pasted markdown(20261004-065148).md`

---

# 26. Important UX rule

**Do not put every physical inspection question on screen at once.**

The primary view should emphasize:

```text id="5zv1tg"
PHOTO
LEVEL
SECURITY
RESULT
```

Details should appear only when requested.

That preserves the specification's goal of keeping primary screens clean and moving secondary audit information into drawers/modals. `Pasted markdown(20261004-065148).md`

---

# 27. Final screen

```text id="dp6iwv"
Physical & Visual Inspection

Avery Weigh-Tronix ZM201
AV-2026-8812
[Class III] 30 kg

✓ Traceability Valid

✓ Preflight ─── ● Inspection ─── ○ Weighing ─── ○ Eccentricity ─── ...

┌───────────────────────────────────┐ ┌──────────────────────────────┐
│ CAMERA INSPECTOR                  │ │ SPIRIT LEVEL                 │
│                                   │ │                              │
│        [ instrument photo ]       │ │            ◯                 │
│                                   │ │           ●                  │
│ [Capture Evidence]                │ │ Tilt 0.18°                  │
│                                   │ │ ✓ LEVEL OK                   │
└───────────────────────────────────┘ ├──────────────────────────────┤
                                       │ SECURITY & SEAL               │
                                       │                              │
                                       │ Lead Wire        ✓ INTACT    │
                                       │ Holographic      ✓ PRESENT   │
                                       │ Calibration      ✓ INTACT    │
                                       │                              │
                                       │ [+ Add Finding]              │
                                       └──────────────────────────────┘

Inspection Findings

✓ Physical Condition
✓ Display / Markings
✓ Level
✓ Lead Wire Seal
✓ Holographic Sticker
✓ Calibration Jumper

┌─────────────────────────────────────────────────────┐
│ OVERALL INSPECTION                                  │
│                                                     │
│                    ✓ PASS                           │
│                                                     │
│       All required physical checks passed.          │
└─────────────────────────────────────────────────────┘

[ Save Inspection ]                 [ Continue to Weighing → ]
```

## The mental model

This screen should feel like:

**LOOK → CHECK → CAPTURE → RECORD → PASS/FAIL → CONTINUE**

Not:

**OPEN FORM → READ 30 QUESTIONS → TYPE EVERYTHING → SUBMIT**

That distinction is important to making METROLOGIX-76 feel like a professional metrology workstation rather than a conventional CRUD application.

### Next

**Weighing Error & Linearity** - the most important measurement workspace: ascending/descending observation series, live scale capture, calculated error, legal tolerance, PASS/FAIL, turning-point trace, and the interactive Error Corridor chart. The source explicitly defines this observation-grid architecture and the split/grid/chart view options. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:22:55 PM

next

## Response:
10/4/2026, 6:23:05 PM · gpt-5-6-t-mini

> **Weighing Sequence Continuation**
>
> 
>
> Worked for a few seconds

# NEXT - Weighing Error & Linearity

This is the **core measurement workspace** of METROLOGIX-76.

This screen must make the most important laboratory operation extremely obvious:

> **Load the scale → capture the reading → calculate the error → compare it with the legal tolerance → record PASS/FAIL.**

The source specifically defines this as `ObservationGrid.tsx`, with a persistent session header, verification-stage selector, split/grid/chart layouts, ascending and descending series, live-weight capture, calculation trace, rounding-trap demonstration, row-level audit comments, and the Error Corridor chart. `Pasted markdown(20261004-065148).md`

---

# 1. 5-second mental model

The operator should see:

```text id="r5kz4y"
CURRENT TEST
03 · Weighing Error & Linearity

WHAT DO I ENTER?
Target Load + Observed Reading

WHAT DOES THE SYSTEM CALCULATE?
Error + Legal Tolerance

WHAT IS THE RESULT?
PASS / WARNING / FAIL

WHAT DO I DO?
Complete observations → Continue
```

This page should be **measurement-first**, not form-first.

---

# 2. Overall layout

```text id="3q9q2b"
┌──────────────────────────────────────────────────────────────────────────────┐
│ SESSION HEADER                                                               │
│ Avery ZM201 · AV-2026-8812 · Class III · 30 kg · e = 0.005 kg              │
│ ✓ Traceability Valid                                                         │
│                                                                             │
│ ✓ Preflight → ✓ Inspection → ● Weighing → ○ Eccentricity → ...             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Weighing Error & Linearity                                [Save Test]       │
│ Determine weighing error across increasing and decreasing loads.           │
│                                                                             │
│ [ Initial Type Approval ] [ Subsequent Verification ]                      │
│                                                                             │
│ View: [ Split ] [ Grid ] [ Chart ]                         ● STABLE 10.005kg│
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ASCENDING SERIES - Increasing Load                                     │ │
│ │                                                                         │ │
│ │ Target   Reading   Error   Legal Limit   Compliance   Trace             │ │
│ │ 0 kg     0.000     0.000   ±...          ✓ PASS       ⓘ                │ │
│ │ 5 kg     5.005     0.005   ±...          ✓ PASS       ⓘ                │ │
│ │ 10 kg    10.005    0.005   ±...          ✓ PASS       ⓘ                │ │
│ │ 15 kg    -         -       -             [Capture]    ⓘ                │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ DESCENDING SERIES - Decreasing Load                                    │ │
│ │                                                                         │ │
│ │ 30 kg → 0 kg observations                                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌──────────────────────────────────┐ ┌────────────────────────────────────┐ │
│ │ TEST SUMMARY                     │ │ ERROR CORRIDOR                     │ │
│ │                                  │ │                                    │ │
│ │ Observations  14 / 20            │ │          •      •                  │ │
│ │ Maximum Error  +1.8 g            │ │ ────────── MPE ─────────            │ │
│ │ Minimum Error  -1.2 g            │ │          •  •      •                │ │
│ │ Overall        ✓ PASS             │ │                                    │ │
│ └──────────────────────────────────┘ └────────────────────────────────────┘ │
│                                                                             │
│                      [ Continue to Eccentricity → ]                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Persistent session header

Keep the instrument identity visible:

```text id="b2s8yu"
Avery Weigh-Tronix ZM201
AV-2026-8812

[Class III]
30 kg Max
e = 0.005 kg
```

And:

```text id="h26c5o"
✓ Traceability Valid
```

Then the 7-step workflow:

```text id="3q5gr4"
✓ Preflight
→ ✓ Inspection
→ ● Weighing
→ ○ Eccentricity
→ ○ Repeatability
→ ○ Environmental
→ ○ Review
```

The source explicitly requires the session header and live scale context on this screen. `Pasted markdown(20261004-065148).md`

---

# 4. Page header

```text id="ukqsvv"
Weighing Error & Linearity

Record the instrument response at defined loads and compare each result
against the applicable legal tolerance.
```

Right:

```text id="lvb0xg"
[ Save Test ]
```

---

# 5. Verification-stage selector

The source defines a two-state selector for:

```text id="a8w3kh"
[ Initial Type Approval · 1× MPE ]
[ Subsequent Verification · 2× MPE ]
```

Make the active selection unmistakable.

Example:

```text id="8sb8jv"
Verification Stage

┌─────────────────────────┐ ┌────────────────────────────┐
│ ● Initial Type Approval │ │ ○ Subsequent Verification  │
│   1× MPE                │ │   2× MPE                   │
└─────────────────────────┘ └────────────────────────────┘
```

Technical explanation belongs in a tooltip rather than a paragraph.

---

# 6. Live scale status chip

At the upper right:

```text id="5o3n5f"
● STABLE
10.005 kg
```

When unstable:

```text id="jrq5yn"
● UNSTABLE
10.002 ↕ 10.008 kg
```

The `Capture Live Weight` action should be disabled or visually discouraged while unstable.

---

# 7. Layout switcher

Three modes exactly as specified:

```text id="s7k4nz"
[ Split View ] [ Grid Only ] [ Chart Only ]
```

### Split View

Best default.

```text id="7q5efn"
Table
  +
Chart
```

### Grid Only

Useful when many rows need entering.

### Chart Only

Useful during result analysis or presentation/demo.

---

# 8. Ascending Series

This is the first measurement table.

Header:

```text id="wq8a7d"
01 · ASCENDING SERIES

Increasing Load
0 → Maximum Capacity
```

The source defines this series specifically for the increasing-load evaluation. `Pasted markdown(20261004-065148).md`

---

# 9. Table structure

Keep visible columns human-readable:

```text id="y8p49y"
┌───────┬─────────────┬──────────────┬──────────────┬─────────────┬──────┐
│ Target│ Observed    │ Calculated   │ Legal        │ Compliance  │ Trace│
│ Load  │ Reading     │ Error        │ Tolerance    │             │      │
├───────┼─────────────┼──────────────┼──────────────┼─────────────┼──────┤
│ 0 kg  │ 0.000 kg    │ 0.000 g      │ ±2.5 g       │ ✓ PASS      │ ⓘ    │
│ 5 kg  │ 5.005 kg    │ +5.0 g       │ ±5.0 g       │ ⚠ MARGINAL  │ ⓘ    │
│10 kg  │ 10.005 kg   │ +5.0 g       │ ±5.0 g       │ ⚠ MARGINAL  │ ⓘ    │
│15 kg  │ -           │ -            │ ±5.0 g       │ [ Capture ] │ ⓘ    │
└───────┴─────────────┴──────────────┴──────────────┴─────────────┴──────┘
```

The source specifically prefers friendly labels such as `Target Test Load`, `Observed Reading`, `Calculated Error`, and `Legal Tolerance Limit`. `Pasted markdown(20261004-065148).md`

---

# 10. Don't expose raw formulas in the table

The table should say:

```text id="4t9g5b"
Calculated Error
+1.8 g
```

not:

```text id="p2moh9"
Ec = E - E0
```

The formula belongs behind:

```text id="0o7g9u"
ⓘ Inspect Trace
```

---

# 11. Capture reading interaction

For an empty observation:

```text id="63p75a"
Target Load
15 kg

Observed Reading
-

[ Capture Live Weight ]
```

Click:

```text id="nb3z4g"
● STABLE
15.005 kg
```

Then the row instantly becomes:

```text id="dr6glr"
15 kg
15.005 kg
+5.0 g
±5.0 g
⚠ MARGINAL
```

Toast:

```text id="p65e3u"
✓ Reading captured
Observation #4 recorded.
```

---

# 12. Manual entry fallback

There should also be:

```text id="l4u5s1"
[ Enter Manually ]
```

for situations where the physical scale isn't connected.

Example:

```text id="e6k6p3"
Observed Reading
[ 15.005 ]
```

But the UI should visually prioritize live capture.

---

# 13. Row status

Use a consistent hierarchy:

### PASS

```text id="3l16zj"
✓ PASS
```

### Near limit

```text id="j7v98u"
⚠ MARGINAL
```

### Failure

```text id="8sm6r6"
✕ FAIL
```

The source defines green, amber and crimson traffic-light treatment based on proximity to the legal limit. `Pasted markdown(20261004-065148).md`

---

# 14. Inspect calculation trace

Click:

```text id="2q26av"
ⓘ
```

Modal:

```text id="4swo1a"
Calculation Trace

Observation #4

Target Load
10.000 kg

Observed Reading
10.005 kg

Turning Point
P = I + 0.5e - ΔL

             = 10.005 + 0.0025 - 0.0025
             = 10.005 kg

Error
E = P - L

  = 10.005 - 10.000
  = +0.005 kg

Corrected Error
Ec = E - E₀

Legal Tolerance
±5 g

Final Result
⚠ MARGINAL

[ Close ]
```

The source explicitly requires this step-by-step calculation trace modal. `Pasted markdown(20261004-065148).md`

---

# 15. Why this matters

The detailed trace gives judges something very valuable:

```text
Input
 ↓
Turning point calculation
 ↓
Error
 ↓
Tolerance
 ↓
Statutory verdict
```

They can understand **why** the system produced the result.

That is much more convincing than simply showing a green badge.

---

# 16. Descending Series

After ascending:

```text id="l7gzmi"
02 · DESCENDING SERIES

Decreasing Load
Maximum Capacity → 0
```

Table follows the same structure.

Example:

```text id="4ulqcg"
30 kg     29.995 kg     -5.0 g     ±5.0 g     ⚠ MARGINAL
20 kg     20.000 kg      0.0 g     ±5.0 g     ✓ PASS
10 kg     10.002 kg     +2.0 g     ±5.0 g     ✓ PASS
...
```

The source defines the descending series specifically to expose mechanical hysteresis effects. `Pasted markdown(20261004-065148).md`

---

# 17. Series progress

Under each section:

```text id="i47r6z"
Ascending
8 / 10 observations

████████████████░░░░
```

and:

```text id="26ngz0"
Descending
6 / 10 observations

████████████░░░░░░░░
```

This immediately tells the operator what remains.

---

# 18. Row-level audit flag

Each row gets:

```text id="j5jo13"
⚑
```

Clicking it opens the Audit Comment Drawer.

Example:

```text id="c9uk5r"
┌─────────────────────────────────────────────┐
│ Observation #7                              │
│                                             │
│ Target load       20 kg                     │
│ Observed reading  20.006 kg                 │
│ Result            ⚠ Marginal                │
│                                             │
│ Add audit comment                           │
│                                             │
│ [ Low Margin Warning ]                      │
│ [ Hysteresis Reversal ]                     │
│ [ Other ]                                   │
│                                             │
│ Comment                                     │
│ [_______________________________]            │
│                                             │
│ [ Cancel ]             [ Add Comment ]      │
└─────────────────────────────────────────────┘
```

The source specifies row flags opening a slide-over audit comment drawer. `Pasted markdown(20261004-065148).md`

---

# 19. Rounding Trap scenario

This is one of the **most important demo features**.

When the rounding-discrepancy scenario is loaded:

```text id="9dcv2f"
┌─────────────────────────────────────────────────────────────────────┐
│ ⚠ ROUNDING TRAP ACTIVE                                             │
│                                                                     │
│ A rounded spreadsheet value appears to pass, but the turning-point  │
│ evaluation produces a statutory failure.                            │
│                                                                     │
│ [ Compare Calculations → ]                                         │
└─────────────────────────────────────────────────────────────────────┘
```

This is explicitly required by the source. `Pasted markdown(20261004-065148).md`

---

# 20. Rounding comparison drawer

Click:

```text id="hyb9gm"
Compare Calculations
```

Then:

```text id="h82t1g"
Legacy Spreadsheet

I - L
= 0 g

Displayed Result
✓ PASS

METROLOGIX-76

Turning Point
= -5.3 g

Legal Limit
±5.0 g

Statutory Result
✕ FAIL
```

Then a clear takeaway:

```text id="xwx8q6"
The displayed spreadsheet value hides the actual
turning-point error.
```

This should be one of the strongest judge-demo moments.

---

# 21. Test summary card

At the bottom:

```text id="wdl0ft"
WEIGHING SUMMARY

Observations
18 / 20

Maximum Error
+3.2 g

Minimum Error
-2.1 g

Near Limit
2

Failures
0

Overall
✓ PASS
```

For an error scenario:

```text id="mc7x74"
Overall
✕ FAIL

1 observation exceeds legal tolerance
```

---

# 22. Error Corridor chart

This is the visual centerpiece.

The source specifically requires an SVG chart plotting ascending and descending errors against the `±MPE` boundaries. `Pasted markdown(20261004-065148).md`

Conceptually:

```text id="c0vxx1"
Error
 +MPE ───────────────────────────────────
          •       •
       •     •
  0 ─────────────────────────────────────
           •     •       •
              •
 -MPE ───────────────────────────────────
        Load → 0       10      20      30
```

Use two point types:

```text id="x60h1f"
● Ascending
◆ Descending
```

---

# 23. Chart interactions

Hover point:

```text id="t45e7n"
Observation #7

Load
20 kg

Error
+3.2 g

Limit
±5.0 g

✓ PASS
```

Click:

```text id="xv5d1c"
→ highlight corresponding table row
```

Click row:

```text id="j1zjj7"
→ highlight corresponding chart point
```

This links evidence visually.

---

# 24. Near-limit visualization

A point close to the limit should visually move toward amber.

Example:

```text id="v5jv5w"
+MPE ───────────────────
            ◆
       •
  0 ───────────────────
```

This makes risk visible before failure.

---

# 25. Failure visualization

A failed measurement:

```text id="46jf1w"
+MPE ───────────────────
                         ●
  0 ───────────────────
```

The UI should immediately show:

```text id="l1m5x8"
✕ FAIL
Exceeded legal tolerance
```

---

# 26. Chart-only mode

Useful when presenting to judges:

```text id="s20p56"
WEIGHING ERROR - ERROR CORRIDOR

                 ●
+MPE ──────────────────────────────
            •  •       •
       •
0 ─────────────────────────────────
          •       ◆
                  ◆
-MPE ─────────────────────────────

Ascending ●
Descending ◆
```

Almost like a lab instrument visualization.

---

# 27. Completion logic

When all mandatory observations are complete:

```text id="8h0l2i"
✓ Required observations complete

Ascending
10 / 10

Descending
10 / 10
```

Then:

```text id="7t6a9r"
WEIGHING TEST RESULT

✓ PASS

All recorded errors are within the applicable tolerance.
```

---

# 28. Incomplete state

```text id="6d6ieq"
⚠ TEST INCOMPLETE

4 observations remain.

[ Continue Recording ]
```

and:

```text id="k5y9sc"
[ Continue to Eccentricity → ]
```

remains disabled.

---

# 29. Failed state

If an observation fails:

```text id="qhe0mz"
✕ WEIGHING TEST FAILED

Observation #14 exceeded the legal tolerance.

Maximum observed error
-5.3 g

Legal limit
±5.0 g

[ Inspect Failure ]
```

Next step should not casually become available.

---

# 30. Role behavior

### Metrologist

Can:

```text id="6k9xlz"
Capture
Edit
Add observations
Inspect traces
Add notes
Save
Complete test
```

### Reviewer

```text id="c8j2gf"
Rows read-only

[ Inspect Trace ]
[ Add Audit Comment ]
```

### Director

Read-only.

### Auditor

Read-only.

This follows the source's permission rules. `Pasted markdown(20261004-065148).md`

---

# 31. Traceability lockout

At any point:

```text id="5x6s1u"
🔒 TESTING LOCKED

Assigned standard weight set is no longer valid.

Observation entry has been disabled.

[ Resolve Traceability → ]
```

The table remains viewable, but capture/edit controls are disabled.

---

# 32. Dummy-data interaction demo

This page should initially support:

```text id="l8zxnz"
Load:
Avery Class III
      ↓
Automatically creates
ascending + descending observations
      ↓
Calculates results
      ↓
Updates chart
      ↓
Updates summary
```

And:

```text id="1e3n4w"
Load Rounding Trap Scenario
      ↓
Amber alert appears
      ↓
False spreadsheet PASS
      ↓
Turning-point FAIL
      ↓
Comparison drawer
```

This is exactly the kind of interaction that will make the frontend feel like a real system rather than a static mockup.

---

# 33. Final screen

```text id="w4xg8t"
Weighing Error & Linearity

Avery ZM201 · AV-2026-8812
[Class III] 30 kg · e = 0.005 kg
✓ Traceability Valid

✓ Preflight → ✓ Inspection → ● Weighing → ○ Eccentricity → ...

Verification Stage
[ ● Initial Type Approval ] [ ○ Subsequent Verification ]

View
[ ● Split ] [ Grid ] [ Chart ]

                    ● STABLE  10.005 kg

┌─────────────────────────────────────────────────────────────────────┐
│ ASCENDING SERIES - Increasing Load                                 │
│                                                                     │
│ Target     Reading      Error      Legal Limit     Result     Trace │
│ 0 kg       0.000 kg     0.0 g      ±2.5 g          ✓ PASS      ⓘ   │
│ 5 kg       5.005 kg     +5.0 g     ±5.0 g          ⚠ MARGINAL  ⓘ   │
│ 10 kg      10.004 kg    +4.0 g     ±5.0 g          ✓ PASS      ⓘ   │
│ 15 kg      15.002 kg    +2.0 g     ±5.0 g          ✓ PASS      ⓘ   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ DESCENDING SERIES - Decreasing Load                                │
│                                                                     │
│ 30 kg → 0 kg                                                       │
│ ...                                                                 │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────┐ ┌─────────────────────────────────────┐
│ TEST SUMMARY              │ │ ERROR CORRIDOR                     │
│                           │ │                                     │
│ 18 / 20 observations     │ │       •      •                     │
│ Max +3.2 g               │ │ ───────── MPE ─────────────         │
│ Min -2.1 g               │ │      •   •      ◆                   │
│                           │ │                                     │
│ ✓ PASS                   │ │                                     │
└───────────────────────────┘ └─────────────────────────────────────┘

✓ Test complete

[ Save Test ]                     [ Continue to Eccentricity → ]
```

## The mental model

This page is:

**LOAD → CAPTURE → CALCULATE → COMPARE → EXPLAIN → RECORD**

And the strongest part is that every result can be traced from:

```text
Observed Reading
      ↓
Calculated Error
      ↓
Legal Tolerance
      ↓
PASS / FAIL
      ↓
Calculation Trace
```

That is exactly the kind of transparent measurement workflow the source describes for `ObservationGrid`, including the calculation trace, rounding-trap demonstration, audit drawer and Error Corridor visualization. 

### Next

**Eccentricity / Corner Loading** - the next specialized workspace: square/round/rolling-load geometry selector, interactive platter visualization, position-by-position readings, deflection vector, worst corner, tolerance analysis and final eccentricity verdict. The source defines this as `PlatterHeatmap.tsx`. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:23:49 PM

next

## Response:
10/4/2026, 6:23:57 PM · gpt-5-6-t-mini

# NEXT - Eccentricity / Corner Loading

Now we move to **Step 04: Eccentricity**.

This should be one of the most visually impressive screens in METROLOGIX-76 because the operator can **see where the load is being applied on the weighing platform and immediately understand which position is passing or failing**.

The source specifies a three-way platter geometry selector, an interactive SVG platter visualizer, dynamic color states for load positions, and a 2D deflection-vector visualization. `Pasted markdown(20261004-065148).md`

---

# 1. What this screen must communicate in 5 seconds

```text id="f3hl2f"
WHAT TEST?
→ Eccentricity / Corner Loading

WHERE IS THE LOAD?
→ Position 1 / 2 / 3 / 4

HOW IS THAT POSITION PERFORMING?
→ Error + legal limit

WHICH POSITION IS WORST?
→ Worst corner highlighted

WHAT IS THE VERDICT?
→ PASS / MARGINAL / FAIL
```

The page should feel almost like a **digital load-positioning instrument**.

---

# 2. Overall layout

```text id="2f9z22"
┌──────────────────────────────────────────────────────────────────────────────┐
│ SESSION HEADER                                                               │
│ Avery ZM201 · AV-2026-8812 · Class III · 30 kg · e = 0.005 kg              │
│ ✓ Traceability Valid                                                         │
│                                                                             │
│ ✓ Preflight → ✓ Inspection → ✓ Weighing → ● Eccentricity → ...             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Eccentricity / Corner Loading                         [ Save Test ]         │
│ Verify the weighing response at defined load positions.                    │
│                                                                             │
│ Geometry                                                                    │
│ [ ● Square · 4 Corners ] [ Round · 3 Supports ] [ Rolling Load · >4 ]     │
│                                                                             │
│ Test Load: [ 10.000 kg ]                                  ● STABLE         │
│                                                                             │
│ ┌───────────────────────────────────────────┐ ┌───────────────────────────┐ │
│ │                                           │ │ CURRENT POSITION          │ │
│ │          INTERACTIVE PLATTER             │ │                           │ │
│ │                                           │ │ Corner 3                  │ │
│ │            ●       ●                      │ │                           │ │
│ │                                           │ │ Target   10.000 kg        │ │
│ │            ●       ●                      │ │ Reading  10.004 kg       │ │
│ │                                           │ │ Error    +4.0 g           │ │
│ │                 ↗                         │ │ Limit    ±5.0 g           │ │
│ │             deflection                    │ │                           │ │
│ │                                           │ │ ✓ PASS                    │ │
│ └───────────────────────────────────────────┘ └───────────────────────────┘ │
│                                                                             │
│ POSITION RESULTS                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Position      Load      Reading      Error      Limit      Result       │ │
│ │ Corner 1      10 kg     10.001 kg    +1 g      ±5 g       ✓ PASS        │ │
│ │ Corner 2      10 kg     10.003 kg    +3 g      ±5 g       ✓ PASS        │ │
│ │ Corner 3      10 kg     10.004 kg    +4 g      ±5 g       ⚠ MARGINAL    │ │
│ │ Corner 4      10 kg     10.006 kg    +6 g      ±5 g       ✕ FAIL        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌────────────────────────────┐ ┌────────────────────────────────────────┐  │
│ │ TEST SUMMARY               │ │ DEFLECTION / LOAD RESPONSE              │  │
│ │                            │ │                                        │  │
│ │ Worst position  Corner 4  │ │             ↗                          │  │
│ │ Worst error     +6.0 g    │ │         vector                         │  │
│ │ Legal limit     ±5.0 g    │ │                                        │  │
│ │                            │ │ Position response visualization        │  │
│ │ ✕ FAIL                    │ │                                        │  │
│ └────────────────────────────┘ └────────────────────────────────────────┘  │
│                                                                             │
│                         [ Continue to Repeatability → ]                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Geometry selector

The source explicitly defines these three modes: `Pasted markdown(20261004-065148).md`

```text id="buvb5g"
[ Square · 4 Corners ]
[ Round · 3 Supports ]
[ Rolling Load · >4 Supports ]
```

### Why this matters visually

The platform visualization should change when the geometry changes.

---

# 4. Square platform

Default demo:

```text id="98qws6"
        C1 ●────────────● C2
           │            │
           │            │
           │     ◉      │
           │            │
        C4 ●────────────● C3
```

Each corner becomes an interactive target.

---

# 5. Position states

### Untested

```text id="tc9z8p"
○ Corner 1
```

### Passed

```text id="e9v8jv"
● Corner 1
✓
```

### Near limit

```text id="wmx8xv"
● Corner 3
⚠
```

### Failed

```text id="9brh8v"
● Corner 4
✕
```

The source defines the dynamic transition between green, amber and crimson depending on the proportion of the legal limit. `Pasted markdown(20261004-065148).md`

---

# 6. Make the platter interactive

The operator should be able to click:

```text id="z0y4ru"
Corner 1
Corner 2
Corner 3
Corner 4
```

When clicked:

```text id="7x6ae8"
CURRENT POSITION

Corner 3
```

The corresponding row in the result table becomes selected.

Likewise, clicking a table row highlights the position on the platter.

This creates a very strong visual connection:

```text id="yl5zk9"
PHYSICAL POSITION
       ↕
DIGITAL RESULT
```

---

# 7. Current-position panel

Right-side card:

```text id="c2b5x7"
CURRENT POSITION

Corner 3

Target Load
10.000 kg

Observed Reading
10.004 kg

Calculated Error
+4.0 g

Legal Tolerance
±5.0 g

Margin
1.0 g

⚠ NEAR LIMIT
```

This is what the operator needs immediately.

---

# 8. Live capture

When the scale is connected:

```text id="pkapnl"
● STABLE
10.004 kg

[ Capture Position Reading ]
```

Clicking captures the value into Corner 3.

Then:

```text id="e5e1k5"
✓ Reading captured

Corner 3
+4.0 g
```

Toast:

```text id="cduspe"
✓ Corner 3 reading recorded
```

---

# 9. Manual entry

For testing without hardware:

```text id="wcx7j9"
Observed Reading

[ 10.004 ] kg

[ Capture Reading ]
```

Hardware capture remains the preferred visual action.

---

# 10. Load positioning instruction

Above the platter:

```text id="f8zo1j"
POSITION 3

Place the prescribed test load at the highlighted position.

Target:
10.000 kg
```

On the diagram:

```text id="a5ek27"
        ●────────●
        │        │
        │     ★  │ ← highlighted
        │        │
        ●────────●
```

This makes the physical procedure understandable even to someone unfamiliar with the test.

---

# 11. Position result table

Below:

```text id="c9b8xy"
POSITION RESULTS

┌────────────┬──────────┬─────────────┬──────────┬──────────┬─────────────┐
│ Position   │ Target   │ Reading     │ Error    │ Limit    │ Result      │
├────────────┼──────────┼─────────────┼──────────┼──────────┼─────────────┤
│ Corner 1   │ 10.000   │ 10.001      │ +1.0 g   │ ±5.0 g   │ ✓ PASS      │
│ Corner 2   │ 10.000   │ 10.003      │ +3.0 g   │ ±5.0 g   │ ✓ PASS      │
│ Corner 3   │ 10.000   │ 10.004      │ +4.0 g   │ ±5.0 g   │ ⚠ MARGINAL  │
│ Corner 4   │ 10.000   │ 10.006      │ +6.0 g   │ ±5.0 g   │ ✕ FAIL      │
└────────────┴──────────┴─────────────┴──────────┴──────────┴─────────────┘
```

Use the same visual language as the weighing page.

---

# 12. Worst-position detection

As readings are captured, automatically determine:

```text id="rruvm1"
WORST POSITION

Corner 4

Error
+6.0 g

Legal Limit
±5.0 g
```

Then highlight Corner 4 on the platter.

This should update automatically.

---

# 13. Platter heatmap

The source describes a visual transition:

```text id="ap9pkj"
≤ 50% MPE
→ safe

50-100% MPE
→ warning

> 100% MPE
→ failure
```

So the platter itself becomes the heatmap.

Conceptually:

```text id="hvsmh2"
          ●────────────●
          │            │
          │     ◉      │
          │            │
          ●────────────●
                   ↑
              problematic
```

The user shouldn't need to inspect the table first to understand where the problem is.

---

# 14. Deflection vector

The source specifically requires a **dynamic 2D deflection vector arrow** representing mechanical canting / torque twist. `Pasted markdown(20261004-065148).md`

Example:

```text id="t9f3ck"
               ↗
             ↗
           ↗
      ─────────────
      │            │
      │   PLATTER  │
      │            │
      ─────────────
```

Next to it:

```text id="4yzoa6"
Mechanical Response

Deflection
0.42°

Direction
Right-Rear

Status
⚠ Elevated
```

For a passing instrument:

```text id="0fkx8m"
Deflection
0.08°

✓ Within expected response
```

---

# 15. Important distinction

Don't make the vector look like an engineering CAD tool.

The purpose is:

> **show the judge/operator where the platform response is occurring.**

It is a visual explanation, not a replacement for metrological calculations.

---

# 16. Test summary

```text id="1gexb7"
ECCENTRICITY SUMMARY

Positions Tested
4 / 4

Worst Position
Corner 4

Worst Error
+6.0 g

Legal Limit
±5.0 g

Positions Passed
3

Positions Failed
1

OVERALL
✕ FAIL
```

---

# 17. Passing state

Example:

```text id="b4j8gz"
ECCENTRICITY SUMMARY

4 / 4 positions complete

Worst Position
Corner 3

Worst Error
+3.2 g

Legal Limit
±5.0 g

4 / 4 Passed

✓ PASS
```

---

# 18. Marginal state

```text id="j3p3vf"
ECCENTRICITY SUMMARY

4 / 4 positions complete

Worst Error
+4.7 g

Legal Limit
±5.0 g

⚠ MARGINAL

One position is close to the legal limit.
```

This is valuable because the operator can investigate before a genuine failure.

---

# 19. Failure state

```text id="4vbc9g"
ECCENTRICITY SUMMARY

4 / 4 positions complete

Worst Position
Corner 4

Worst Error
-6.2 g

Legal Limit
±5.0 g

✕ FAIL

Corner 4 exceeds the applicable limit.
```

The source provides a synthetic stress case where a specific corner exceeds MPE and produces a red hotspot. `Pasted markdown(20261004-065148).md`

---

# 20. Stress-demo scenario

For the hackathon, this is a great demonstration:

```text id="izc4hv"
Scenario:
Eccentricity Cantilever Twist
```

Load:

```text id="m4m7kg"
1/3 Maximum Capacity
```

Then:

```text id="c0aj1m"
Corner 1   +1.2 g   ✓
Corner 2   +0.8 g   ✓
Corner 3   +2.1 g   ✓
Corner 4   -6.2 g   ✕
```

The platter immediately shows:

```text id="82g3xk"
Corner 4 🔴
```

and the vector tilts toward that corner.

That makes the failure understandable **without reading a single formula**.

---

# 21. Round geometry

When:

```text id="5o8q1c"
Round · 3 Supports
```

the visual changes:

```text id="5y7mks"
             ●
          ╱     ╲
       ●─────◉────●
```

The labels and position list update accordingly.

Don't leave irrelevant square-corner terminology visible.

---

# 22. Rolling load geometry

For:

```text id="75iaiz"
Rolling Load · >4 Supports
```

use a path:

```text id="9a0cyl"
●──────●──────●──────●
       →
       LOAD PATH
```

The test-position model should become a sequence/path rather than pretending the instrument has four corners.

---

# 23. Completion progress

At the top-right:

```text id="e8q9zh"
3 / 4 positions complete
████████████████░░░░
```

or:

```text id="1tj5mw"
4 / 4 complete ✓
```

---

# 24. Missing position

If the user tries to continue:

```text id="k3r4dx"
⚠ Test incomplete

Corner 4 has not been recorded.

[ Record Corner 4 ]
```

Automatically focus/highlight Corner 4.

---

# 25. Invalid live reading

If the scale is unstable:

```text id="n6e7ex"
⚠ SCALE UNSTABLE

Current range
10.001 - 10.009 kg

Wait for a stable reading before capture.
```

Then:

```text id="yqv8m5"
[ Capture Reading ] ← disabled
```

---

# 26. Row trace

Each result row has:

```text id="czn6a0"
ⓘ Trace
```

Click → same calculation-proof modal pattern used in Weighing.

This ensures the user gets a consistent experience across tests.

---

# 27. Audit interaction

Each position gets:

```text id="hmc4s3"
⚑
```

Click:

```text id="3m1r1r"
Audit Comment

Position
Corner 4

Result
✕ FAIL

[ Mechanical Sag ]
[ Load Placement Concern ]
[ Re-test Required ]
[ Other ]

Comment
[________________________]

[ Add Comment ]
```

This reuses the same audit drawer pattern rather than creating a new interaction.

---

# 28. Bottom action

Successful completion:

```text id="kshoq6"
✓ Eccentricity test complete

All required positions have been recorded.

[ Save Test ]                [ Continue to Repeatability → ]
```

Failure:

```text id="ljl6z4"
✕ Eccentricity test failed

Corner 4 exceeds the applicable tolerance.

[ Inspect Failure ]          [ Save & Exit ]
```

---

# 29. Role behavior

### Metrologist

Can:

```text id="n0d0lr"
Select geometry
Capture readings
Edit current observation
Add findings
Save
Complete
```

### Reviewer

```text id="c9x9ov"
Read-only measurements

[ Inspect Trace ]
[ Audit Comment ]
```

### Director

Read-only.

### Auditor

Read-only.

This remains consistent with the source's role-specific permissions. `Pasted markdown(20261004-065148).md`

---

# 30. Traceability lockout

If standard weights become invalid:

```text id="f8l8jh"
🔒 TESTING LOCKED

Standard weight traceability is no longer valid.

Position readings cannot be captured until the
assigned standard is replaced or renewed.

[ Resolve Traceability → ]
```

The platter and existing observations remain visible, but new inputs are disabled.

---

# 31. Final screen composition

```text id="r3k1b8"
Eccentricity / Corner Loading

Avery ZM201 · AV-2026-8812
[Class III] 30 kg · e = 0.005 kg
✓ Traceability Valid

✓ Preflight → ✓ Inspection → ✓ Weighing
→ ● Eccentricity → ○ Repeatability → ○ Environmental → ○ Review

Geometry
[ ● Square · 4 Corners ]
[ ○ Round · 3 Supports ]
[ ○ Rolling Load · >4 Supports ]

Test Load
[ 10.000 kg ]                            ● STABLE 10.004 kg

┌──────────────────────────────────────┐ ┌────────────────────────────────┐
│ INTERACTIVE PLATTER                  │ │ CURRENT POSITION              │
│                                      │ │                                │
│        ●────────────●                │ │ Corner 3                       │
│        │            │                │ │                                │
│        │     ◉      │                │ │ Target       10.000 kg         │
│        │            │                │ │ Reading      10.004 kg         │
│        ●────────────●                │ │ Error        +4.0 g            │
│                     ↗                │ │ Limit        ±5.0 g            │
│               Deflection             │ │                                │
│                                      │ │ ⚠ MARGINAL                    │
└──────────────────────────────────────┘ └────────────────────────────────┘

Position Results

Corner 1     +1.0 g     ✓ PASS
Corner 2     +3.0 g     ✓ PASS
Corner 3     +4.0 g     ⚠ MARGINAL
Corner 4     +6.0 g     ✕ FAIL

┌──────────────────────────┐ ┌───────────────────────────────────────────┐
│ TEST SUMMARY             │ │ MECHANICAL RESPONSE                       │
│                          │ │                                           │
│ Worst: Corner 4         │ │             ↗                             │
│ Error: +6.0 g           │ │          deflection                        │
│ Limit: ±5.0 g           │ │                                           │
│                          │ │ Position / load response visualization   │
│ ✕ FAIL                  │ │                                           │
└──────────────────────────┘ └───────────────────────────────────────────┘

[ Save Test ]                  [ Continue to Repeatability → ]
```

## The mental model

This screen should feel like:

**PLACE LOAD → CAPTURE POSITION → SEE RESPONSE → COMPARE LIMIT → FIND WORST POSITION → VERDICT**

The particularly strong part is the linkage:

```text id="7mvx0m"
Physical platter position
        ↕
Captured reading
        ↕
Error
        ↕
Legal tolerance
        ↕
Visual heatmap
        ↕
Overall verdict
```

That directly reflects the source's prescribed eccentricity workspace with the three geometry modes, interactive platter visualization, color-coded position response, and deflection-vector visualization. `Pasted markdown(20261004-065148).md`

### Next

**Repeatability Test** - 10 sequential readings at the selected test load, zero-return tracking, horizontal scatter visualization, maximum/minimum error, total observed spread `Δ`, allowable limit, and final PASS/FAIL. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:24:31 PM

next

## Response:
10/4/2026, 6:24:43 PM · gpt-5-6-t-mini

> **Evaluated repeatability data and source values**
>
> 
>
> Worked for 4s

# NEXT - Repeatability Test

Now we move to **Step 05: Repeatability**.

This screen has a different purpose from Weighing Error. We are no longer asking:

> “Is the scale accurate at different loads?”

We are asking:

> **“When I repeat the same weighing under the same conditions, does the instrument give consistent results?”**

The source specifies a load selector for `0.5 Max`, `0.8 Max`, and `1.0 Max`, a 10-reading sequence with zero-return tracking, a horizontal SVG scatter plot, and a prominent spread `Δ` summary against the statutory limit. `Pasted markdown(20261004-065148).md`

---

# 1. 5-second mental model

The operator should instantly understand:

```text
CURRENT TEST
→ Repeatability

LOAD
→ 0.5 / 0.8 / 1.0 Max

REPEAT
→ 10 readings

ARE THEY CONSISTENT?
→ Look at spread Δ

IS IT WITHIN LIMIT?
→ PASS / FAIL

WHAT REMAINS?
→ Complete missing runs
```

---

# 2. Overall layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ SESSION HEADER                                                               │
│ Avery ZM201 · AV-2026-8812 · Class III · 30 kg · e = 0.005 kg              │
│ ✓ Traceability Valid                                                         │
│                                                                             │
│ ✓ Preflight → ✓ Inspection → ✓ Weighing → ✓ Eccentricity                  │
│ → ● Repeatability → ○ Environmental → ○ Review                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Repeatability Test                                      [ Save Test ]       │
│ Verify consistency across repeated measurements at a defined load.         │
│                                                                             │
│ TEST LOAD                                                                    │
│ [ ● 0.5 Max ] [ ○ 0.8 Max ] [ ○ 1.0 Max ]                                │
│                                                                             │
│ Selected Load                                                               │
│ 15.000 kg                                                                  │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 10-RUN SEQUENCE                                                         │ │
│ │                                                                         │ │
│ │ Run   Zero Return   Observed Reading   Error     Status                │ │
│ │ 01    0.000 kg      15.001 kg          +1.0 g    ✓                    │ │
│ │ 02    0.000 kg      15.002 kg          +2.0 g    ✓                    │ │
│ │ 03    0.001 kg      15.001 kg          +1.0 g    ✓                    │ │
│ │ ...                                                                     │ │
│ │ 10    0.000 kg      -                  -         [Capture]             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌───────────────────────────────────┐ ┌──────────────────────────────────┐ │
│ │ REPEATABILITY SUMMARY             │ │ READING DISPERSION               │ │
│ │                                   │ │                                  │ │
│ │ 8 / 10 readings                   │ │        • •  •                    │ │
│ │                                   │ │      •     •                     │ │
│ │ E max       +1.8 g                │ │   •    •       •                │ │
│ │ E min       +0.4 g                │ │                                  │ │
│ │ Spread Δ    1.4 g                 │ │ ───── allowable limit ─────     │ │
│ │ Limit       2.0 g                 │ │                                  │ │
│ │                                   │ │                                  │ │
│ │ ✓ WITHIN LIMIT                    │ │ 10 sequential observations       │ │
│ └───────────────────────────────────┘ └──────────────────────────────────┘ │
│                                                                             │
│ Zero-return summary                                                        │
│ ✓ Zero returned correctly after 8 / 8 completed cycles                     │
│                                                                             │
│                            [ Continue to Environmental Testing → ]          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Test-load selector

The source explicitly specifies these three choices. `Pasted markdown(20261004-065148).md`

```text
TEST LOAD

[ 0.5 Max ] [ 0.8 Max ] [ 1.0 Max ]
```

For the Avery 30 kg demo:

```text
0.5 Max → 15 kg
0.8 Max → 24 kg
1.0 Max → 30 kg
```

Once selected, the entire test context updates.

---

# 4. Selected-load context

Under the segmented control:

```text id="9fjkdu"
SELECTED TEST LOAD

15.000 kg

Maximum capacity
30.000 kg

Runs required
10
```

The operator should never wonder what load is currently being repeated.

---

# 5. Sequence progress

At the right:

```text
8 / 10 readings

████████████████░░░░
```

and:

```text
2 readings remaining
```

This is one of the first things the operator should see.

---

# 6. The 10-run table

The source requires a 10-reading sequence with zero-return tracking. `Pasted markdown(20261004-065148).md`

Use friendly labels rather than exposing only `I0`, `IL`, `P`, `Ec`.

```text
┌─────┬──────────────┬──────────────────┬──────────────┬─────────────┐
│ Run │ Zero Return  │ Observed Reading │ Error        │ Status      │
├─────┼──────────────┼──────────────────┼──────────────┼─────────────┤
│ 01  │ 0.000 kg     │ 15.001 kg        │ +1.0 g       │ ✓ PASS      │
│ 02  │ 0.000 kg     │ 15.002 kg        │ +2.0 g       │ ✓ PASS      │
│ 03  │ 0.001 kg     │ 15.001 kg        │ +1.0 g       │ ✓ PASS      │
│ 04  │ 0.000 kg     │ 15.003 kg        │ +3.0 g       │ ✓ PASS      │
│ 05  │ 0.000 kg     │ 15.002 kg        │ +2.0 g       │ ✓ PASS      │
│ 06  │ 0.000 kg     │ 15.001 kg        │ +1.0 g       │ ✓ PASS      │
│ 07  │ 0.001 kg     │ 15.002 kg        │ +2.0 g       │ ✓ PASS      │
│ 08  │ 0.000 kg     │ 15.003 kg        │ +3.0 g       │ ✓ PASS      │
│ 09  │ -            │ -                │ -            │ [ Capture ] │
│ 10  │ -            │ -                │ -            │ [ Capture ] │
└─────┴──────────────┴──────────────────┴──────────────┴─────────────┘
```

---

# 7. Why zero-return is visible

A particularly useful design choice:

```text
ZERO RETURN
✓ 0.000 kg
```

should be immediately understandable.

Tooltip:

```text
Zero Return

The instrument should return to its zero indication
before the next repeated measurement.
```

The underlying technical fields can still exist in the data model.

---

# 8. Capture workflow

For Run 09:

```text
Run 09

Zero Return
[ Capture Zero ]

Observed Reading
[ Capture Reading ]
```

But once hardware is connected:

```text
● STABLE
0.000 kg

[ Capture Zero Return ]
```

then:

```text
● STABLE
15.002 kg

[ Capture Test Reading ]
```

After both:

```text
✓ Run 09 recorded
```

---

# 9. Live-scale chip

Keep the same hardware context used on the Weighing screen:

```text
● STABLE
15.002 kg
```

or:

```text
● UNSTABLE
14.998 ↕ 15.006 kg
```

An unstable reading should not be captured.

---

# 10. Reading dispersion chart

This is the main visual.

The source specifies a horizontal SVG scatter plot showing all ten readings relative to the allowable tolerance band. `Pasted markdown(20261004-065148).md`

Concept:

```text
             READING DISPERSION

        +3g ─────────────────────────────
                    •   •
               •  •
        +2g ─────────────────────────────
                 •      •
             •      •
        +1g ─────────────────────────────
                •   •
        0g  ─────────────────────────────

             Run → 1 2 3 4 5 6 7 8 9 10
```

Better: plot each run horizontally against error.

---

# 11. Chart interaction

Hover:

```text
Run 06

Observed Reading
15.001 kg

Error
+1.0 g

Zero Return
0.000 kg
```

Click:

```text
→ highlights Run 06 in the table
```

And clicking the table row highlights the chart point.

Exactly the same interaction philosophy as the Weighing page.

---

# 12. Allowable band

The chart should make the threshold easy to see:

```text
Upper limit ─────────────────
             •  •
          •
Center ──────────────────────
       •    •   •
Lower limit ─────────────────
```

The user should understand:

> Are the readings tightly clustered or spreading dangerously?

---

# 13. Repeatability summary

This should be the **largest numerical card** on the page.

The source explicitly says to prominently display the spread `Δ = Emax - Emin` against the allowable limit. `Pasted markdown(20261004-065148).md`

```text
REPEATABILITY SUMMARY

Total Observed Spread

Δ
1.2 g

Allowable Limit
2.0 g

Margin
0.8 g

✓ PASS
```

This is much more important than making the user calculate the spread mentally.

---

# 14. Technical secondary information

Below:

```text
Maximum Error
+1.8 g

Minimum Error
+0.6 g

Number of Runs
10 / 10
```

Then:

```text
Δ = Emax - Emin
  = 1.8 g - 0.6 g
  = 1.2 g
```

But only as secondary evidence.

---

# 15. Source's example state

The source gives a repeatability presentation example:

```text
Total Observed Spread
Δ = 1.2 g

Allowable Statutory Limit
|MPE| = 2.0 g

Verdict
PASS - Spread within OIML Clause A.4.10 limit
```

`Pasted markdown(20261004-065148).md`

We can use this as the **standard dummy successful scenario**.

---

# 16. Pass state

```text
┌──────────────────────────────────────┐
│ REPEATABILITY RESULT                 │
│                                      │
│ Total Spread                         │
│ 1.2 g                                │
│                                      │
│ Allowable Limit                      │
│ 2.0 g                                │
│                                      │
│ Margin                               │
│ 0.8 g                                │
│                                      │
│ ✓ PASS                               │
│ Spread within allowable limit        │
└──────────────────────────────────────┘
```

---

# 17. Warning state

If close to the limit:

```text
┌──────────────────────────────────────┐
│ REPEATABILITY RESULT                 │
│                                      │
│ Total Spread                         │
│ 1.9 g                                │
│                                      │
│ Allowable Limit                      │
│ 2.0 g                                │
│                                      │
│ ⚠ NEAR LIMIT                         │
│                                      │
│ Review measurement consistency.      │
└──────────────────────────────────────┘
```

The amber state should tell the operator that the test is close to the threshold.

---

# 18. Fail state

```text
┌──────────────────────────────────────┐
│ REPEATABILITY RESULT                 │
│                                      │
│ Total Spread                         │
│ 2.4 g                                │
│                                      │
│ Allowable Limit                      │
│ 2.0 g                                │
│                                      │
│ ✕ FAIL                               │
│ Spread exceeds allowable limit.      │
└──────────────────────────────────────┘
```

The source's traffic-light rule uses crimson when the applicable tolerance is exceeded. `Pasted markdown(20261004-065148).md`

---

# 19. Zero-return summary

Small card:

```text
ZERO RETURN

Completed cycles
8 / 8

Correctly returned to zero
8

Exceptions
0

✓ Consistent
```

If an exception occurs:

```text
⚠ 2 zero-return anomalies

Run 04
+0.001 kg

Run 07
+0.001 kg
```

This gives the operator something concrete to investigate.

---

# 20. Run detail drawer

Click Run 05:

```text
┌───────────────────────────────────────────────────────────┐
│ Run 05                                             ×      │
│                                                           │
│ Zero Return                                               │
│ 0.000 kg                                                  │
│                                                           │
│ Test Load                                                 │
│ 15.000 kg                                                 │
│                                                           │
│ Observed Reading                                          │
│ 15.002 kg                                                 │
│                                                           │
│ Calculated Error                                          │
│ +2.0 g                                                    │
│                                                           │
│ Status                                                    │
│ ✓ PASS                                                    │
│                                                           │
│ Recorded                                                  │
│ 04 Oct 2026 · 15:36                                      │
└───────────────────────────────────────────────────────────┘
```

Keep the main screen uncluttered.

---

# 21. Audit comment

Each run should also allow:

```text
⚑
```

Click → existing audit drawer.

Example:

```text
Run 07

[ Low Margin Warning ]
[ Zero Return Anomaly ]
[ Re-test Required ]
[ Other ]
```

That reuses the system's existing audit interaction.

---

# 22. Load switching behavior

If the operator clicks:

```text
0.8 Max
```

warn only if there is existing data:

```text
Switch test load?

You have recorded 10 readings at 0.5 Max.

The current load dataset will be preserved.

[ Cancel ] [ Switch Load ]
```

Then show a separate run set for 0.8 Max.

This prevents accidental overwriting.

---

# 23. Multi-load state

If the workflow requires multiple repeatability loads, visually show:

```text
TEST LOADS

✓ 0.5 Max
10 / 10 complete

● 0.8 Max
4 / 10 complete

○ 1.0 Max
Not started
```

This gives a clean sense of progress without dumping all three tables on screen.

---

# 24. Completion logic

When all required runs are complete:

```text
✓ 10 / 10 readings recorded
```

Then calculate:

```text
Emax
Emin
Δ
Allowable Limit
Verdict
```

Only then enable:

```text
[ Continue to Environmental Testing → ]
```

---

# 25. Incomplete state

```text
⚠ TEST INCOMPLETE

2 readings remain.

[ Continue Recording ]
```

Forward navigation stays disabled.

---

# 26. Failed state

```text
✕ REPEATABILITY FAILED

Observed spread exceeds the allowable limit.

Δ
2.4 g

Limit
2.0 g

[ Inspect Readings ]
```

The user should be taken directly to the outlying readings.

---

# 27. Outlier highlighting

Suppose Run 09 is abnormal:

```text
Run 09
15.006 kg
+6.0 g
✕ FAIL
```

The chart point becomes easy to identify.

Table row:

```text
🔴 Run 09
```

Clicking it shows the exact reading.

This is much more useful than merely showing a red overall result.

---

# 28. Role behavior

### Metrologist

Can:

```text
Select test load
Capture readings
Edit runs
View chart
Save
Complete
```

### Reviewer

```text
Read-only data
Inspect runs
Add audit comments
```

### Director

Read-only.

### Auditor

Read-only.

The source's role model requires test-entry controls to be disabled for Reviewer/Director personas. `Pasted markdown(20261004-065148).md`

---

# 29. Traceability lockout

If standard weights become invalid:

```text
🔒 TESTING LOCKED

The assigned standard is no longer traceable.

Existing observations remain visible.
New readings cannot be captured.

[ Resolve Traceability → ]
```

---

# 30. Dummy data

For the normal passing demo:

```text
Test Load
15.000 kg

Runs
10

Readings
15.001
15.002
15.001
15.003
15.002
15.001
15.002
15.003
15.002
15.001

Emax
+3.0 g

Emin
+1.0 g

Spread
2.0 g
```

But for the **canonical source example**, use:

```text
Δ = 1.2 g
Limit = 2.0 g
PASS
```

because that is the source-provided reference presentation. `Pasted markdown(20261004-065148).md`

---

# 31. Final visual

```text
Repeatability Test

Avery ZM201 · AV-2026-8812
[Class III] 30 kg · e = 0.005 kg
✓ Traceability Valid

✓ Preflight → ✓ Inspection → ✓ Weighing → ✓ Eccentricity
→ ● Repeatability → ○ Environmental → ○ Review

TEST LOAD
[ ● 0.5 Max ] [ ○ 0.8 Max ] [ ○ 1.0 Max ]

Selected Load
15.000 kg

8 / 10 readings
████████████████░░░░

┌─────────────────────────────────────────────────────────────────────┐
│ 10-RUN SEQUENCE                                                     │
│                                                                     │
│ Run   Zero Return   Observed Reading   Error        Status          │
│ 01    0.000 kg      15.001 kg          +1.0 g       ✓ PASS          │
│ 02    0.000 kg      15.002 kg          +2.0 g       ✓ PASS          │
│ 03    0.001 kg      15.001 kg          +1.0 g       ✓ PASS          │
│ ...                                                                 │
│ 09    -             -                  -             [Capture]       │
│ 10    -             -                  -             [Capture]       │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┐ ┌──────────────────────────────────┐
│ REPEATABILITY SUMMARY           │ │ READING DISPERSION               │
│                                │ │                                  │
│ Total Spread                   │ │     •  •    •                    │
│                                │ │   •    •  •                      │
│ Δ      1.2 g                   │ │ •    •      •                    │
│                                │ │                                  │
│ Limit  2.0 g                   │ │ ───── allowable range ─────      │
│                                │ │                                  │
│ ✓ PASS                         │ │ 10 sequential runs              │
└────────────────────────────────┘ └──────────────────────────────────┘

ZERO RETURN
✓ Consistent across completed cycles

[ Save Test ]                  [ Continue to Environmental Testing → ]
```

## The mental model

This page should feel like:

**REPEAT → RECORD → SEE DISPERSION → CALCULATE SPREAD → COMPARE → PASS/FAIL**

The most important visual is not the 10-row table.

It is:

```text
10 readings
     ↓
dispersion
     ↓
Emax - Emin
     ↓
allowable limit
     ↓
✓ PASS / ✕ FAIL
```

That is exactly how the source frames Repeatability: a 10-reading sequence plus a visual scatter plot and a **prominent total observed spread `Δ` versus the allowable statutory limit**. 

### Next

**Environmental Drift & Tare** - a more complex specialized workspace with three sub-tabs: **Tare Accuracy**, **Temperature Drift**, and **Chamber HUD**, plus the laboratory environmental baseline. The source specifies the baseline fields and the temperature sequence `+20°C → +40°C → -10°C → +20°C`. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:25:24 PM

next

## Response:
10/4/2026, 6:25:42 PM · gpt-5-6-t-mini

> **Searched attached files for Screen 08 details**
>
> 
>
> Worked for a few seconds

# NEXT - Environmental Drift & Tare

Now we move to **Step 06: Environmental Drift & Tare**.

This is a more advanced testing workspace, so the key challenge is to make it **technically credible without becoming visually complicated**.

The source defines three sub-tabs:

```text
Tare Accuracy
Temperature Drift
Chamber HUD
```

and an ambient laboratory conditions card containing:

```text
Ambient Temperature (°C)
Relative Humidity (%)
Atmospheric Pressure (hPa)
```

It also specifies a temperature sequence:

```text
+20°C → +40°C → -10°C → +20°C
```

and tare verification against `±0.25e`. `Pasted markdown(20261004-065148).md`

---

# 1. 5-second mental model

The operator should immediately understand:

```text
WHAT ARE WE TESTING?
→ Tare + environmental stability

WHAT IS THE LAB CONDITION?
→ Temperature / humidity / pressure

WHAT IS THE CURRENT TEST?
→ Tare or temperature drift

WHAT IS HAPPENING IN THE CHAMBER?
→ Current target temperature + soak status

IS THE INSTRUMENT STABLE?
→ Trend + measured error

WHAT IS THE RESULT?
→ PASS / WARNING / FAIL
```

---

# 2. Overall layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ SESSION HEADER                                                               │
│ Avery ZM201 · AV-2026-8812 · Class III · 30 kg · e = 0.005 kg              │
│ ✓ Traceability Valid                                                         │
│                                                                             │
│ ✓ Preflight → ✓ Inspection → ✓ Weighing → ✓ Eccentricity                  │
│ → ✓ Repeatability → ● Environmental → ○ Review                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Environmental Drift & Tare                              [ Save Test ]       │
│ Verify tare behavior and weighing stability under environmental changes.   │
│                                                                             │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ AMBIENT LABORATORY CONDITIONS                                          │ │
│ │                                                                        │ │
│ │ Temperature       Relative Humidity       Atmospheric Pressure         │ │
│ │ 23.4 °C           48 %                    1013 hPa                     │ │
│ │                                                                        │ │
│ │ ✓ Baseline captured                                     [ Refresh ]    │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ [ ● Tare Accuracy ] [ ○ Temperature Drift ] [ ○ Chamber HUD ]             │
│                                                                             │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                        │ │
│ │                    ACTIVE SUB-TEST                                     │ │
│ │                                                                        │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌───────────────────────┐ ┌──────────────────────────────────────────────┐ │
│ │ TEST SUMMARY          │ │ LIVE TREND / CHAMBER STATUS                  │ │
│ │                       │ │                                              │ │
│ │ Result                │ │                                              │ │
│ │ ✓ PASS                │ │                                              │ │
│ └───────────────────────┘ └──────────────────────────────────────────────┘ │
│                                                                             │
│                      [ Continue to Review → ]                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Ambient Laboratory Conditions

This card should always appear at the top because environmental testing needs context.

The source explicitly calls for automatic lab baseline population. `Pasted markdown(20261004-065148).md`

```text
AMBIENT LABORATORY CONDITIONS

Temperature
23.4 °C

Relative Humidity
48 %

Atmospheric Pressure
1013 hPa

✓ Baseline Captured
04 Oct 2026 · 16:12

[ Refresh Reading ]
```

---

# 4. Baseline state

Normal:

```text
✓ BASELINE CAPTURED
```

Warning:

```text
⚠ BASELINE STALE

Last captured 26 min ago.

[ Refresh ]
```

Missing:

```text
✕ BASELINE NOT RECORDED

Environmental testing cannot begin.

[ Capture Baseline ]
```

Keep the message direct.

---

# 5. Sub-tab architecture

The three tabs should be extremely clear:

```text
┌────────────────┬──────────────────────┬──────────────────┐
│ Tare Accuracy  │ Temperature Drift    │ Chamber HUD      │
└────────────────┴──────────────────────┴──────────────────┘
```

Selected:

```text
● Tare Accuracy
```

The user should never feel lost inside nested technical screens.

---

# TAB 1 - Tare Accuracy

# 6. Purpose

The page should communicate:

> **How accurately does the instrument handle tare?**

The source defines additive and subtractive tare verification with the stated `±0.25e` criterion. `Pasted markdown(20261004-065148).md`

---

# 7. Tare test layout

```text
┌───────────────────────────────────────────────────────────────┐
│ TARE ACCURACY                                                │
│ Verify additive and subtractive tare behavior.               │
│                                                               │
│ Applicable tolerance                                         │
│ ±0.25e                                                        │
│                                                               │
│ Instrument interval                                           │
│ e = 0.005 kg                                                  │
│                                                               │
│ Calculated limit                                              │
│ ±0.00125 kg                                                   │
└───────────────────────────────────────────────────────────────┘
```

Then:

```text
TARE PROCEDURE

01  Zero the instrument
02  Apply tare
03  Record indication
04  Remove load
05  Verify zero return
```

Don't show the procedure as a paragraph.

Use a compact step sequence.

---

# 8. Additive tare

```text
ADDITIVE TARE

Initial Zero
0.000 kg

Applied Tare
2.000 kg

Observed Tare
2.000 kg

Calculated Error
0.0 g

Limit
±1.25 g

✓ PASS
```

---

# 9. Subtractive tare

```text
SUBTRACTIVE TARE

Initial Load
5.000 kg

Tare Applied
2.000 kg

Observed Net
3.000 kg

Calculated Error
+0.5 g

Limit
±1.25 g

✓ PASS
```

The exact numerical example should come from backend/mock test data later; the UI should not hard-code assumptions about actual statutory values beyond what the source provides.

---

# 10. Tare result card

```text
┌──────────────────────────────────┐
│ TARE ACCURACY RESULT             │
│                                  │
│ Additive          ✓ PASS         │
│ Subtractive       ✓ PASS         │
│                                  │
│ Worst Error       0.5 g          │
│ Allowable Limit   1.25 g         │
│                                  │
│ ✓ PASS                           │
└──────────────────────────────────┘
```

---

# 11. Tare failure

```text
✕ TARE ACCURACY FAILED

Observed error
1.7 g

Allowable limit
1.25 g

Subtractive tare exceeds the applicable limit.

[ Inspect Measurement ]
```

---

# TAB 2 - Temperature Drift

# 12. Purpose

This is the most visually interesting sub-test.

The source defines the temperature loop as:

```text
+20°C
↓
+40°C
↓
-10°C
↓
+20°C
```

`Pasted markdown(20261004-065148).md`

The UI should present this as a **controlled thermal journey**, not four unrelated measurements.

---

# 13. Thermal sequence header

```text
TEMPERATURE DRIFT

Thermal test sequence

✓ +20°C Reference
● +40°C High
○ -10°C Low
○ +20°C Recovery
```

Use the stepper idea again, but smaller than the global seven-step session stepper.

---

# 14. Current temperature state

Example:

```text
CURRENT CHAMBER CONDITION

Target
+40.0 °C

Actual
+39.7 °C

Difference
-0.3 °C

Soak
18:42 / 20:00

● SOAK IN PROGRESS
```

This is much easier to understand than showing raw chamber telemetry.

---

# 15. Thermal sequence visualization

```text
+20°C             +40°C              -10°C              +20°C
  ● ─────────────── ● ──────────────── ○ ─────────────── ○
 COMPLETE             CURRENT             PENDING           PENDING
```

When complete:

```text
✓ +20°C
✓ +40°C
● -10°C
○ +20°C
```

---

# 16. Temperature drift chart

Use a clean SVG line chart:

```text
Error
 +5g ───────────────────────────────────
          •
       •     •
 +2g ──────── allowable ────────────────
             •      •
  0 ────────────────────────────────────
         +20   +40   -10   +20
```

The point should represent instrument error, while the horizontal axis represents thermal stages.

Hover:

```text
+40°C Stage

Temperature
39.7°C

Observed Error
+3.8 g

Status
✓ PASS
```

---

# 17. Environmental timeline

A strong design element:

```text
TEST TIMELINE

16:21  +20°C
       Reference captured ✓

17:03  +40°C
       Soak complete ✓
       Error +3.8 g ✓

17:49  -10°C
       Soak in progress ●

-      +20°C
       Recovery pending
```

This gives the test a clear narrative.

---

# 18. Thermal status

Three levels:

```text
HEATING
SOAKING
STABLE
```

Example:

```text
🔥 HEATING
Target +40°C
Actual +36.8°C
```

Then:

```text
◌ SOAKING
Target +40°C
Actual +39.9°C
Remaining 04:12
```

Finally:

```text
✓ STABLE
Target +40°C
Actual +40.0°C
Soak complete
```

---

# 19. Chamber HUD sub-tab

Now the third tab.

The source specifically describes this as a thermal chamber environmental monitor with a live soak-duration timer. `Pasted markdown(20261004-065148).md`

This should feel like a **lab equipment monitoring panel**.

---

# TAB 3 - Chamber HUD

# 20. Overall layout

```text
CHAMBER HUD

┌────────────────────────────────┐ ┌────────────────────────────────┐
│ CHAMBER STATUS                 │ │ LIVE ENVIRONMENT               │
│                                │ │                                │
│ ● ACTIVE                       │ │ Temperature       +39.8 °C    │
│                                │ │ Humidity           41 %        │
│ Target             +40.0°C     │ │ Pressure        1011 hPa      │
│ Actual             +39.8°C     │ │                                │
│                                │ │ ✓ Stable                        │
│ Soak              18:42        │ │                                │
│ Required          20:00        │ │                                │
└────────────────────────────────┘ └────────────────────────────────┘
```

---

# 21. Large soak timer

This deserves visual emphasis:

```text
SOAK TIMER

18:42

of 20:00
```

Progress:

```text
██████████████████░░
```

When complete:

```text
✓ SOAK COMPLETE

20:00 / 20:00
```

---

# 22. Chamber state machine

```text
IDLE
 ↓
PREPARING
 ↓
HEATING / COOLING
 ↓
TARGET REACHED
 ↓
SOAKING
 ↓
STABLE
 ↓
CAPTURE
```

The UI changes based on the current state.

---

# 23. Chamber disconnected state

```text
⚠ CHAMBER DISCONNECTED

Live environmental data unavailable.

Last received:
+38.9°C · 42% RH · 1012 hPa

[ Reconnect Chamber ]
```

Don't fake live telemetry when hardware isn't available.

For demo mode, explicitly label:

```text
DEMO SIMULATOR
```

---

# 24. Demo mode

Because we need the hackathon demo to work without a physical chamber:

```text
● DEMO SIMULATOR

[ Simulate +20°C ]
[ Simulate +40°C ]
[ Simulate -10°C ]
[ Simulate Recovery ]
```

The source provides a scenario-driven frontend concept, so this can be part of the dummy-data layer without pretending it is live laboratory hardware.

---

# 25. Temperature drift result

After the complete sequence:

```text
┌─────────────────────────────────────────────┐
│ TEMPERATURE DRIFT RESULT                    │
│                                             │
│ +20°C Reference      ✓                      │
│ +40°C High           ✓                      │
│ -10°C Low            ✓                      │
│ +20°C Recovery       ✓                      │
│                                             │
│ Maximum Drift        +3.2 g                 │
│ Applicable Limit     ±5.0 g                 │
│                                             │
│ ✓ PASS                                      │
└─────────────────────────────────────────────┘
```

Again, actual values should ultimately come from the test engine.

---

# 26. Failure state

```text
✕ TEMPERATURE DRIFT FAILED

Stage
+40°C

Observed drift
+6.4 g

Applicable limit
±5.0 g

The instrument exceeded the allowable
environmental drift during the high-temperature stage.

[ Inspect Stage ]
```

The source explicitly defines a synthetic temperature-span-drift failure scenario. `Pasted markdown(20261004-065148).md`

---

# 27. Failure visualization

On the chart:

```text
+MPE ───────────────────────
                       ●
                   ← FAIL
  0 ───────────────────────
           ●
-MPE ───────────────────────

       +20   +40   -10   +20
```

The bad temperature stage should become the obvious focal point.

---

# 28. Recovery stage

An important visual:

```text
RECOVERY

-10°C
  ↓
+20°C

Current
+16.8°C

Status
↻ Recovering
```

Then:

```text
✓ Reference temperature restored
```

---

# 29. Ambient vs chamber

Don't mix these values.

Clearly label:

```text
LAB BASELINE
23.4°C

CHAMBER
39.8°C
```

This is an important distinction for usability.

---

# 30. Bottom summary

Regardless of sub-tab:

```text
ENVIRONMENTAL TEST SUMMARY

Tare Accuracy        ✓ PASS
Temperature Drift    ✓ PASS
Chamber Sequence     ✓ COMPLETE

Overall
✓ PASS
```

Or:

```text
Temperature Drift
✕ FAIL

Overall Environmental Test
✕ FAIL
```

---

# 31. Completion logic

For Tare:

```text
Required measurements
✓ Additive
✓ Subtractive
```

For Temperature:

```text
✓ +20°C
✓ +40°C
✓ -10°C
✓ +20°C recovery
```

For Chamber:

```text
✓ All required soak stages complete
```

Only after the applicable tests are complete should:

```text
[ Continue to Review → ]
```

become available.

---

# 32. Environmental anomalies

Use a compact alert:

```text
⚠ ENVIRONMENTAL ANOMALY

Temperature overshoot:
+40.8°C

Target:
+40.0°C

[ Inspect Chamber Event ]
```

This is better than dumping raw logs on the operator.

---

# 33. Technical details drawer

For an expert user:

```text
Environmental Trace

Timestamp
04 Oct 2026 17:04:21

Target
40.0°C

Measured
39.8°C

RH
41.2%

Pressure
1011.4 hPa

Instrument Error
+3.8 g
```

The main UI stays simple while technical evidence remains available.

---

# 34. Role behavior

### Metrologist

Can:

```text
Run test
Capture measurements
Start/stop simulation
Record observations
Complete test
```

### Reviewer

Can:

```text
View environmental data
Inspect trace
Add audit comment
```

but cannot alter measurements.

### Director / Auditor

Read-only.

This remains consistent with the source's role restrictions. `Pasted markdown(20261004-065148).md`

---

# 35. Traceability lockout

When the standard-weight traceability fails:

```text
🔒 TESTING LOCKED

Environmental measurements cannot be recorded
while the assigned traceable standard is invalid.

Existing observations remain available for review.

[ Resolve Traceability → ]
```

---

# 36. Dummy-data passing scenario

Use:

```text
Ambient
23.4°C
48%
1013 hPa

Tare
PASS

Temperature stages
+20°C    PASS
+40°C    PASS
-10°C    PASS
+20°C    PASS

Maximum drift
3.2 g

Overall
PASS
```

---

# 37. Dummy-data failure scenario

Use the canonical thermal failure scenario:

```text
+20°C
✓ PASS

+40°C
✕ FAIL
Drift beyond allowable limit

-10°C
-

+20°C Recovery
-
```

The page should stop the sequence and clearly explain:

```text
Testing halted at +40°C due to statutory failure.
```

That corresponds to the source's defined temperature-span drift failure demonstration. `Pasted markdown(20261004-065148).md`

---

# 38. Final screen

```text
Environmental Drift & Tare

Avery ZM201 · AV-2026-8812
[Class III] 30 kg · e = 0.005 kg
✓ Traceability Valid

✓ Preflight → ✓ Inspection → ✓ Weighing → ✓ Eccentricity
→ ✓ Repeatability → ● Environmental → ○ Review

┌──────────────────────────────────────────────────────────────────────┐
│ AMBIENT LABORATORY CONDITIONS                                       │
│                                                                      │
│ Temperature       23.4 °C                                           │
│ Relative Humidity 48 %                                               │
│ Pressure          1013 hPa                                           │
│                                                                      │
│ ✓ Baseline Captured                               [Refresh]          │
└──────────────────────────────────────────────────────────────────────┘

[ ● Tare Accuracy ] [ Temperature Drift ] [ Chamber HUD ]

┌──────────────────────────────────────────────────────────────────────┐
│ TARE ACCURACY                                                       │
│                                                                      │
│ Additive Tare       ✓ PASS                                           │
│ Subtractive Tare    ✓ PASS                                           │
│                                                                      │
│ Worst Error         0.5 g                                            │
│ Allowable Limit     1.25 g                                          │
│                                                                      │
│ ✓ PASS                                                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐ ┌─────────────────────────────────────┐
│ TEST SEQUENCE                │ │ TEMPERATURE TREND                  │
│                              │ │                                     │
│ ✓ +20°C Reference           │ │       •                            │
│ ✓ +40°C High                │ │    •       •                       │
│ ● -10°C Low                 │ │ •            •                     │
│ ○ +20°C Recovery            │ │                                     │
└──────────────────────────────┘ └─────────────────────────────────────┘

ENVIRONMENTAL TEST SUMMARY

Tare Accuracy        ✓ PASS
Temperature Drift    ✓ PASS
Chamber Sequence     ✓ COMPLETE

Overall
✓ PASS

[ Save Test ]                  [ Continue to Review → ]
```

## The mental model

This screen should feel like:

**CAPTURE BASELINE → RUN TARE → CONTROL TEMPERATURE → WATCH RESPONSE → ANALYZE DRIFT → PASS/FAIL**

And the internal hierarchy should always be:

```text
LAB CONDITION
      ↓
CURRENT ENVIRONMENT
      ↓
INSTRUMENT RESPONSE
      ↓
TREND
      ↓
LIMIT
      ↓
VERDICT
```

The source supports exactly this three-tab architecture-**Tare Accuracy, Temperature Drift, Chamber HUD**-with the environmental baseline and thermal sequence described above. `Pasted markdown(20261004-065148).md`

### Next

**Standard Weights & Traceability** - the assurance screen and the application's most important safety gate: weight-set registry, calibration validity, traceability certificates, expiration countdowns, status filtering, usage history, and the hard red testing lockout when a standard becomes invalid. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:26:30 PM

next

## Response:
10/4/2026, 6:26:49 PM · gpt-5-6-t-mini

# NEXT - Standard Weights & Traceability

Now we move to the **Assurance layer**.

This page is not another testing screen. It is the place where METROLOGIX-76 answers one critical question:

> **“Are the reference weights being used for testing currently valid and traceable?”**

The source defines a registry of laboratory standard weight sets-**E1, E2, F1, M1**-with calibration-validity countdowns, plus a **hard lockout** when an assigned standard is expired. `Pasted markdown(20261004-065148).md`

This page therefore needs to feel more like a **metrology asset / traceability register** than a normal settings page.

---

# 1. 5-second mental model

The operator should instantly see:

```text
WHAT IS THE STANDARD?
→ E2-014

IS IT VALID?
→ ✓ Valid

WHEN DOES IT EXPIRE?
→ 42 days

WHAT IS IT TRACEABLE TO?
→ Calibration certificate

IS ANYTHING BLOCKING TESTING?
→ No / Yes

WHAT DO I DO?
→ Select / inspect / resolve
```

---

# 2. Overall page

```text id="d8k3nq"
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                       │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ SIDEBAR       │ Standards / Traceability                                    │
│               │                                                              │
│ WORK          │ Standard Weights & Traceability              [ + Add Set ] │
│   Home        │ Maintain laboratory reference standards used during        │
│   Sessions    │ verification testing.                                     │
│   Instruments │                                                              │
│               │ ┌────────────────────────────────────────────────────────┐ │
│ ASSURANCE     │ │ TRACEABILITY STATUS                                     │ │
│   Review      │ │                                                        │ │
│ ● Standards   │ │ ✓ ALL ACTIVE STANDARDS VALID                            │ │
│   Audit       │ │ 6 standard sets · 0 blocked                             │ │
│               │ └────────────────────────────────────────────────────────┘ │
│ OUTPUT        │                                                              │
│   Reports     │ [All] [E1] [E2] [F1] [M1] [Expiring] [Expired]             │
│               │                                                              │
│               │ [ Search weight set / certificate... ]   [Sort ▾]         │
│               │                                                              │
│               │ ┌──────────────────────────────────────────────────────┐  │
│               │ │ E2-014                                                │  │
│               │ │ Class E2 Standard Weight Set                          │  │
│               │ │                                                        │  │
│               │ │ ✓ VALID          42 days remaining                    │  │
│               │ │ Calibration: NABL-2026-01482                         │  │
│               │ │ Last calibration: 12 Aug 2026                        │  │
│               │ │                                                        │  │
│               │ │ [ View Details ] [ Select for Testing ]               │  │
│               │ └──────────────────────────────────────────────────────┘  │
│               │                                                              │
│               │ ┌──────────────────────────────────────────────────────┐  │
│               │ │ F1-008                                                │  │
│               │ │ Precision Reference Set                              │  │
│               │ │                                                        │  │
│               │ │ ⚠ EXPIRING         5 days remaining                  │  │
│               │ │                                                        │  │
│               │ │ [ View Details ]                                      │  │
│               │ └──────────────────────────────────────────────────────┘  │
│               │                                                              │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

---

# 3. Page header

```text id="8v69hv"
Standards

Standard Weights & Traceability

Manage reference standards, calibration validity and testing eligibility.
```

Right:

```text
[ + Add Standard Set ]
```

For the hackathon demo, this can remain secondary.

---

# 4. Global status banner

This should be the first thing after the page title.

### Everything valid

```text id="z7i1p7"
┌──────────────────────────────────────────────────────────────────┐
│ ✓ TRACEABILITY HEALTHY                                           │
│ All active laboratory standard weight sets are currently valid. │
└──────────────────────────────────────────────────────────────────┘
```

### Expiring

```text id="0ijg0t"
┌──────────────────────────────────────────────────────────────────┐
│ ⚠ TRACEABILITY ATTENTION                                        │
│ 1 standard weight set expires within 7 days.                    │
│                                                                  │
│ [ View Expiring Standards → ]                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Expired

This is much more serious:

```text id="9m9c8k"
┌──────────────────────────────────────────────────────────────────┐
│ ✕ TRACEABILITY FAILURE                                           │
│ 1 standard weight set has expired.                              │
│                                                                  │
│ Any verification session using that standard is blocked.        │
│                                                                  │
│ [ Resolve Traceability → ]                                      │
└──────────────────────────────────────────────────────────────────┘
```

The source specifically requires expired standard weights to trigger a hard, non-dismissible lockout across testing screens. `Pasted markdown(20261004-065148).md`

---

# 5. Filter bar

Keep it simple:

```text id="8rb3m1"
[ All 6 ] [ E1 1 ] [ E2 2 ] [ F1 2 ] [ M1 1 ]
[ Expiring 1 ] [ Expired 0 ]
```

Then:

```text
⌕ Search standard, ID or certificate
```

and:

```text
Sort
[ Expiry Date ▾ ]
```

---

# 6. Standard-weight card

The core reusable object is:

```text id="jzey75"
┌──────────────────────────────────────────────────────────────┐
│ E2-014                                                       │
│ Class E2 Standard Weight Set                                │
│                                                              │
│ ✓ VALID                                                       │
│                                                              │
│ Calibration validity                                         │
│ 42 days remaining                                             │
│ █████████████████░░░                                         │
│                                                              │
│ Certificate                                                   │
│ NABL-2026-01482                                               │
│                                                              │
│ Last calibrated                                               │
│ 12 Aug 2026                                                   │
│                                                              │
│ Used by active sessions                                       │
│ 4                                                             │
│                                                              │
│ [ View Details ]                           [ Select → ]       │
└──────────────────────────────────────────────────────────────┘
```

---

# 7. Validity countdown

This is important enough to display prominently.

### Healthy

```text
42 days remaining
```

### Expiring

```text
5 days remaining
```

### Today

```text
Expires today
```

### Expired

```text
Expired 2 days ago
```

Don't rely only on color. Always show the actual date/countdown.

---

# 8. Standard classes

The source specifically identifies:

```text id="dk2si1"
E1
E2
F1
M1
```

Use a consistent `StatusPill`-style component.

Example:

```text
[E2]
```

and then the human-readable description:

```text
Class E2 Standard Weight Set
```

---

# 9. Detail drawer

Click:

```text
View Details
```

instead of navigating away.

Drawer:

```text id="jv1kqc"
┌───────────────────────────────────────────┐
│ E2-014                              ×      │
│                                           │
│ Class E2 Standard Weight Set              │
│                                           │
│ TRACEABILITY                              │
│ ✓ Valid                                   │
│                                           │
│ Calibration Certificate                   │
│ NABL-2026-01482                           │
│                                           │
│ Calibrated                                │
│ 12 Aug 2026                               │
│                                           │
│ Valid Until                               │
│ 12 Dec 2026                               │
│                                           │
│ Laboratory                               │
│ RRSL Bengaluru                            │
│                                           │
│ Reference / Certificate                   │
│ [ View Certificate ]                      │
│                                           │
│ Usage History                             │
│ 24 verification sessions                  │
│                                           │
│ [ Close ]                                 │
└───────────────────────────────────────────┘
```

This is consistent with the progressive-disclosure approach we've used everywhere else.

---

# 10. Traceability certificate

Inside the detail view:

```text id="7tmxj8"
TRACEABILITY CERTIFICATE

Certificate
NABL-2026-01482

Standard Class
E2

Set ID
E2-014

Calibration Date
12 Aug 2026

Valid Until
12 Dec 2026

[ Open Certificate ]
[ Download Certificate ]
```

The goal is to make the chain of trust visible.

---

# 11. Usage history

Another detail tab:

```text id="r8w89x"
USAGE HISTORY

Date        Session          Operator       Result
03 Oct      SES-0041         Metrologist    PASS
02 Oct      SES-0038         Metrologist    PASS
30 Sep      SES-0031         Metrologist    PASS
28 Sep      SES-0027         Reviewer       PASS
```

This becomes especially useful later in the Audit layer.

---

# 12. Select standard for testing

The most important operational interaction:

```text id="f5p5q1"
[ Select for Testing ]
```

Click:

```text id="4mi84e"
Select Standard Weight Set

E2-014
Class E2
✓ Valid
42 days remaining

This standard will be associated with the active verification session.

[ Cancel ]                [ Confirm Selection ]
```

After selection:

```text id="2gz5a5"
✓ Standard selected

E2-014 is now assigned to
SES-2026-0046.
```

---

# 13. Currently assigned indicator

On the card:

```text id="49okg9"
● CURRENTLY ASSIGNED

SES-2026-0046
```

This prevents operators from accidentally switching standards without realizing which session is affected.

---

# 14. Expiring card

Example:

```text id="dijmgl"
┌────────────────────────────────────────────────────────────┐
│ F1-008                                                     │
│ Class F1 Precision Reference Set                          │
│                                                            │
│ ⚠ EXPIRING                                                │
│                                                           │
│ 5 days remaining                                           │
│ █████████████████████░                                     │
│                                                            │
│ Valid until 09 Oct 2026                                   │
│                                                            │
│ [ Review Certificate ]                                    │
└────────────────────────────────────────────────────────────┘
```

Don't block testing yet if the standard is still valid.

---

# 15. Expired card

```text id="a2x3qi"
┌────────────────────────────────────────────────────────────┐
│ M1-003                                                     │
│ Class M1 Standard Weight Set                              │
│                                                            │
│ ✕ EXPIRED                                                 │
│                                                            │
│ Expired 2 days ago                                        │
│                                                            │
│ TESTING ASSIGNMENT BLOCKED                                │
│                                                            │
│ [ Replace Standard ]                                      │
└────────────────────────────────────────────────────────────┘
```

---

# 16. Hard lockout behavior

This is the most important interaction in this page.

If a standard being used by an active session expires, show:

```text id="zv0l3s"
┌───────────────────────────────────────────────────────────────────────┐
│ 🔒 TESTING LOCKED                                                     │
│                                                                       │
│ Session SES-2026-0046 is assigned to expired standard M1-003.         │
│                                                                       │
│ Measurement capture has been disabled.                               │
│                                                                       │
│ Replace the standard before testing can continue.                     │
│                                                                       │
│ [ Select Valid Standard → ]                                          │
└───────────────────────────────────────────────────────────────────────┘
```

This should be **non-dismissible**.

That's explicitly part of the source requirement. `Pasted markdown(20261004-065148).md`

---

# 17. Why locked?

Clicking:

```text
Why is testing locked?
```

opens:

```text id="q7lzwf"
Traceability Requirement

Assigned Standard
M1-003

Status
Expired

Testing status
BLOCKED

Resolution
Assign a currently valid traceable standard.

[ Resolve Now ]
```

---

# 18. Replacing a standard

Click:

```text id="4r2h0v"
Select Valid Standard
```

Then:

```text id="jm2xp7"
Available Standards

○ E2-014
  ✓ Valid · 42 days

○ F1-008
  ⚠ Expiring · 5 days

○ E1-002
  ✓ Valid · 129 days

● M1-003
  ✕ Expired
```

Only valid standards can be selected.

---

# 19. Important safety rule

Never allow:

```text
✕ Expired
```

to be selectable.

Likewise, don't allow the operator to bypass the block with:

```text
[ Continue Anyway ]
```

There should be no such action in the UI.

---

# 20. Add Standard Set

For Admin:

```text id="z8m5q9"
+ Add Standard Set
```

opens:

```text id="1oj0mx"
Add Standard Weight Set

Standard Class
[ E2 ▾ ]

Set Identifier
[ E2-015 ]

Calibration Certificate
[ Upload ]

Calibration Date
[ 04 Oct 2026 ]

Valid Until
[ 04 Oct 2027 ]

[ Cancel ] [ Add Standard Set ]
```

This is an Admin operation, not a Metrologist workflow.

---

# 21. Admin-only controls

Admin can see:

```text id="at1ji1"
[ + Add Standard Set ]
[ Edit Metadata ]
[ Update Certificate ]
[ Retire Standard ]
```

Metrologist sees:

```text id="xse8gc"
[ View Details ]
[ Select for Testing ]
```

Reviewer/Auditor:

```text id="oaj3kw"
[ View Details ]
```

The role structure remains aligned with the specification. `Pasted markdown(20261004-065148).md`

---

# 22. Retired standard

Add a quieter state:

```text id="n0e7h8"
○ RETIRED
```

It stays visible historically but cannot be assigned to testing.

---

# 23. Empty state

If no standards are registered:

```text id="p59cce"
┌──────────────────────────────────────────────────────┐
│                                                      │
│             No standard weights registered           │
│                                                      │
│ Add a traceable laboratory reference standard        │
│ before starting verification work.                   │
│                                                      │
│                  [ + Add Standard Set ]              │
└──────────────────────────────────────────────────────┘
```

---

# 24. Search empty state

```text
No standard weights match "E2-999".

[ Clear Search ]
```

Again, don't confuse this with the registry actually being empty.

---

# 25. Summary metrics

Small row at the top:

```text id="y1o1qk"
6
Active Sets

5
Valid

1
Expiring

0
Expired
```

If something expires:

```text id="td95os"
6
Active Sets

4
Valid

1
Expiring

1
Expired
```

Then the overall banner becomes red.

---

# 26. Traceability health

Could be visualized as:

```text id="9pn1f8"
TRACEABILITY HEALTH

████████████████████
100%

6 / 6 currently valid
```

But don't make it look like an executive KPI.

The actual cards and expiration dates matter more.

---

# 27. Standard card → active sessions

Useful contextual line:

```text
Used in
4 active sessions
```

Click:

```text
View Assigned Sessions →
```

Then:

```text id="j2m2mm"
Sessions using E2-014

SES-0046   Weighing       ACTIVE
SES-0044   Repeatability  ACTIVE
SES-0042   Review         REVIEW
SES-0039   Approved       READ ONLY
```

This gives traceability context without cluttering the main card.

---

# 28. Certificate verification

The source emphasizes traceability certificates.

The UI should provide:

```text
Certificate
NABL-2026-01482

✓ Certificate available

[ View ]
```

For demo purposes, clicking it can open a polished certificate preview.

---

# 29. Expiry warnings

Use a predictable hierarchy:

```text
> 30 days       ✓ VALID
8-30 days       ✓ VALID · EXPIRING SOON
≤ 7 days        ⚠ EXPIRING
Expired         ✕ EXPIRED
```

The exact threshold logic can later come from backend configuration; the important thing now is the UI state model.

---

# 30. Dummy registry

Use a realistic registry:

```text id="5g0qei"
E1-002
Class E1
129 days
VALID

E2-014
Class E2
42 days
VALID

E2-018
Class E2
71 days
VALID

F1-008
Class F1
5 days
EXPIRING

F1-011
Class F1
88 days
VALID

M1-003
Class M1
Expired
EXPIRED
```

This gives us all states during development.

---

# 31. Demo scenario

For the hackathon:

### Normal demo

```text
E2-014
✓ Valid
42 days
```

Then demonstrate:

```text
M1-003
✕ Expired
```

Click it.

Show:

```text
TESTING LOCKED
```

Then:

```text
Select E2-014
```

and instantly restore:

```text
✓ TRACEABILITY VALID
```

That is a **very strong trust/safety demonstration**.

---

# 32. What NOT to put on this page

Do not put:

```text
❌ weighing observations
❌ OIML measurement formulas
❌ temperature tests
❌ certificates repository
❌ audit hashes
❌ giant calibration spreadsheets
❌ live scale readings
```

Those belong elsewhere.

This page has one responsibility:

> **Manage and prove the validity of the physical standards used to perform measurements.**

---

# 33. Final screen

```text id="lq6fnb"
Standards / Traceability

Standard Weights & Traceability                         [ + Add Standard Set ]

Maintain laboratory reference standards used during verification.

┌────────────────────────────────────────────────────────────────────────┐
│ ✓ TRACEABILITY HEALTHY                                                 │
│ All active standard weight sets are currently valid.                   │
└────────────────────────────────────────────────────────────────────────┘

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ 6 Active   │ │ 5 Valid    │ │ 1 Expiring │ │ 0 Expired  │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

[All] [E1] [E2] [F1] [M1] [Expiring] [Expired]

⌕ Search standard, ID or certificate...                  Sort ▾

┌────────────────────────────────┐ ┌────────────────────────────────┐
│ E2-014                         │ │ E2-018                         │
│ Class E2                       │ │ Class E2                       │
│                                │ │                                │
│ ✓ VALID                        │ │ ✓ VALID                        │
│                                │ │                                │
│ 42 days remaining              │ │ 71 days remaining              │
│ █████████████████░░            │ │ ███████████████████░            │
│                                │ │                                │
│ NABL-2026-01482                │ │ NABL-2026-01491                │
│                                │ │                                │
│ [View Details] [Select →]      │ │ [View Details] [Select →]      │
└────────────────────────────────┘ └────────────────────────────────┘

┌────────────────────────────────┐ ┌────────────────────────────────┐
│ F1-008                         │ │ M1-003                         │
│ Class F1                       │ │ Class M1                       │
│                                │ │                                │
│ ⚠ EXPIRING                     │ │ ✕ EXPIRED                     │
│ 5 days remaining               │ │ Expired 2 days ago            │
│                                │ │                                │
│ [View Details]                 │ │ TESTING BLOCKED               │
│                                │ │ [Replace Standard]             │
└────────────────────────────────┘ └────────────────────────────────┘
```

## The mental model

The page should feel like:

**REGISTER → VERIFY → TRACE → ASSIGN → MONITOR → BLOCK WHEN INVALID**

And the most important relationship is:

```text
Standard Weight
      ↓
Calibration Certificate
      ↓
Validity
      ↓
Assigned Session
      ↓
Measurement Eligibility
```

That gives METROLOGIX-76 a much stronger **regulated-laboratory identity** than simply having a page called “Weights.”

The source explicitly establishes E1/E2/F1/M1 registry handling, calibration-validity countdowns and the hard lockout behavior for expired standards. `Pasted markdown(20261004-065148).md`

### Next

**Test Applicability Matrix / Test Plan** - before entering the remaining test workflow, the system determines which required procedures apply to the instrument and verification stage, then presents a clear readiness matrix with status and action for each applicable test. The source defines this as the high-readability matrix mapped to the active scale's class and verification stage. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:28:47 PM

next

## Response:
10/4/2026, 6:28:54 PM · gpt-5-6-t-mini

> **Designed Screen 11 test applicability matrix after requesting the source file and reading lines 889–908**
>
> 
>
> Worked for 11s

# Screen 11 - Test Applicability Matrix / Test Plan

This is the **decision screen before actual testing**. Its job is extremely simple:

> **“For this instrument, at this verification stage, which tests are required, what is their current status, and are we ready to begin?”**

The source specifically defines Screen 11 as a **high-readability checklist matrix mapping the 8 statutory OIML tests against the active scale’s class and verification stage**. `Pasted markdown(20261004-065148).md`

---

## 1. Core mental model

Do **not** make this look like an Excel spreadsheet.

The user should understand the page in about **5 seconds**:

```text
THIS INSTRUMENT
      ↓
THIS ACCURACY CLASS
      ↓
THIS VERIFICATION STAGE
      ↓
THESE TESTS APPLY
      ↓
ARE ALL PRECONDITIONS READY?
      ↓
START TESTING
```

This page is therefore a **Test Plan / Readiness Gate**, not a data-entry page.

---

# 2. Page layout

### Desktop

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Session Header                                                            │
│ Avery ZM201 Retail Platform   AV-2026-8812   Class III   30 kg           │
│ Subsequent Verification                                      ● READY     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ TEST PLAN                                                                  │
│ Applicability & Test Scope                                                │
│ Determine which verification procedures apply before testing begins.     │
│                                                                            │
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────────────┐ │
│ │ Accuracy Class   │ │ Verification     │ │ Test Plan Status           │ │
│ │                  │ │ Stage            │ │                            │ │
│ │   CLASS III      │ │ Subsequent       │ │  8 / 8 Applicable          │ │
│ │                  │ │ Verification     │ │ ● Ready to Start            │ │
│ └──────────────────┘ └──────────────────┘ └────────────────────────────┘ │
│                                                                            │
│ REQUIRED VERIFICATION PROCEDURES                                           │
│                                                                            │
│ ┌────┬────────────────────────┬──────────────┬───────────┬─────────────┐ │
│ │    │ Procedure              │ Applicability│ Status    │ Action      │ │
│ ├────┼────────────────────────┼──────────────┼───────────┼─────────────┤ │
│ │ 01 │ Backend-defined Test  │ REQUIRED     │ READY     │ View →      │ │
│ │ 02 │ Backend-defined Test  │ REQUIRED     │ COMPLETE  │ View →      │ │
│ │ 03 │ Backend-defined Test  │ REQUIRED     │ READY     │ Start →     │ │
│ │ 04 │ Backend-defined Test  │ REQUIRED     │ READY     │ Start →     │ │
│ │ 05 │ Backend-defined Test  │ REQUIRED     │ PENDING   │ Start →     │ │
│ │ 06 │ Backend-defined Test  │ REQUIRED     │ BLOCKED   │ Resolve →   │ │
│ │ 07 │ Backend-defined Test  │ REQUIRED     │ READY     │ Start →     │ │
│ │ 08 │ Backend-defined Test  │ REQUIRED     │ READY     │ Start →     │ │
│ └────┴────────────────────────┴──────────────┴───────────┴─────────────┘ │
│                                                                            │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ READINESS CHECK                                                       │ │
│ │ ✓ Instrument specifications validated                                 │ │
│ │ ✓ Standard weights valid                                              │ │
│ │ ✓ Environmental baseline recorded                                      │ │
│ │ ✓ Test scope determined                                               │ │
│ │                                                                    │ │
│ │                         [ Start Testing → ]                           │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Top session context

The persistent session header should remain visible.

### Instrument identity

Show:

**Avery Weigh-Tronix**  
ZM201 Retail Platform

`AV-2026-8812`

Then compact metrological data:

```text
Class III     Max 30 kg     Min 100 g     e 5 g     d 5 g
```

Do not make the user hunt for these values.

### Verification stage

Use a clear segmented selector:

```text
INITIAL TYPE APPROVAL
SUBSEQUENT VERIFICATION
IN-SERVICE
```

The available stages should ultimately be driven by the backend/domain model rather than hardcoded assumptions.

Selected stage gets the strongest visual treatment.

---

# 4. Hero heading

Use:

### **Test Plan**
**Applicability & Verification Scope**

Supporting text:

> Review the procedures applicable to this instrument before testing begins.

This wording is much easier for a judge/lab operator than:

> “OIML R 76 statutory applicability matrix”

You can still show the technical reference as a small secondary label:

`OIML R 76-1 • Test Applicability`

---

# 5. Three summary cards

These make the page immediately understandable.

### Card 1 - Accuracy Class

```text
ACCURACY CLASS

CLASS III
```

Small supporting line:

`Determined from registered instrument specifications`

---

### Card 2 - Verification Stage

```text
VERIFICATION STAGE

SUBSEQUENT
VERIFICATION
```

---

### Card 3 - Scope Status

Example:

```text
TEST PLAN

8 / 8
APPLICABLE

● READY
```

This is the most important card.

For another state:

```text
6 / 8
APPLICABLE

● 1 BLOCKER
```

---

# 6. Main matrix

This is the heart of the screen.

The source requires the matrix to map the **8 statutory OIML tests** to the active scale's **class and verification stage**. `Pasted markdown(20261004-065148).md`

### Important implementation rule

The specification does **not** provide canonical names for all eight tests.

So do **not** invent statutory test names in the UI and present them as official.

For the current dummy frontend, use:

```text
Test 01
Test 02
...
Test 08
```

with a secondary backend-facing label such as:

`test_id: TEST_01`

Later, once the backend/domain contract supplies canonical names, render those names dynamically.

---

# 7. Matrix columns

I recommend this structure:

| Column | Purpose |
|---|---|
| # | Sequence |
| Verification Procedure | Backend-defined test name |
| Applicability | Required / Not Required |
| Current Status | Ready / Pending / Complete / Blocked |
| Basis | Class/stage rule or system determination |
| Action | View / Start / Resolve |

### Example visual

```text
01  Verification Procedure A
    REQUIRED
    ● READY
    Determined for Class III / Subsequent Verification
                                      [Start →]

02  Verification Procedure B
    REQUIRED
    ✓ COMPLETE
                                      [View →]

03  Verification Procedure C
    REQUIRED
    ● READY
                                      [Start →]

04  Verification Procedure D
    NOT REQUIRED
    - Not applicable
                                      [Details]

05  Verification Procedure E
    REQUIRED
    ⚠ ATTENTION
                                      [Review →]
```

This is far more understandable than putting everything into tiny cells.

---

# 8. Status system

Use five visual states.

### REQUIRED + READY

Green status:

`● READY`

Meaning:

> Applicable and preconditions satisfied.

### COMPLETE

Green check:

`✓ COMPLETE`

### PENDING

Neutral/blue:

`● PENDING`

### ATTENTION

Amber:

`⚠ ATTENTION`

Something needs operator review.

### BLOCKED

Red:

`● BLOCKED`

Cannot proceed until the blocking condition is resolved.

---

# 9. “Basis” column

This is a very important trust feature.

Instead of simply saying:

> Required

show a small expandable explanation:

```text
Basis
Class III
+
Subsequent Verification
```

Clicking it opens a small explanation drawer:

```text
WHY IS THIS TEST INCLUDED?

Instrument class:
Class III

Verification stage:
Subsequent Verification

Applicability:
Required

Determination:
System-generated from the configured
test applicability rules.
```

That keeps the main table clean while preserving explainability.

---

# 10. Don't allow arbitrary manual statutory overrides

This is one of the places where I would be strict.

Do **not** provide:

```text
[✓] Required
[ ] Not required
```

as a freely editable checkbox for operators.

Otherwise the product can look like someone can simply remove a required legal test.

Instead:

```text
APPLICABILITY
┌───────────┐
│ REQUIRED  │
└───────────┘
System determined
```

For Admin/configuration workflows, rules can eventually be managed separately.

The active verification session should consume those rules.

---

# 11. Readiness gate

Under the matrix, create a strong but compact readiness section.

### **Ready to begin testing**

```text
✓ Instrument registered
✓ Metrological specifications validated
✓ Verification stage selected
✓ Applicable procedures determined
✓ Standard weights valid
✓ Required prerequisites satisfied
```

Then:

### Large primary CTA

**Start Testing →**

This button should be visually dominant.

---

# 12. Blocked state

This screen becomes even more useful when something isn't ready.

Example:

```text
┌─────────────────────────────────────────────────────────┐
│  TESTING BLOCKED                                       │
│                                                         │
│  1 prerequisite needs attention before testing starts.│
│                                                         │
│  ● Standard weight set FW-24-018 expires in 2 days.   │
│                                                         │
│                      [Resolve Issue]                  │
└─────────────────────────────────────────────────────────┘
```

And **Start Testing** becomes disabled.

This connects naturally with the Standard Weights page, where expired standards can hard-lock testing.

---

# 13. Recommended interaction flow

The ideal user flow is:

```text
Sessions
   ↓
Open Test Session
   ↓
Test Plan
   ↓
Select / confirm verification stage
   ↓
System determines applicability
   ↓
Review 8-test matrix
   ↓
Check readiness
   ↓
Start Testing
   ↓
Step 01 of test workflow
```

The operator should never wonder:

> “What am I supposed to test next?”

---

# 14. Right-side contextual panel

For desktop, I would add a slim right panel rather than another huge card.

### **Session Progress**

```text
TEST SESSION

Registration         ✓
Precondition         ✓
Test Plan            ● YOU ARE HERE

Testing
Review
Signature
Certificate
```

And below:

### **Traceability**

```text
STANDARD WEIGHTS

F1 Set FW-24-018
✓ Valid

Calibration
Expires 18 Mar 2027
```

This reinforces that the matrix is a gate in a larger controlled workflow.

---

# 15. Responsive/mobile version

On smaller screens, do **not** squeeze eight rows into a desktop table.

Turn each row into a card:

```text
┌──────────────────────────────────┐
│ TEST 03                          │
│ Verification Procedure           │
│                                  │
│ REQUIRED              ● READY    │
│                                  │
│ Applicability                    │
│ Class III • Subsequent           │
│ Verification                     │
│                                  │
│              [Start →]           │
└──────────────────────────────────┘
```

---

# 16. What the page should NOT contain

Avoid:

❌ Giant spreadsheets  
❌ 20+ editable fields  
❌ OIML clauses covering half the screen  
❌ Complex mathematical formulas  
❌ Manual applicability checkboxes  
❌ Random analytics charts  
❌ CEO-style KPI dashboards  
❌ Multiple competing primary buttons  
❌ Huge paragraphs explaining regulations

This is a **decision gate**.

---

# 17. Visual styling

Keep it consistent with the overall METROLOGIX-76 system:

```text
Background       #F6F8FB
Cards             #FFFFFF
Primary Navy      #172554
Primary Blue      #2563EB
PASS              #059669
WARNING           #D97706
FAIL              #DC2626
Borders           #E4E8EF
Primary text      #172033
Secondary text    #596579
```

Typography:

```text
Inter             → headings / labels / UI
IBM Plex Mono     → serials / IDs / technical values
```

Use the monospace font specifically for:

```text
AV-2026-8812
Class III
30.000 kg
e = 0.005 kg
TEST_03
```

---

# 18. Micro-interactions

Keep these subtle.

When the verification stage changes:

```text
Updating test applicability...
        ↓
8 tests evaluated
        ↓
Test plan updated
```

Then animate the status count:

`7 / 8 → 8 / 8`

When everything becomes ready:

```text
✓ TEST PLAN READY
```

with a very small green confirmation animation.

No flashy transitions.

---

# 19. Exact component structure

I would build it approximately like this:

```text
TestScopeMatrix.tsx
│
├── SessionHeader
│
├── PageHeader
│
├── TestPlanSummary
│   ├── AccuracyClassCard
│   ├── VerificationStageCard
│   └── ScopeStatusCard
│
├── ApplicabilityMatrix
│   ├── MatrixHeader
│   ├── ApplicabilityRow × 8
│   │   ├── TestNumber
│   │   ├── TestName
│   │   ├── ApplicabilityBadge
│   │   ├── StatusBadge
│   │   ├── BasisPopover
│   │   └── TestAction
│   └── MatrixLegend
│
├── ReadinessPanel
│   ├── ReadinessChecklist
│   ├── BlockerList
│   └── StartTestingButton
│
└── TestPlanDetailsDrawer
```

---

# 20. Dummy data for the first frontend build

Use something like:

```ts
const testPlan = {
  instrument: {
    manufacturer: "Avery Weigh-Tronix",
    model: "ZM201 Retail Platform",
    serialNumber: "AV-2026-8812",
    accuracyClass: "Class III",
    maxCapacity: 30,
    minCapacity: 0.1,
    verificationInterval: 0.005,
  },

  verificationStage: "SUBSEQUENT_VERIFICATION",

  tests: [
    {
      id: "TEST_01",
      name: "Backend-defined procedure",
      applicable: true,
      status: "READY",
    },
    {
      id: "TEST_02",
      name: "Backend-defined procedure",
      applicable: true,
      status: "COMPLETE",
    },
    {
      id: "TEST_03",
      name: "Backend-defined procedure",
      applicable: true,
      status: "READY",
    },
    // ...
  ],
};
```

This lets you build the **entire UX now without pretending the frontend knows statutory rules that haven't yet been supplied by the backend**.

---

# 21. The most important visual principle

The page should communicate this at a glance:

```text
┌─────────────────────────────────────────┐
│ WHAT ARE WE TESTING?                    │
│ Class III • Subsequent Verification     │
│                                         │
│ HOW MANY TESTS APPLY?                   │
│ 8 / 8                                   │
│                                         │
│ CAN WE START?                           │
│ ✓ YES                                   │
│                                         │
│             [ START TESTING → ]          │
└─────────────────────────────────────────┘
```

That is the **5-second comprehension test** for this screen.

And structurally, this page sits exactly where we want it in the redesigned product:

**Instrument → Precondition → Test Plan → OIML Test Procedures → Review → Sign → Certificate**

The source’s specific requirement for Screen 11 is the 8-test applicability matrix; the richer readiness-gate treatment above is the recommended UX structure around that requirement. `Pasted markdown(20261004-065148).md`

**Next: Screen 12 - Statutory Review & Director Sign-Off.**

## Prompt:
10/4/2026, 6:40:35 PM

Next: Screen 12 — Statutory Review & Director Sign-Off.

## Response:
10/4/2026, 6:40:43 PM · gpt-5-6

> **Reviewed file content lines 903–945**
>
> 
>
> Worked for a couple of seconds

# Screen 12 - Statutory Review & Director Sign-Off

This is the **highest-trust screen in the application**.

The testing operator has finished the procedures. Now the system must let a reviewer answer:

> **“Is this verification evidence complete and defensible?”**

And then the Director answers:

> **“Do I formally approve and sign this certificate?”**

The source defines Screen 12 as a two-panel review workflow: a searchable session queue on the left, an audit/review panel on the right, mandatory justification for remand, and a Director PIN/signing flow that produces the official green stamped seal, SHA-256 digest, and eMaap QR verification. `Pasted markdown(20261004-065148).md`

---

# 1. Core mental model

Do **not** make this another dashboard.

This is a **case-review workstation**.

```text
PENDING SESSION
      ↓
REVIEW EVIDENCE
      ↓
CHECK TEST RESULTS
      ↓
CHECK COMMENTS / EXCEPTIONS
      ↓
REVIEWER DECISION
      ↓
┌───────────────┐
│               │
REMAND       FORWARD
│               │
└───────────────┘
                ↓
         DIRECTOR AUTHORITY
                ↓
          SIGN + STAMP
                ↓
        IMMUTABLE CERTIFICATE
```

---

# 2. Desktop layout

The ideal desktop screen:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ REVIEW & SIGN                                                                │
│ Statutory verification review                                               │
├───────────────────────┬──────────────────────────────────────────────────────┤
│ REVIEW QUEUE          │ SESSION REVIEW                                      │
│                       │                                                      │
│ Search sessions...    │ Avery ZM201 Retail Platform                         │
│                       │ AV-2026-8812 • Class III • 30 kg                    │
│ ────────────────────  │                                                      │
│ ● Pending Review  3   │ ┌────────────────────────────────────────────────┐ │
│                       │ │ OVERALL RESULT                                  │ │
│ AV-2026-8812          │ │                                                │ │
│ Class III             │ │          PASS / READY FOR APPROVAL              │ │
│ 8/8 tests             │ │                                                │ │
│                       │ └────────────────────────────────────────────────┘ │
│ Mettler-120g          │                                                      │
│ Class I               │ TEST RESULTS                                        │
│ 8/8 tests             │ ┌───────┬──────────────┬────────┬───────────────┐ │
│                       │ │ Test  │ Result       │ Data   │ Evidence      │ │
│ Essae-150kg           │ │ 01    │ PASS         │ ✓      │ 4 observations│ │
│ Class IIII            │ │ 02    │ PASS         │ ✓      │ 10 readings   │ │
│                       │ │ 03    │ PASS         │ ✓      │ 4 positions   │ │
│ ────────────────────  │ │ ...   │ ...          │ ...    │ ...           │ │
│                       │ └───────┴──────────────┴────────┴───────────────┘ │
│ [Pending Review]      │                                                      │
│ [In Testing]          │ REVIEW COMMENTS                                     │
│ [Approved]            │ ┌────────────────────────────────────────────────┐ │
│ [Remanded]            │ │ No unresolved reviewer comments                │ │
│                       │ └────────────────────────────────────────────────┘ │
│                       │                                                      │
│                       │ AUDIT SUMMARY                                       │
│                       │ Evidence ✓   Calculations ✓   Traceability ✓       │
│                       │                                                      │
│                       │ [ Remand Session ] [ Approve & Forward → ]         │
└───────────────────────┴──────────────────────────────────────────────────────┘
```

The **left side is navigation through cases**.

The **right side is where the actual decision happens**.

---

# 3. Page header

Use:

### **Statutory Review**
**Review verification evidence before certification**

Small contextual metadata:

```text
3 sessions awaiting review
```

Avoid giant titles.

---

# 4. Left - Reviewer Queue

The source explicitly calls for a **searchable queue filtered by status**:

- Pending Review
- In Testing
- Approved
- Remanded `Pasted markdown(20261004-065148).md`

### Search

```text
⌕ Search serial, model or certificate ID...
```

### Filter chips

```text
Pending Review  3
In Testing      4
Approved        12
Remanded        2
```

Selected:

`Pending Review`

---

# 5. Session queue card

Each case should be extremely scannable.

```text
┌────────────────────────────────┐
│ AV-2026-8812                  │
│ Avery ZM201 Retail Platform   │
│                                │
│ Class III       30 kg          │
│                                │
│ Tests       8 / 8 complete    │
│ Result      ● PASS            │
│                                │
│ 2h ago                        │
└────────────────────────────────┘
```

Use a subtle selected-state border.

Don't show 15 pieces of metadata.

---

# 6. Review workspace header

Once a session is selected:

```text
Avery Weigh-Tronix
ZM201 Retail Platform

AV-2026-8812

CLASS III     MAX 30 kg     e 0.005 kg

SUBSEQUENT VERIFICATION

● PENDING REVIEW
```

Then a small traceability line:

```text
Standard weights: F1 FW-24-018 ✓ Valid
Evidence package: Complete
```

---

# 7. Overall decision banner

This should be the first thing the reviewer sees.

### Passing session

```text
┌─────────────────────────────────────────────────────────┐
│ ✓  VERIFICATION READY FOR APPROVAL                     │
│                                                         │
│ All applicable procedures completed successfully.       │
│ No unresolved audit comments.                           │
└─────────────────────────────────────────────────────────┘
```

### Attention state

```text
┌─────────────────────────────────────────────────────────┐
│ ⚠  REVIEW REQUIRES ATTENTION                           │
│                                                         │
│ 2 observation rows contain reviewer flags.             │
│                                                         │
│ [View flagged observations]                            │
└─────────────────────────────────────────────────────────┘
```

### Failure

```text
┌─────────────────────────────────────────────────────────┐
│ ✕  CERTIFICATION BLOCKED                               │
│                                                         │
│ One or more applicable procedures have failed.         │
│                                                         │
│ [View failed result]                                   │
└─────────────────────────────────────────────────────────┘
```

---

# 8. Test-result summary

This should **not repeat the entire test screens**.

Instead, give the reviewer a compact evidence summary.

```text
TEST RESULTS

┌─────────────────────────────────────────────────────────┐
│ Test 01                         ✓ PASS                  │
│ 24 observations • evidence attached                    │
├─────────────────────────────────────────────────────────┤
│ Test 02                         ✓ PASS                  │
│ 4 positions • evidence attached                         │
├─────────────────────────────────────────────────────────┤
│ Test 03                         ✓ PASS                  │
│ 10 readings • spread within limit                       │
├─────────────────────────────────────────────────────────┤
│ ...                                                     │
└─────────────────────────────────────────────────────────┘
```

Each row should be clickable.

Clicking it opens the relevant test evidence in a **drawer**, rather than navigating the reviewer away from the review case.

---

# 9. Result hierarchy

Every test row should communicate:

```text
PROCEDURE
     ↓
RESULT
     ↓
EVIDENCE
     ↓
EXCEPTIONS
```

Example:

```text
Weighing procedure

✓ PASS

24 observations
24 valid
0 flagged

[View evidence →]
```

The reviewer shouldn't need to remember what happened three screens earlier.

---

# 10. Row-level comments

This is one of the most important interactions.

The source specifically describes a slide-over audit/comment workflow elsewhere in the architecture, and the review screen needs to expose row comments. `Pasted markdown(20261004-065148).md`

Click:

**View evidence**

Then:

```text
┌─────────────────────────────────────────┐
│ Observation Review                 ×    │
├─────────────────────────────────────────┤
│ Target Load             10.000 kg       │
│ Observed Reading        10.005 kg       │
│ Calculated Error        +0.005 kg       │
│ Legal Tolerance         ±0.010 kg       │
│                                         │
│ Status                  ✓ PASS          │
│                                         │
│ ─────────────────────────────────────── │
│ AUDIT COMMENT                           │
│                                         │
│ [ + Add comment ]                       │
│                                         │
│ Reviewer note:                         │
│ “Reading consistent with sequence.”     │
└─────────────────────────────────────────┘
```

This keeps the primary screen clean.

---

# 11. Reviewer action bar

At the bottom, use a sticky action bar.

```text
┌────────────────────────────────────────────────────────────┐
│ Reviewer decision                                          │
│                                                            │
│ [ Remand Session ]                  [ Approve & Forward → ]│
└────────────────────────────────────────────────────────────┘
```

### Approve & Forward

This does **not** mean the reviewer signs the certificate.

It means:

> Reviewer confirms the case and forwards it to the Director.

This distinction is critical.

---

# 12. Remand Session modal

The source explicitly requires **mandatory statutory justification** for remand. `Pasted markdown(20261004-065148).md`

Do not make it:

```text
Are you sure?
[Yes]
```

Instead:

```text
┌──────────────────────────────────────────────────┐
│ Remand Verification Session                 ×    │
├──────────────────────────────────────────────────┤
│ This session will return to the operator for    │
│ corrective action.                              │
│                                                  │
│ Reason for remand *                              │
│ ┌──────────────────────────────────────────────┐ │
│ │ Explain the statutory or evidentiary issue. │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Minimum justification required                   │
│                                                  │
│              [Cancel] [Remand Session]           │
└──────────────────────────────────────────────────┘
```

The button remains disabled until the justification is valid.

---

# 13. Director state

Once the reviewer approves and forwards:

```text
PENDING DIRECTOR SIGN-OFF
```

The Director sees essentially the same case but with a different authority layer.

The UI should make this visually obvious.

```text
Reviewer decision
✓ Approved & Forwarded

Director action
● Signature required
```

---

# 14. Director action

The main CTA becomes:

### **Sign & Stamp Certificate**

The source specifically defines this action and connects it to `DirectorSignModal.tsx`. `Pasted markdown(20261004-065148).md`

Use the purple authority color sparingly here.

---

# 15. Director Sign Modal

This should feel **ceremonial but not gimmicky**.

```text
┌────────────────────────────────────────────────────────┐
│ Director Authorization                            ×    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ SIGN & STAMP CERTIFICATE                               │
│                                                        │
│ Certificate ID                                         │
│ CERT-2026-000184                                       │
│                                                        │
│ Director PIN                                           │
│                                                        │
│          ● ● ● ●                                      │
│                                                        │
│ [1] [2] [3]                                           │
│ [4] [5] [6]                                           │
│ [7] [8] [9]                                           │
│     [0]                                                │
│                                                        │
│ [ Load Demo PIN: 7620 ]                               │
│                                                        │
│ ☐ I confirm this certificate under statutory authority │
│                                                        │
│ SHA-256                                                │
│ 7d91...4af2                                            │
│                                                        │
│                 [Cancel] [Sign & Stamp]                │
└────────────────────────────────────────────────────────┘
```

The source explicitly specifies:

- 4-digit PIN
- demo PIN `7620`
- mandatory statutory declaration
- canonical SHA-256 digest preview `Pasted markdown(20261004-065148).md`

For the actual production implementation, the demo PIN must of course be isolated from real authentication.

---

# 16. SHA-256 digest section

Don't show an enormous hash by default.

Use:

```text
CERTIFICATE DIGEST

7d91c0e1...4af2

[Copy]
```

Click:

**Show full digest**

opens:

```text
7d91c0e1b3a8...
...complete SHA-256...
```

Use IBM Plex Mono.

---

# 17. Statutory declaration

This should be deliberately prominent.

```text
☐ I confirm that I have reviewed the verification
  evidence and authorize issuance of this certificate
  under the applicable statutory procedure.
```

Until checked:

**Sign & Stamp** disabled.

This creates a clear separation between:

**Authentication** → PIN

and

**Legal acknowledgement** → Declaration.

---

# 18. Successful signing state

After successful authorization, do not immediately throw the user into another page.

Transform the workspace into the certificate state.

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                 ✓ CERTIFICATE SIGNED                   │
│                                                         │
│              STATUTORYALLY VERIFIED                    │
│                                                         │
│              Director: A. Kumar                        │
│              Laboratory: RRSL Bengaluru                │
│              04 Oct 2026 • 18:42                       │
│                                                         │
│                    [GREEN SEAL]                        │
│                                                         │
│              Scan to verify certificate                │
│                    [ QR CODE ]                         │
│                                                         │
│              SHA-256: 7d91...4af2                      │
│                                                         │
│       [Download PDF/A] [Download DOCX]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 19. Green Guilloche Seal

The source specifically calls for an official certificate seal with an **animated Guilloche rosette watermark**, verified badge, Director, laboratory and timestamp, plus eMaap verification QR. `Pasted markdown(20261004-065148).md`

Visually:

```text
        ╭──────────────────╮
      ╱                      ╲
     │       VERIFIED        │
     │                       │
     │          ✓            │
     │     AUTHORIZED       │
      ╲                      ╱
        ╰──────────────────╯
```

Behind it:

- subtle guilloche pattern
- thin concentric security lines
- restrained animation

**Do not make it look like a gaming achievement badge.**

It should resemble a digital version of a serious official seal.

---

# 20. QR verification

Place the QR directly beside the certificate identity:

```text
VERIFICATION

[ QR ]

Certificate:
CERT-2026-000184

Verify certificate →
```

The source specifies an **eMaap verification QR code with copyable verification URL**. `Pasted markdown(20261004-065148).md`

Provide:

`Copy verification URL`

with a small success toast:

> Verification URL copied.

---

# 21. Immutable final state

After Director signing, the session becomes:

```text
APPROVED
```

and the entire case becomes **read-only**.

The interface should visibly communicate this:

```text
🔒 APPROVED - IMMUTABLE RECORD
```

Inputs disappear.

Buttons such as:

```text
Edit observation
Delete row
Change result
```

must not merely be disabled-they should no longer appear in the normal workflow.

---

# 22. Approved state layout

```text
┌─────────────────────────────────────────────────────────┐
│ 🔒 APPROVED - IMMUTABLE RECORD                         │
│                                                         │
│ Certificate CERT-2026-000184                            │
│                                                         │
│ ✓ All applicable tests completed                        │
│ ✓ Reviewer approval recorded                            │
│ ✓ Director signature recorded                           │
│ ✓ Certificate digest generated                          │
│                                                         │
│ Signed by                                               │
│ A. Kumar                                                │
│ Laboratory Director                                     │
│                                                         │
│ [View Certificate] [Audit Trail] [Download PDF/A]       │
└─────────────────────────────────────────────────────────┘
```

---

# 23. Reviewer vs Director permissions

This screen is a great place to demonstrate RBAC.

### Metrologist

Can:

- view own submitted sessions
- see review status

Cannot:

- approve
- sign

### Reviewer

Can:

- inspect evidence
- add comments
- remand
- approve & forward

Cannot:

- digitally sign

### Director

Can:

- inspect review
- sign
- stamp
- finalize

### Auditor

Read-only:

- inspect certificate
- inspect audit evidence
- inspect cryptographic record

The source establishes these role distinctions and specifically states that reviewers/directors should have disabled test-entry inputs while retaining appropriate review/approval actions. `Pasted markdown(20261004-065148).md`

---

# 24. Don't overload the page

A common mistake would be:

```text
20 test tables
+
all calculations
+
all photos
+
all audit events
+
certificate preview
+
signature
```

That becomes unusable.

Instead:

### Layer 1 - Decision

```text
PASS / FAIL / ATTENTION
```

### Layer 2 - Evidence

```text
Test results
Comments
Evidence
```

### Layer 3 - Technical proof

```text
Calculation
Audit trail
SHA-256
```

Progressive disclosure keeps the reviewer focused.

---

# 25. Component architecture

```text
ReviewPipeline.tsx
│
├── ReviewQueue
│   ├── Search
│   ├── StatusFilters
│   └── SessionQueueItem
│
├── ReviewWorkspace
│   ├── SessionIdentity
│   ├── DecisionBanner
│   ├── TestResultSummary
│   │   └── TestResultRow × N
│   ├── ReviewerComments
│   ├── AuditSummary
│   └── ReviewActionBar
│
├── RowLevelCommentDrawer
│
├── RemandModal
│
├── DirectorSignModal
│   ├── PinPad
│   ├── StatutoryDeclaration
│   └── DigestPreview
│
└── GreenStampedSeal
    ├── GuillocheWatermark
    ├── VerificationBadge
    ├── DirectorIdentity
    └── VerificationQRCode
```

---

# 26. Dummy state model

For the frontend-first implementation:

```ts
type ReviewStatus =
  | "PENDING_REVIEW"
  | "IN_TESTING"
  | "APPROVED"
  | "REMANDED";

type DecisionState =
  | "READY_FOR_REVIEW"
  | "ATTENTION"
  | "BLOCKED"
  | "READY_FOR_DIRECTOR"
  | "SIGNED";

interface ReviewSession {
  id: string;
  instrumentId: string;
  serialNumber: string;
  model: string;
  accuracyClass: string;
  verificationStage: string;

  reviewStatus: ReviewStatus;

  testsCompleted: number;
  testsApplicable: number;

  unresolvedComments: number;

  reviewer?: {
    name: string;
    approvedAt?: string;
  };

  director?: {
    name: string;
    signedAt?: string;
  };

  certificateId?: string;
  sha256Digest?: string;
  verificationUrl?: string;
}
```

This is enough to create the complete UI without coupling it to the backend yet.

---

# 27. The complete screen states

You should design **four major visual states**, not just the happy path.

### State A - Pending Review

```text
8/8 tests complete
↓
Reviewer examines
↓
[Remand] [Approve & Forward]
```

### State B - Remanded

```text
⚠ REMANDED

Reason:
Observation 14 requires clarification.

[Return to Session]
```

### State C - Ready for Director

```text
✓ REVIEW APPROVED

Reviewer:
A. Kumar

[Sign & Stamp Certificate]
```

### State D - Signed

```text
🔒 IMMUTABLE
✓ CERTIFICATE SIGNED
✓ SHA-256 GENERATED
✓ QR VERIFICATION ACTIVE

[PDF/A] [DOCX] [Audit Trail]
```

That makes the workflow extremely easy to demonstrate to hackathon judges.

---

# 28. The 5-second comprehension test

When the judge opens this screen, they should immediately see:

```text
WHO?
Avery ZM201 / AV-2026-8812

WHAT?
Statutory verification review

RESULT?
✓ PASS

ANY PROBLEMS?
0 unresolved comments

WHO ACTS NOW?
Reviewer / Director

WHAT HAPPENS NEXT?
Approve → Sign → Certificate
```

That is exactly the experience we want.

---

## Final visual hierarchy

```text
STATUTORY REVIEW
        │
        ▼
┌─────────────────────────┐
│ CASE IDENTITY           │
│ Instrument / Serial     │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ OVERALL DECISION        │
│ ✓ READY FOR APPROVAL    │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ TEST EVIDENCE            │
│ 8/8 PASS                 │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ REVIEWER DECISION       │
│ Remand / Forward        │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ DIRECTOR AUTHORITY      │
│ PIN + Declaration       │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ OFFICIAL DIGITAL SEAL   │
│ SHA-256 + QR            │
└─────────────────────────┘
        │
        ▼
     CERTIFICATE
```

This screen should feel **calm, authoritative, evidence-driven and irreversible**-the point where METROLOGIX-76 stops being merely a testing application and becomes a controlled certification system.

**Next: Screen 13 - Cryptographic Audit Trail.**

## Prompt:
10/4/2026, 6:41:14 PM

next

## Response:
10/4/2026, 6:41:23 PM · gpt-5-6-t-mini

> **Audited Screen 13 contract context, hash schemas, trail types, and references**
>
> 
>
> Worked for 10s

# Screen 13 - Cryptographic Audit Trail

This is the **trust layer** of METROLOGIX-76.

The previous screen answers:

> **“Was this verification approved?”**

This screen answers:

> **“Can we prove what happened, in what order, who did it, and whether the record has been altered?”**

The source specifies Screen 13 as a **chronological timeline of immutable verification events with monospace SHA-256 block hash cards**. `Pasted markdown(20261004-065148).md`

---

# 1. Core mental model

Do not design this as a normal activity log.

A normal activity log says:

```text
Shashi edited row 14
```

Your audit trail needs to communicate:

```text
WHO
  ↓
DID WHAT
  ↓
WHEN
  ↓
TO WHICH SESSION
  ↓
PREVIOUS HASH
  ↓
CURRENT HASH
  ↓
CHAIN VALID?
```

So the page should feel like a **forensic evidence viewer**, not an admin history page.

---

# 2. Overall desktop layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ AUDIT TRAIL                                                                 │
│ Immutable verification history                                              │
│                                                                              │
│ Session: AV-2026-8812 ▾       Search events...        ● CHAIN VERIFIED      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌─────────────────────┐   ┌──────────────────────────────────────────────┐ │
│ │ AUDIT OVERVIEW      │   │ IMMUTABILITY STATUS                          │ │
│ │                     │   │                                              │ │
│ │ 42 EVENTS           │   │ ✓ Hash chain verified                       │ │
│ │ 5 ACTORS            │   │ ✓ No broken links                           │ │
│ │ 0 INTEGRITY ISSUES  │   │ ✓ Record sequence consistent                │ │
│ │                     │   │                                              │ │
│ └─────────────────────┘   └──────────────────────────────────────────────┘ │
│                                                                              │
│ VERIFICATION HISTORY                                                        │
│                                                                              │
│     ● ── Instrument registered                                             │
│     │                                                                       │
│     │      Shashi Shekhar • METROLOGIST                                   │
│     │      04 Oct 2026 09:14:22                                            │
│     │                                                                       │
│     │      SHA-256                                                          │
│     │      2f8a91...d42c                                                    │
│     │                                                                       │
│     ● ── Test plan confirmed                                                │
│     │                                                                       │
│     │      ...                                                              │
│     │                                                                       │
│     ● ── Test result submitted                                              │
│     │                                                                       │
│     │      ...                                                              │
│     │                                                                       │
│     ● ── Reviewer approved                                                  │
│     │                                                                       │
│     │      ...                                                              │
│     │                                                                       │
│     ● ── Director signed certificate                                        │
│            ...                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Page header

Use:

### **Cryptographic Audit Trail**

Supporting text:

> Immutable chronological record of verification activity.

Right side:

```text
● CHAIN VERIFIED
```

This status should always be visible.

Do not bury it inside a settings menu.

---

# 4. Session selector

The audit trail should be contextual.

At the top:

```text
SESSION

AV-2026-8812
Avery ZM201 Retail Platform
Class III • 30 kg
```

Dropdown/search:

```text
⌄ Select verification session
```

That allows an Auditor to inspect another case without leaving the screen.

---

# 5. Search

Keep it simple:

```text
⌕ Search event, actor, action or hash...
```

Useful search examples:

```text
reviewer
director
TEST_03
remand
certificate
7d91
```

Do not add five separate filters unless the data volume later requires them.

---

# 6. Audit overview cards

Three compact cards are enough.

### Total Events

```text
42
EVENTS
```

### Actors

```text
5
ACTORS
```

### Integrity

```text
0
ISSUES
```

For a damaged/demo chain:

```text
1
INTEGRITY ISSUE
```

---

# 7. Main feature - chronological timeline

This is the centerpiece.

The source explicitly requires a **chronological timeline of immutable verification events**. `Pasted markdown(20261004-065148).md`

Use a vertical timeline:

```text
              04 OCT 2026

● 09:14:22
│ Instrument Registered
│
│ Metrologist
│ Shashi Shekhar
│
│ Session created
│ AV-2026-8812
│
│ [SHA-256 BLOCK]
│ 2f8a91c2...91d42c
│
│ Previous
│ 00000000...000000
│
● 09:19:04
│ Specifications Validated
│
│ ...
```

This makes the chronological nature obvious.

---

# 8. Event card anatomy

Every event gets the same predictable structure.

```text
┌─────────────────────────────────────────────────────┐
│ ✓  TEST RESULT SUBMITTED                            │
│                                                     │
│ METROLOGIST                                         │
│ Shashi Shekhar                                     │
│                                                     │
│ 04 Oct 2026 • 09:42:17                             │
│ Session AV-2026-8812                               │
│                                                     │
│ SHA-256 BLOCK                                      │
│ 4f9a3b77e91d...8ac2                                │
│                                                     │
│ Previous hash                                      │
│ 2f8a91c2d77a...91d4                                │
│                                                     │
│ ✓ Chain link valid                                 │
│                                                     │
│                              [View details →]       │
└─────────────────────────────────────────────────────┘
```

---

# 9. Human-readable event title

Never make the primary label something like:

```text
EVENT_00381
```

Instead:

### **Test Result Submitted**

Then put the technical event ID underneath:

```text
AUD-000381
```

This follows the project's broader principle of keeping technical detail secondary to human-readable meaning.

---

# 10. Event categories

Use restrained icons to distinguish events.

Example categories:

```text
Instrument
Test
Evidence
Comment
Review
Approval
Signature
Certificate
System
```

Possible UI:

```text
⊞ Instrument
◌ Test
▣ Evidence
◆ Review
✓ Approval
✎ Signature
▤ Certificate
```

Do not create a different bright color for every event type.

---

# 11. Actor information

Every event should make the actor obvious.

```text
ACTOR

Shashi Shekhar
METROLOGIST
```

Then:

```text
ACTION

Submitted repeatability results
```

For the Director:

```text
A. Kumar
LAB DIRECTOR

Signed certificate
```

This is especially important because the application has explicit role-based permissions between Metrologist, Reviewer, Director, Auditor and Admin. `Pasted markdown(20261004-065148).md`

---

# 12. Timestamp

Use exact timestamp, but visually subordinate it:

```text
04 Oct 2026
09:42:17 IST
```

For technical precision:

```text
04 OCT 2026 • 09:42:17
```

IBM Plex Mono works very well here.

---

# 13. SHA-256 block

This is where the page earns its name.

The source specifically calls for **monospace SHA-256 block hash cards**. `Pasted markdown(20261004-065148).md`

Do:

```text
SHA-256

4f9a3b77e91d4c87
72ac8b193fa02d...
```

Not:

```text
4f9a3b77e91d4c8772ac8b193fa02d...
```

as one giant unreadable line.

Split the hash visually into groups while preserving the actual underlying value.

---

# 14. Previous → Current relationship

The important visual idea is:

```text
EVENT 41
Previous Hash
    ↓
2f8a91...

EVENT 42
Current Hash
    ↓
4f9a3b...

EVENT 43
Previous Hash
    ↓
4f9a3b...
```

This communicates that each event is connected to the previous record.

You want the judge to understand the concept visually without needing a cryptography lecture.

---

# 15. Chain verification banner

At the top:

```text
┌─────────────────────────────────────────────────────────────┐
│ ✓ HASH CHAIN VERIFIED                                      │
│                                                             │
│ 42 of 42 event links verified successfully.                │
│ No integrity discrepancies detected.                       │
└─────────────────────────────────────────────────────────────┘
```

Keep this calm and authoritative.

Not:

```text
🎉 SECURITY SUPER POWER ACTIVATED!!!
```

Absolutely no gimmicks.

---

# 16. Integrity failure demo

This is one of the strongest **hackathon demonstration features**.

Create a Demo Mode control:

```text
Audit Integrity Demo
[ Simulate Tamper ]
```

When activated:

```text
┌─────────────────────────────────────────────────────────────┐
│ ✕ INTEGRITY VERIFICATION FAILED                            │
│                                                             │
│ Event AUD-000417 does not match the expected chain hash.   │
│                                                             │
│ Expected                                                │
│ 4f9a3b77...8ac2                                          │
│                                                             │
│ Received                                                │
│ 9ce11420...77bd                                          │
│                                                             │
│ 1 broken link detected                                    │
└─────────────────────────────────────────────────────────────┘
```

Then the affected event becomes red.

The line connecting that event to the next event should also change to the failure state.

This visually proves that the audit system can detect tampering.

**Important:** this should be clearly labeled **Demo / Simulation** and must never alter actual production audit records.

---

# 17. Event details drawer

Don't put all metadata into the event card.

Click:

**View details →**

opens:

```text
┌─────────────────────────────────────────────────────┐
│ EVENT DETAILS                                   ×   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Event ID                                            │
│ AUD-000381                                          │
│                                                     │
│ Action                                              │
│ Test Result Submitted                               │
│                                                     │
│ Actor                                               │
│ Shashi Shekhar                                     │
│ METROLOGIST                                        │
│                                                     │
│ Timestamp                                           │
│ 04 Oct 2026 • 09:42:17 IST                         │
│                                                     │
│ Session                                             │
│ AV-2026-8812                                       │
│                                                     │
│ Previous Hash                                       │
│ 2f8a91c2d77a...91d42                                │
│                                                     │
│ Current Hash                                        │
│ 4f9a3b77e91d...8ac2                                │
│                                                     │
│ Chain Status                                        │
│ ✓ Valid                                             │
│                                                     │
│ [Copy Hash]                                         │
└─────────────────────────────────────────────────────┘
```

This fits the project's progressive-disclosure approach: keep the main interface clean and reveal deeper evidence through drawers/modals. `Pasted markdown(20261004-065148).md`

---

# 18. Important event sequence for demo

For your dummy frontend, make the timeline tell a story.

Example:

```text
09:12:04
Instrument registered
        ↓
09:14:31
Specifications validated
        ↓
09:17:05
Standard weights selected
        ↓
09:19:42
Test plan confirmed
        ↓
09:31:18
Physical inspection completed
        ↓
09:48:36
Weighing results recorded
        ↓
10:02:11
Eccentricity results recorded
        ↓
10:14:28
Repeatability completed
        ↓
10:28:52
Environmental testing completed
        ↓
10:35:19
Session submitted for review
        ↓
11:02:41
Reviewer approved
        ↓
11:17:03
Director signed certificate
        ↓
11:17:04
Certificate generated
```

The exact event names should ultimately come from the backend event model; the source establishes the chronological immutable-event concept, not a fixed exhaustive event vocabulary. `Pasted markdown(20261004-065148).md`

---

# 19. Filters

Use only filters that matter.

Top row:

```text
All Events
Tests
Review
Signature
Certificate
System
```

Optional actor filter:

```text
All Actors ▾
```

And:

```text
Date ▾
```

Avoid a giant filter panel.

---

# 20. Session-level vs system-level audit

This distinction is worth making visually.

### Session Audit

```text
AV-2026-8812
42 events
```

Default view.

### System Audit

For an Auditor/Admin:

```text
All Laboratory Events
2,184 events
```

But don't mix these together by default.

The user should never wonder whether an event belongs to the current verification case.

---

# 21. Approved-session connection

After Director signing, the audit trail should show the signature event as the final major milestone:

```text
● CERTIFICATE SIGNED

Director
A. Kumar

Certificate
CERT-2026-000184

SHA-256
7d91c0...4af2

✓ Final chain link verified
```

Then:

```text
🔒 SESSION IMMUTABLE
```

The broader specification explicitly says an approved session becomes permanently read-only and receives a lock indicator. `Pasted markdown(20261004-065148).md`

---

# 22. Auditor experience

When the role is:

**AUDITOR**

the screen should change slightly.

Header:

```text
AUDITOR MODE
READ-ONLY
```

Actions such as:

```text
Edit
Delete
Add Comment
```

must disappear.

Available actions:

```text
View Event
Copy Hash
Export Audit Record
```

The source defines Auditor as a read-only inspector who can inspect the immutable SHA-256 audit trail and certificates. `Pasted markdown(20261004-065148).md`

---

# 23. Demo mode

For hackathon judges, add one small control in the header:

```text
DEMO
Integrity Check
```

Opening it:

```text
┌──────────────────────────────────────┐
│ AUDIT INTEGRITY DEMO                 │
│                                      │
│ Normal Chain                         │
│ ✓ 42/42 links valid                  │
│                                      │
│ [ Simulate Tamper ]                  │
└──────────────────────────────────────┘
```

After simulation:

```text
1 BROKEN LINK

[ Restore Demo Chain ]
```

This is far more compelling than a static green “secure” badge because it demonstrates an actual system behavior.

---

# 24. Visual design

This page should be slightly more technical than the other screens.

But still clean.

### Base

```text
Background    #F6F8FB
Surface       #FFFFFF
Border        #E4E8EF
Text          #172033
Secondary     #596579
```

### Integrity

```text
Verified      Emerald
Warning       Amber
Failure       Crimson
Authority     Purple
```

Use purple only for Director/signature events, consistent with the overall design language.

---

# 25. Typography

Primary:

```text
Inter
```

Technical:

```text
IBM Plex Mono
```

Use IBM Plex Mono for:

```text
AUD-000381
04 OCT 2026 • 09:42:17
2f8a91c2...
4f9a3b77...
CERT-2026-000184
```

The source's design rules explicitly call for IBM Plex Mono for technical data such as numbers, readings, serials and hashes. `Pasted markdown(20261004-065148).md`

---

# 26. Responsive layout

On tablet/mobile:

```text
┌─────────────────────────────┐
│ AUDIT TRAIL                 │
│                             │
│ ● CHAIN VERIFIED            │
│                             │
│ Session ▾                   │
│                             │
│ 42 EVENTS                   │
│                             │
│ ──────────────────────────  │
│                             │
│ ● Test Result Submitted     │
│   Shashi Shekhar            │
│   09:42:17                   │
│                             │
│   SHA-256                   │
│   4f9a3b77...8ac2           │
│                             │
│   [View Details]            │
│                             │
│ ● Reviewer Approved         │
│   ...                       │
└─────────────────────────────┘
```

Don't try to preserve the desktop's multi-column density.

---

# 27. Empty state

When a session has no events:

```text
No audit events yet

Events will appear here as activity occurs
within this verification session.
```

For a brand-new dummy session:

```text
[ Load Demo Session ]
```

This follows the existing project rule that empty states should give the user an actionable next step rather than showing a blank screen. `Pasted markdown(20261004-065148).md`

---

# 28. Component architecture

```text
AuditTrailView.tsx
│
├── AuditHeader
│   ├── SessionSelector
│   ├── SearchInput
│   └── ChainStatusBadge
│
├── AuditOverview
│   ├── EventCountCard
│   ├── ActorCountCard
│   └── IntegrityCard
│
├── AuditFilters
│
├── AuditTimeline
│   └── AuditEventCard × N
│       ├── EventIcon
│       ├── EventIdentity
│       ├── ActorInfo
│       ├── Timestamp
│       ├── HashBlock
│       ├── PreviousHash
│       └── ChainLinkStatus
│
├── EventDetailsDrawer
│
└── IntegrityDemoPanel
    ├── SimulateTamper
    └── RestoreDemoChain
```

---

# 29. Dummy frontend data

Start with a simple immutable event model:

```ts
type AuditEventType =
  | "INSTRUMENT_REGISTERED"
  | "SPECIFICATIONS_VALIDATED"
  | "TEST_PLAN_CONFIRMED"
  | "TEST_RESULT_SUBMITTED"
  | "REVIEWER_APPROVED"
  | "SESSION_REMANDED"
  | "DIRECTOR_SIGNED"
  | "CERTIFICATE_GENERATED";

interface AuditEvent {
  id: string;

  sessionId: string;

  type: AuditEventType;

  title: string;
  description: string;

  actorName: string;
  actorRole: string;

  timestamp: string;

  previousHash: string;
  currentHash: string;

  chainValid: boolean;
}
```

For the UI demo, generate realistic deterministic hashes rather than random values each render. That way the visual chain remains stable.

---

# 30. Critical interaction

When clicking an event:

```text
Timeline Event
      ↓
Event Details Drawer
      ↓
Previous Hash
      ↓
Current Hash
      ↓
Chain Verification
```

When clicking the current hash:

```text
[Copy Hash]
```

Toast:

> SHA-256 hash copied.

Simple and satisfying.

---

# 31. What NOT to do

Avoid:

❌ Blockchain-style neon graphics  
❌ Hacker terminal aesthetic  
❌ Matrix rain  
❌ Huge hexadecimal walls  
❌ Cryptography jargon everywhere  
❌ Animated spinning locks  
❌ Fake “military-grade security” language  
❌ Making SHA-256 itself look like the product

The user should understand the **audit evidence**, not admire a cybersecurity theme.

---

# 32. The visual story for judges

This screen should allow you to say:

> “Every important action in a verification session is recorded chronologically. Each event carries a SHA-256 block linked to the previous event. So the reviewer can see not just what happened, but the integrity of the sequence.”

Then click:

**Simulate Tamper**

The screen changes:

```text
✕ INTEGRITY VERIFICATION FAILED
1 BROKEN LINK DETECTED
```

That will be much more convincing than merely telling the judge that you have an audit trail.

---

# 33. Final 5-second comprehension test

The judge opens the page and immediately sees:

```text
AUDIT TRAIL

AV-2026-8812

● CHAIN VERIFIED

42 EVENTS
0 INTEGRITY ISSUES

09:14  Instrument Registered
09:42  Test Results Submitted
11:02  Reviewer Approved
11:17  Director Signed
11:17  Certificate Generated
```

And underneath every important event:

```text
Previous Hash
Current Hash
✓ Valid
```

That is the right balance of **human-readable evidence + cryptographic proof**.

---

## Where Screen 13 sits in the product

```text
TESTING
   ↓
REVIEW
   ↓
DIRECTOR SIGNATURE
   ↓
┌───────────────────────────┐
│ CRYPTOGRAPHIC AUDIT TRAIL │
│                           │
│ proves the history        │
└───────────────────────────┘
   ↓
CERTIFICATE REPOSITORY
```

So Screen 13 should feel like the **bridge between “we approved it” and “we can prove it.”**

**Next: Screen 14 - Bilingual Certificate Repository.**

## Prompt:
10/4/2026, 6:42:16 PM

next

## Response:
10/4/2026, 6:42:24 PM · gpt-5-6-t-mini

> **Located Screen 14 source and read lines after 940**
>
> 
>
> Worked for 4s

# Screen 14 - Bilingual Certificate Repository

This is the **final output and retrieval layer** of METROLOGIX-76.

After testing, review, Director authorization, and audit logging, the user needs one place where they can answer:

> **“Where is the official certificate, can I verify it, and can I download it in the required language/format?”**

The source defines Screen 14 as a searchable **Bilingual Certificate Repository** with a three-way language selector, certificate cards, QR thumbnails, and one-click PDF/A, DOCX, and eMaap verification actions. `Pasted markdown(20261004-065148).md`

---

# 1. Core mental model

This should feel like a **certificate vault**, not Google Drive and not a file manager.

```text id="o2e4ka"
CERTIFICATE ISSUED
        ↓
       STORED
        ↓
     SEARCHABLE
        ↓
    VERIFIABLE
        ↓
   DOWNLOADABLE
```

The repository's job is retrieval and trust.

Not editing.

Not data entry.

Not analytics.

---

# 2. Overall desktop layout

```text id="s8dsw5"
┌─────────────────────────────────────────────────────────────────────────────┐
│ CERTIFICATE REPOSITORY                                                     │
│ Search and verify issued statutory certificates                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌──────────────────────────────────────────────┐                            │
│ │ ⌕ Search certificate, serial or instrument… │                            │
│ └──────────────────────────────────────────────┘                            │
│                                                                             │
│ LANGUAGE                                                                    │
│ [ English ] [ हिन्दी ] [ Bilingual ]                                      │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 184 CERTIFICATES                                      Sort: Latest ▾    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌────────────────────────┐ ┌────────────────────────┐ ┌──────────────────┐ │
│ │ CERT-2026-000184       │ │ CERT-2026-000183       │ │ CERT-2026-000182 │ │
│ │                        │ │                        │ │                  │ │
│ │ Avery ZM201            │ │ Mettler AX120          │ │ Sansui GF6000    │ │
│ │ AV-2026-8812           │ │ MT-2026-1108           │ │ SN-622819        │ │
│ │                        │ │                        │ │                  │ │
│ │ Class III              │ │ Class I                │ │ Class II         │ │
│ │                        │ │                        │ │                  │ │
│ │ ✓ VERIFIED             │ │ ✓ VERIFIED             │ │ ✓ VERIFIED      │ │
│ │                        │ │                        │ │                  │ │
│ │ Director A. Kumar      │ │ Director R. Singh      │ │ Director A.K.   │ │
│ │                        │ │                        │ │                  │ │
│ │ [ QR ]                 │ │ [ QR ]                 │ │ [ QR ]           │ │
│ │                        │ │                        │ │                  │ │
│ │ [Preview] [Download]   │ │ [Preview] [Download]   │ │ [Preview]       │ │
│ └────────────────────────┘ └────────────────────────┘ └──────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

The main screen should be **card-based**, exactly as the specification calls for. `Pasted markdown(20261004-065148).md`

---

# 3. Page header

Use:

### **Certificate Repository**

Supporting text:

> Search, verify and download issued verification certificates.

Small right-side count:

```text id="w6pbp7"
184 issued certificates
```

No giant analytics.

---

# 4. Search is the primary interaction

Make the search bar prominent.

```text id="9q1m1x"
⌕  Search certificate ID, serial number or instrument model...
```

Examples the user can search:

```text id="s6s1k5"
CERT-2026-000184
AV-2026-8812
Avery ZM201
Class III
```

As the repository grows, search should become the central navigation mechanism.

---

# 5. Language selector

This is a required feature from the source.

Use a clean segmented control:

```text id="wgd0wa"
┌───────────┬──────────┬────────────────────┐
│ English   │ हिन्दी   │ Bilingual           │
└───────────┴──────────┴────────────────────┘
```

The third option should explicitly communicate the format:

### **Bilingual**

rather than making the user infer what “Dual” means.

The source specifies `English`, `Hindi`, and `Bilingual Dual-Column`. `Pasted markdown(20261004-065148).md`

---

# 6. What changes with language selection

### English

Certificate preview is:

```text
English
────────────────────
Certificate Details
Instrument
Verification Results
Director Authorization
Certificate Validity
```

### हिन्दी

```text
हिन्दी
────────────────────
प्रमाणपत्र विवरण
उपकरण
सत्यापन परिणाम
निदेशक प्राधिकरण
```

### Bilingual

This is where the repository can become visually impressive.

Use a two-column certificate preview:

```text id="s5mm1f"
┌──────────────────────────────┬──────────────────────────────┐
│ ENGLISH                      │ हिन्दी                       │
├──────────────────────────────┼──────────────────────────────┤
│ Certificate No.              │ प्रमाणपत्र संख्या            │
│ CERT-2026-000184             │ CERT-2026-000184             │
│                              │                              │
│ Instrument                   │ उपकरण                       │
│ Avery ZM201                  │ Avery ZM201                  │
│                              │                              │
│ Accuracy Class               │ शुद्धता वर्ग                 │
│ Class III                    │ Class III                    │
└──────────────────────────────┴──────────────────────────────┘
```

The repository itself should not become a giant form. The language selector is about **document presentation/export**, not editing the underlying certificate.

---

# 7. Certificate card

Every card should have a predictable hierarchy.

```text id="3v4dxv"
CERT-2026-000184
Issued • 04 Oct 2026

Avery Weigh-Tronix
ZM201 Retail Platform

AV-2026-8812

Class III
30 kg

✓ VERIFIED

Director
A. Kumar

[ QR ]

[Preview]     [More ▾]
```

Important:

**Certificate ID first. Instrument identity second. Trust status third.**

---

# 8. Certificate status

The main status should be extremely obvious:

### `✓ VERIFIED`

Use the emerald treatment.

For older/non-final records:

```text
DRAFT
REVOKED
SUPERSEDED
```

Those would need domain support later; don't invent them as actual statutory states unless the backend defines them.

For the current dummy frontend, use:

`VERIFIED`

as the principal issued-certificate state.

---

# 9. QR thumbnail

The source explicitly calls for a **QR thumbnail** on the certificate cards. `Pasted markdown(20261004-065148).md`

Keep it small but recognizable:

```text id="rf8gud"
┌─────────┐
│ ▪ ▪ ▪   │
│ ▪   ▪   │
│   ▪ ▪   │
│ ▪ ▪   ▪ │
└─────────┘
```

Under it:

`Scan to verify`

Clicking it should open the certificate preview/verification drawer rather than immediately navigating away.

---

# 10. Certificate details drawer

Clicking a card should open a large right-side drawer.

```text id="hqz8zm"
┌───────────────────────────────────────────────────────┐
│ CERTIFICATE DETAILS                               ×   │
├───────────────────────────────────────────────────────┤
│                                                       │
│ ✓ VERIFIED                                           │
│                                                       │
│ CERT-2026-000184                                     │
│                                                       │
│ INSTRUMENT                                            │
│ Avery Weigh-Tronix                                   │
│ ZM201 Retail Platform                                │
│                                                       │
│ SERIAL                                                │
│ AV-2026-8812                                         │
│                                                       │
│ ACCURACY CLASS                                        │
│ Class III                                             │
│                                                       │
│ MAXIMUM CAPACITY                                      │
│ 30 kg                                                 │
│                                                       │
│ DIRECTOR                                              │
│ A. Kumar                                              │
│                                                       │
│ LABORATORY                                            │
│ RRSL Bengaluru                                       │
│                                                       │
│ ISSUED                                                │
│ 04 Oct 2026                                          │
│                                                       │
│ SHA-256                                               │
│ 7d91c0e1...4af2                                      │
│                                                       │
│ [Open Certificate]                                   │
│ [Verify on eMaap Portal]                             │
│ [Download PDF/A]                                     │
│ [Download DOCX]                                      │
└───────────────────────────────────────────────────────┘
```

---

# 11. Certificate preview

The preview deserves its own focused view.

Do not display the actual PDF inside a tiny modal.

Use a document viewer-style workspace:

```text id="ocgc0b"
┌─────────────────────────────────────────────────────────────────┐
│ Certificate Preview                                             │
│ CERT-2026-000184                    English ▾    1 / 4           │
├──────────────────────────────────────────────┬──────────────────┤
│                                              │ DOCUMENT INFO    │
│                                              │                  │
│             OFFICIAL CERTIFICATE             │ ✓ VERIFIED       │
│                                              │                  │
│             CERT-2026-000184                 │ Director         │
│                                              │ A. Kumar         │
│                  ...                         │                  │
│                                              │ SHA-256          │
│                                              │ 7d91...4af2      │
│                                              │                  │
│                                              │ [Copy URL]       │
│                                              │ [Download]       │
└──────────────────────────────────────────────┴──────────────────┘
```

The document preview should visually resemble the final certificate.

---

# 12. Official certificate visual language

The certificate preview should be much more formal than the application UI.

Think:

```text id="6iwbkh"
Official Government Document
          ↓
Institution identity
          ↓
Certificate identity
          ↓
Instrument details
          ↓
Verification summary
          ↓
Authorization
          ↓
Security / verification
```

Use:

- clean white document
- deep navy headings
- thin rules
- restrained government/laboratory identity
- official-looking spacing
- green authorization seal
- QR
- certificate number

No decorative gradients.

---

# 13. Download actions

The source explicitly requires one-click:

- `Download PDF/A`
- `Download Word (.docx)`
- `Verify on eMaap Portal` `Pasted markdown(20261004-065148).md`

Recommended action hierarchy:

```text id="35vmzd"
[ Download PDF/A ]
[ Download DOCX ]
──────────────
[ Verify on eMaap Portal ↗ ]
```

### Why PDF/A is primary

PDF/A is the more natural **official record/print artifact**, so give it the strongest primary-button treatment.

DOCX should be secondary.

---

# 14. Download interaction

Don't immediately download without feedback.

After click:

```text id="jgy4ng"
Generating certificate...

██████████████░░░░ 72%
```

Then:

```text
✓ PDF/A certificate ready
```

Toast:

> Certificate downloaded successfully.

For demo mode, this can simply produce the dummy artifact or a UI simulation.

---

# 15. Verify on eMaap

The button should feel different because it leaves the repository's internal context.

Use:

**Verify on eMaap Portal ↗**

The external-link icon communicates that the user is going elsewhere.

A confirmation tooltip can say:

> Open the public verification endpoint associated with this certificate.

The exact destination/URL should come from the backend later rather than being hardcoded into the frontend.

---

# 16. Copy verification URL

Inside the details/preview:

```text id="e8v3vl"
VERIFICATION URL

verify.example/c/CERT-2026-000184

[Copy]
```

After clicking:

```text
✓ Verification URL copied
```

This works particularly well in a hackathon demo because you can show the connection between the certificate and its verification identity.

---

# 17. Filters

The source only mandates search and language controls, so don't overcomplicate this screen.

I recommend only:

```text id="6djp2j"
Search
Language
Status
Date
```

Collapsed behind:

**Filters**

rather than making them permanently consume screen space.

---

# 18. Sort

Add one simple dropdown:

```text id="pjzbyc"
Latest issued ▾
Oldest issued
Certificate ID
Instrument
```

Default:

**Latest issued**

This is a repository, so recency is the most natural default.

---

# 19. Empty state

When search returns nothing:

```text id="q24xvv"
┌────────────────────────────────────────┐
│                                        │
│             No certificates found      │
│                                        │
│ Try a different certificate ID,        │
│ serial number or instrument model.     │
│                                        │
│            [Clear Search]              │
│                                        │
└────────────────────────────────────────┘
```

Do not show a generic:

> “No data.”

---

# 20. Large repository state

Eventually you may have hundreds/thousands of certificates.

Don't render everything at once.

Use pagination or virtualized loading:

```text id="l5fple"
Showing 1-24 of 184 certificates

← 1  2  3  4  5 →
```

For the frontend demo, 9-12 cards on the first page is enough.

---

# 21. Responsive layout

### Desktop

3-column certificate grid.

### Tablet

2-column.

### Mobile

1-column:

```text id="q4o3jp"
CERT-2026-000184
✓ VERIFIED

Avery ZM201
AV-2026-8812

Class III • 30 kg

[View Certificate]
```

Don't shrink the QR to an unreadable size.

---

# 22. Certificate card hover

Very subtle interaction:

```text id="xk7l11"
Normal
↓
slight elevation
thin blue border
```

No scale-up animation.

On hover:

```text
View certificate →
```

appears.

---

# 23. The “verified certificate” visual identity

A verified certificate should have a small consistent trust strip:

```text id="zkrmf6"
✓ DIGITALLY VERIFIED
```

Then beneath:

```text
Director Authorized
04 Oct 2026
```

This links Screen 14 back to Screen 12.

---

# 24. Connection with the audit trail

From a certificate, provide:

**View Audit Trail →**

This is important.

The user can follow:

```text id="f4cpn7"
Certificate
   ↓
Who signed it?
   ↓
Audit Trail
   ↓
Director signature event
   ↓
Cryptographic chain
```

That makes the product feel like one coherent system rather than disconnected screens.

---

# 25. Connection with the test session

Inside the certificate details:

```text id="v4vi4r"
SOURCE VERIFICATION SESSION

AV-2026-8812
✓ Approved

[View Session]
```

This lets an auditor trace:

**Certificate → Session → Tests → Evidence → Audit**

That is an excellent mental model for the overall product.

---

# 26. Language state example

### English card

```text id="q7j6d5"
CERT-2026-000184

Avery ZM201 Retail Platform

Verification Certificate
✓ VERIFIED
```

### Hindi

```text id="0ua4fu"
प्रमाणपत्र संख्या

CERT-2026-000184

सत्यापन प्रमाणपत्र
✓ सत्यापित
```

### Bilingual

```text id="umrg9i"
┌──────────────────────┬──────────────────────┐
│ Verification         │ सत्यापन              │
│ Certificate          │ प्रमाणपत्र            │
│                      │                      │
│ CERT-2026-000184     │ CERT-2026-000184     │
└──────────────────────┴──────────────────────┘
```

Keep the card itself mostly language-neutral; the document preview/export is where the full language treatment belongs.

---

# 27. Component architecture

```text id="v7ezgi"
ReportRepositoryView.tsx
│
├── RepositoryHeader
│   ├── SearchInput
│   ├── LanguageSelector
│   └── RepositoryCount
│
├── RepositoryToolbar
│   ├── Filters
│   └── SortSelect
│
├── CertificateGrid
│   └── CertificateCard × N
│       ├── CertificateIdentity
│       ├── InstrumentSummary
│       ├── VerificationBadge
│       ├── DirectorInfo
│       ├── QRThumbnail
│       └── CertificateActions
│
├── CertificateDetailsDrawer
│
├── CertificatePreview
│   ├── DocumentViewer
│   ├── CertificateInfoPanel
│   └── DownloadActions
│
└── RepositoryPagination
```

---

# 28. Dummy data

Use realistic data based on the existing frontend presets.

```ts id="95n5e9"
interface Certificate {
  id: string;
  instrumentModel: string;
  manufacturer: string;
  serialNumber: string;

  accuracyClass: string;
  maxCapacity: number;
  unit: string;

  directorName: string;
  laboratoryName: string;

  issuedAt: string;

  verificationStatus: "VERIFIED";

  qrValue: string;
  verificationUrl: string;

  sha256Digest: string;

  availableLanguages: (
    | "ENGLISH"
    | "HINDI"
    | "BILINGUAL"
  )[];

  pdfAvailable: boolean;
  docxAvailable: boolean;
}
```

Example:

```ts id="6ug0mf"
{
  id: "CERT-2026-000184",
  instrumentModel: "ZM201 Retail Platform",
  manufacturer: "Avery Weigh-Tronix",
  serialNumber: "AV-2026-8812",

  accuracyClass: "Class III",
  maxCapacity: 30,
  unit: "kg",

  directorName: "A. Kumar",
  laboratoryName: "RRSL Bengaluru",

  issuedAt: "2026-10-04T11:17:03+05:30",

  verificationStatus: "VERIFIED",

  qrValue: "CERT-2026-000184",
  verificationUrl:
    "https://verify.example/c/CERT-2026-000184",

  sha256Digest:
    "7d91c0e1b3a8f6...4af2",

  availableLanguages: [
    "ENGLISH",
    "HINDI",
    "BILINGUAL"
  ],

  pdfAvailable: true,
  docxAvailable: true
}
```

---

# 29. Certificate lifecycle UX

This page should make the final lifecycle obvious:

```text id="puv8wa"
TEST SESSION
     │
     ▼
REVIEWED
     │
     ▼
DIRECTOR SIGNED
     │
     ▼
CERTIFICATE GENERATED
     │
     ▼
CERTIFICATE REPOSITORY
     │
     ├── Preview
     ├── PDF/A
     ├── DOCX
     └── Verify
```

This is the cleanest possible final stage of the product.

---

# 30. What NOT to do

Avoid:

❌ File-explorer aesthetics  
❌ Huge folders/categories  
❌ Spreadsheet-style certificate rows  
❌ Too many filters  
❌ Tiny unreadable document previews  
❌ Giant QR codes on every card  
❌ “Download” as the only meaningful action  
❌ Mixing draft operational sessions with issued certificates without a clear distinction  
❌ Fancy gradients on official document previews

This should feel like a **digital certificate vault for a regulated laboratory**.

---

# 31. The 5-second comprehension test

When a judge enters this page:

```text id="je5yyd"
CERTIFICATE REPOSITORY

Search...

[ English ] [ हिन्दी ] [ Bilingual ]

184 CERTIFICATES

┌──────────────────────────────┐
│ CERT-2026-000184             │
│ Avery ZM201                   │
│ AV-2026-8812                  │
│ Class III                     │
│                               │
│ ✓ VERIFIED                    │
│ Director A. Kumar             │
│                               │
│ [QR]                          │
│                               │
│ [Preview] [Download]          │
└──────────────────────────────┘
```

They immediately understand:

**What is this?** Certificates.  
**Which one?** Searchable.  
**Is it valid?** Verified.  
**Who approved it?** Director shown.  
**Can I see it?** Preview.  
**Can I get it?** Download.  
**Can I independently verify it?** QR/eMaap.

That is exactly what this page needs to accomplish.

---

# 32. Final product relationship

At this point the application has a very strong story:

```text
REGISTER
   ↓
PRECONDITION
   ↓
TEST PLAN
   ↓
TEST
   ↓
REVIEW
   ↓
AUDIT
   ↓
DIRECTOR SIGN
   ↓
CERTIFICATE
   ↓
REPOSITORY
```

Screen 14 is therefore the **output vault** of the entire METROLOGIX-76 workflow. Its required search, language selector, certificate cards, QR, PDF/A, DOCX and eMaap actions come directly from the supplied specification. `Pasted markdown(20261004-065148).md`

**Next: Screen 15 - Live Hardware / IoT Scale Bridge.**

## Prompt:
10/4/2026, 6:43:12 PM

next

## Response:
10/4/2026, 6:43:21 PM · gpt-5-6-t-mini

> **Searched LiveBridge source for next screen content**
>
> 
>
> Worked for 7s

# Screen 15 - Live Hardware / IoT Scale Bridge

This is the **physical-instrument connection workspace**.

Its purpose is to make the transition from:

> **“I am entering test observations”**

to:

> **“The actual weighing instrument is providing the reading directly.”**

The supplied specification defines Screen 15 around a serial connection status banner, physical scale connection over USB/RS-232, a large live seven-segment weight display, STABLE/Gross/Net indicators, a WELMEC 7.2 software-examination card, and a zero-hardware virtual scale simulator supporting CAS, Mettler SICS, and Avery SMA protocols. `Pasted markdown(20261004-065148).md`

---

# 1. Core mental model

This page should **not** look like a generic IoT dashboard.

Think:

```text id="yhtl5g"
PHYSICAL SCALE
      ↓
CONNECT
      ↓
RECEIVE LIVE READING
      ↓
CHECK STABILITY
      ↓
OPTIONALLY CAPTURE
      ↓
INSERT INTO TEST
      ↓
RETAIN TELEMETRY / AUDIT CONTEXT
```

So the screen is essentially a **digital instrument bridge** between laboratory hardware and the verification application.

---

# 2. Most important design decision

Make the **live weight** the hero element.

The user should instantly understand:

```text id="c5a4e7"
Is the scale connected?
        ↓
What does it read?
        ↓
Is the reading stable?
        ↓
Can I capture it?
```

Everything else is secondary.

---

# 3. Overall desktop wireframe

```text id="9k8jjd"
┌──────────────────────────────────────────────────────────────────────────────┐
│ LIVE SCALE BRIDGE                                                           │
│ Connect, monitor and capture readings from the weighing instrument           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ CONNECTION                                                              │ │
│ │                                                                        │ │
│ │ ● SIMULATOR CONNECTED              Protocol: CAS                       │ │
│ │                                                                        │ │
│ │ Device: Virtual Scale             Port: DEMO-COM                       │ │
│ │                                                                        │ │
│ │ [ Connect Physical Scale ] [ Disconnect ] [ Virtual Simulator ✓ ]      │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌───────────────────────────────────┐ ┌─────────────────────────────────┐ │
│ │                                   │ │ WELMEC 7.2 SOFTWARE EXAMINATION│ │
│ │        LIVE WEIGHT                │ │                                 │ │
│ │                                   │ │ Calibration C        12        │ │
│ │      1 2 . 3 4 5   kg             │ │ Calibration P        08        │ │
│ │                                   │ │                                 │ │
│ │        ● STABLE                   │ │ Firmware Hash                   │ │
│ │                                   │ │ a84f...91c2                     │ │
│ │      [ GROSS ]                    │ │                                 │ │
│ │                                   │ │ ✓ Telemetry available            │ │
│ │                                   │ │                                 │ │
│ │ [ Capture Reading → ]             │ │ [ Run Examination ]             │ │
│ └───────────────────────────────────┘ └─────────────────────────────────┘ │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ SERIAL / TELEMETRY LOG                              [ Clear Log ]      │ │
│ │                                                                        │ │
│ │ 18:42:11   RX   ST,GS,12.345kg                                       │ │
│ │ 18:42:10   RX   ST,GS,12.345kg                                       │ │
│ │ 18:42:09   RX   US,GS,12.351kg                                       │ │
│ │ 18:42:08   TX   READ                                                 │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ Auto-capture stable readings      [ ON ]                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 4. Page header

Use:

### **Live Scale Bridge**

Supporting text:

> Connect a weighing instrument and capture stable readings directly into the active test.

Right side:

```text id="36rj3y"
● DISCONNECTED
```

or:

```text id="9ryg5c"
● CONNECTED
```

or:

```text id="8s2xy7"
● SIMULATOR
```

This distinction should be immediately obvious.

---

# 5. Connection banner

The source explicitly calls for a **serial COM status banner** and:

**Connect Physical Scale (USB/RS-232)**. `Pasted markdown(20261004-065148).md`

Use a dedicated full-width card.

### Disconnected

```text id="6t0u5h"
┌──────────────────────────────────────────────────────┐
│ ○ NO SCALE CONNECTED                                │
│                                                      │
│ Connect a physical scale using USB / RS-232.        │
│                                                      │
│               [ Connect Physical Scale ]             │
│                                                      │
│ Or use the virtual simulator for demonstration.     │
└──────────────────────────────────────────────────────┘
```

### Connecting

```text id="odv0t4"
○ CONNECTING TO SCALE...

Detecting serial interface
```

### Connected

```text id="jjwqcm"
● SCALE CONNECTED

Device
Avery ZM201

Connection
USB / Serial

Status
Receiving telemetry
```

---

# 6. Physical scale connection flow

Click:

**Connect Physical Scale**

Use a focused modal.

```text id="v2n7zn"
┌───────────────────────────────────────────────┐
│ CONNECT PHYSICAL SCALE                    ×  │
├───────────────────────────────────────────────┤
│                                               │
│ Connection type                               │
│                                               │
│ ○ USB / Serial                                │
│ ○ RS-232                                      │
│                                               │
│ Serial configuration                          │
│                                               │
│ Baud rate                                     │
│ [ 9600 ▾ ]                                    │
│                                               │
│ Port                                           │
│ [ Select available device ▾ ]                 │
│                                               │
│               [Cancel] [Connect]              │
└───────────────────────────────────────────────┘
```

The application state already anticipates `connectPhysicalSerial(baudRate?)`, `disconnectPhysicalSerial()`, and `sendSerialCommand(cmd)` in the IoT context. `Pasted markdown(20261004-065148).md`

Don't expose every serial setting on the main page.

---

# 7. Live weight hero

This should be the visual centerpiece.

### Seven-segment aesthetic

The source explicitly calls for a **large 7-segment digital weight indicator**. `Pasted markdown(20261004-065148).md`

Example:

```text id="mkr3as"
LIVE WEIGHT

12.345

kg
```

Use:

- IBM Plex Mono
- tabular numerals
- generous spacing
- dark instrument-display treatment inside an otherwise light application

This is one place where a darker panel actually works well.

---

# 8. STABLE indicator

The source requires a live **green STABLE beacon**. `Pasted markdown(20261004-065148).md`

Use:

```text id="n6bq6n"
● STABLE
```

For unstable:

```text id="t6b7kd"
● UNSTABLE
```

But don't flash the entire display.

Only the small beacon changes.

That keeps the UI calm while making stability highly visible.

---

# 9. Gross / Net controls

The source specifies Gross/Net pills. `Pasted markdown(20261004-065148).md`

Use:

```text id="ib7bfi"
[ GROSS ] [ NET ]
```

Selected state:

```text id="nifpfv"
[GROSS]  NET
```

These should be informational unless the actual hardware protocol/backend supports changing the mode.

Do not make them look like arbitrary filters if they are actually instrument-state indicators.

---

# 10. Zero state

The IoT context includes `isZero`, so visually account for it. `Pasted markdown(20261004-065148).md`

Example:

```text id="3z9hj1"
ZERO
0.000 kg
```

Use a small secondary indicator:

```text
ZERO POSITION
```

not a giant button.

---

# 11. Capture Reading

This is the bridge to the testing workflow.

Primary CTA:

### **Capture Reading →**

Example:

```text id="h3g0tf"
● STABLE
12.345 kg

[ Capture Reading → ]
```

When unstable:

```text id="4x0u7n"
● UNSTABLE

Wait for a stable reading before capture.
```

The IoT state explicitly includes `captureCurrentReading()` returning the current weight and stability state. `Pasted markdown(20261004-065148).md`

---

# 12. Capture confirmation

Don't make capture invisible.

After clicking:

```text id="x9y02n"
✓ READING CAPTURED

12.345 kg

Source:
Scale Bridge

Timestamp:
18:42:11
```

Then:

```text
[ Insert into active test ]
```

This creates a clear connection to the Observation Grid.

---

# 13. Auto-capture mode

The supplied state includes:

`autoCaptureToGrid`

and

`setAutoCaptureToGrid(enabled)`.

`Pasted markdown(20261004-065148).md`

Therefore add:

```text id="hbb9yu"
AUTO-CAPTURE STABLE READINGS
                         [ ON ]
```

Supporting text:

> Stable readings are automatically inserted into the active test row.

When enabled:

```text id="dmjn5f"
● STABLE
12.345 kg

↓
✓ Automatically captured
```

This could be one of the strongest live-demo moments.

---

# 14. Don't auto-capture unstable values

The visual rule should be simple:

```text id="m0h8ed"
STABLE
   ↓
Eligible for capture

UNSTABLE
   ↓
Not eligible
```

Even before backend integration, enforce the visual interaction in the dummy state.

---

# 15. Right side - WELMEC 7.2 panel

The source specifically calls for a:

**WELMEC 7.2 Software Examination Card**

showing:

- calibration counters `C`, `P`
- firmware hash

`Pasted markdown(20261004-065148).md`

The panel should look like an **assurance inspection card**, not a second dashboard.

```text id="dc8ssa"
┌────────────────────────────────────────┐
│ WELMEC 7.2                            │
│ SOFTWARE EXAMINATION                  │
├────────────────────────────────────────┤
│                                        │
│ Calibration C                          │
│ 12                                     │
│                                        │
│ Calibration P                          │
│ 08                                     │
│                                        │
│ Firmware Hash                          │
│ a84f2e91...91c2                       │
│                                        │
│ Telemetry                              │
│ ✓ Available                            │
│                                        │
│ [ Run Examination ]                    │
└────────────────────────────────────────┘
```

---

# 16. Be careful with C and P

This is an important source-discipline point.

The provided specification says the panel should **show calibration counters `(C, P)` and the firmware hash**, but it does not define their exact semantic meaning in the supplied material. `Pasted markdown(20261004-065148).md`

Therefore:

**Do not invent explanatory labels such as “Calibration Count” or “Parameter Counter” unless the backend/domain specification establishes them.**

For the dummy UI:

```text
Calibration C
12

Calibration P
08
```

is safer.

Later, map those fields to the actual backend definitions.

---

# 17. Firmware hash presentation

Use:

```text id="d18bu7"
FIRMWARE HASH

a84f2e91
...7b190c91c2

[ Copy ]
```

Clicking copy:

> Firmware hash copied.

Again, keep technical proof secondary to human readability.

---

# 18. WELMEC examination action

Use:

### **Run Examination**

When clicked:

```text id="h5wv9b"
Running software examination...

Firmware identity       ✓
Calibration data        ✓
Telemetry state         ✓
Integrity check         ✓
```

Then:

```text id="mtai5x"
✓ EXAMINATION COMPLETE
```

The supplied IoT context includes `interrogateWelmec(simulateTamper?)`, which strongly supports this interaction pattern. `Pasted markdown(20261004-065148).md`

---

# 19. Tamper simulation

The context specifically exposes:

`interrogateWelmec(simulateTamper?: boolean)`

so a **Demo Mode-only** tamper simulation is appropriate. `Pasted markdown(20261004-065148).md`

Add a quiet control under the examination action:

```text id="s6b2i9"
Demo Mode
[ Simulate Integrity Issue ]
```

After activation:

```text id="f4xeq5"
✕ SOFTWARE EXAMINATION ATTENTION

Firmware integrity result requires review.

[ View Details ]
```

Never make this look like a real production control.

---

# 20. Virtual Scale Simulator

This is especially important for the hackathon.

The source explicitly requires:

**Load Virtual Scale Simulator**

with:

- CAS
- Mettler SICS
- Avery SMA

protocol presets. `Pasted markdown(20261004-065148).md`

Use:

```text id="wfpfu8"
VIRTUAL SCALE

[ OFF ]

Load simulator
```

After activation:

```text id="0o20e8"
VIRTUAL SCALE ● ACTIVE

Protocol
[ CAS ▾ ]

Status
Receiving simulated packets

[ Stop Simulator ]
```

---

# 21. Simulator protocol selector

```text id="kgj8fh"
PROTOCOL

┌─────────┬───────────────┬───────────┐
│ CAS     │ Mettler SICS  │ Avery SMA │
└─────────┴───────────────┴───────────┘
```

Don't over-explain protocol internals on this screen.

The user primarily needs to know:

> **Which simulated instrument protocol am I currently testing?**

---

# 22. Terminal / telemetry console

The source's component catalog describes `LiveBridge.tsx` as a **WebSerial connection manager, live scale readout, and terminal console**. `Pasted markdown(20261004-065148).md`

So add a collapsible lower panel.

### Collapsed

```text id="f28b0a"
SERIAL TELEMETRY LOG              28 messages   [Expand]
```

### Expanded

```text id="zx4y26"
18:42:11   RX   ST,GS,12.345kg
18:42:10   RX   ST,GS,12.345kg
18:42:09   RX   US,GS,12.351kg
18:42:08   TX   READ
```

Use monospace.

---

# 23. RX / TX distinction

Use tiny labels:

```text id="z6x04a"
RX
```

and:

```text id="25yuac"
TX
```

No bright colors needed.

The distinction should be visible through typography and a restrained badge.

---

# 24. Do not expose raw packets by default

This is an important usability principle.

The normal screen should show:

```text id="i68avb"
12.345 kg
● STABLE
```

not:

```text
ST,GS,12.345kg\r\n
```

Raw telemetry belongs in the expandable technical panel.

That's consistent with the project's overall rule of putting the human answer first and technical proof underneath.

---

# 25. Connection troubleshooting

If connection fails:

```text id="9mgfcu"
┌──────────────────────────────────────────────────────────┐
│ ✕ COULD NOT CONNECT                                     │
│                                                          │
│ No compatible serial device was selected.               │
│                                                          │
│ [ Try Again ]                                            │
└──────────────────────────────────────────────────────────┘
```

If a device disconnects unexpectedly:

```text id="2w0vxd"
⚠ SCALE CONNECTION LOST

Last reading
12.345 kg

No new telemetry received.

[ Reconnect ]
```

Don't use a generic red toast alone; this is an instrument-state problem and deserves persistent visibility.

---

# 26. Physical vs simulator state

Make these visually unmistakable.

### Physical

```text id="6u8r57"
● PHYSICAL SCALE
USB / RS-232
```

### Simulator

```text id="bnk3j0"
● VIRTUAL SCALE
CAS
```

Never display:

```text
Connected
```

alone.

The user needs to know **what is connected**.

---

# 27. Current test context

Because this page may be opened while a test is active, keep the session header visible.

Example:

```text id="cnrg7k"
ACTIVE TEST SESSION

Avery ZM201
AV-2026-8812
Class III • 30 kg

Current test
Weighing
```

Then:

```text
[ Capture → Active Test ]
```

The user shouldn't have to manually choose where the reading goes every time.

---

# 28. Traceability state

Above the hardware area, show:

```text id="qk0j2e"
STANDARD WEIGHTS
✓ F1 FW-24-018 VALID
```

But do **not** duplicate the entire Standard Weights page.

This is a gate/context indicator.

If the traceability layer is blocked:

```text id="f9a9b8"
🔒 TEST INPUT LOCKED

Required standard weight traceability is not valid.
```

This stays consistent with the application's hard-lockout design for expired standards.

---

# 29. Role behavior

### Metrologist

Can:

- connect
- disconnect
- monitor live reading
- capture
- enable auto-capture
- use simulator

### Reviewer

Read-only:

```text
12.345 kg
● STABLE
```

Can inspect telemetry but not alter test observations.

### Director

Read-only.

### Auditor

Read-only technical inspection.

The source establishes disabled test-entry behavior for reviewers/directors and read-only Auditor behavior. `Pasted markdown(20261004-065148).md`

---

# 30. Responsive design

On desktop:

```text
Connection
      ↓
┌───────────────┬─────────────────┐
│ LIVE SCALE    │ WELMEC 7.2      │
└───────────────┴─────────────────┘
      ↓
Telemetry
```

On mobile:

```text
CONNECTION

● SIMULATOR ACTIVE

───────────────

LIVE WEIGHT

12.345 kg
● STABLE

[ Capture ]

───────────────

WELMEC 7.2

C 12
P 08
Firmware ...

───────────────

Telemetry
[ Expand ]
```

The live display remains the largest element.

---

# 31. Component architecture

```text id="oy2ie6"
LiveBridge.tsx
│
├── BridgeHeader
│   ├── ConnectionStatus
│   └── ConnectionActions
│
├── ScaleConnectionCard
│   ├── PhysicalConnectionButton
│   ├── DisconnectButton
│   └── SimulatorToggle
│
├── BridgeWorkspace
│   │
│   ├── LiveWeightPanel
│   │   ├── SevenSegmentDisplay
│   │   ├── StabilityBeacon
│   │   ├── GrossNetPills
│   │   ├── ZeroIndicator
│   │   ├── CaptureButton
│   │   └── AutoCaptureToggle
│   │
│   └── WelmecAuditPanel
│       ├── CalibrationCounters
│       ├── FirmwareHash
│       ├── ExaminationStatus
│       └── RunExaminationButton
│
├── VirtualScaleSimulator
│   ├── ProtocolSelector
│   └── SimulatorControls
│
└── SerialTelemetryConsole
    ├── LogTable
    └── ClearLogsButton
```

This maps very naturally to the components already identified in the source: `LiveBridge.tsx`, `VirtualScaleSimulator.tsx`, and `WelmecAuditPanel.tsx`. `Pasted markdown(20261004-065148).md`

---

# 32. Frontend state

The source already gives an excellent IoT state contract.

The relevant UI state includes:

```ts id="8qd2l5"
isConnected
isSimulatorActive
currentPacket
currentWeight
isStable
unit
isZero
mode
serialLogs
welmecAudit
autoCaptureToGrid
lastCapturedWeight
```

and actions for:

```ts
setIsSimulatorActive()
setAutoCaptureToGrid()
connectPhysicalSerial()
disconnectPhysicalSerial()
sendSerialCommand()
interrogateWelmec()
captureCurrentReading()
clearLogs()
```

`Pasted markdown(20261004-065148).md`

So unlike some earlier screens, this page already has a very clear natural frontend state model.

---

# 33. Dummy simulator behavior

For the first frontend build, make the simulator feel real.

Example:

```text id="au2l4k"
0.000 kg
  ↓
0.850 kg   UNSTABLE
  ↓
1.000 kg   UNSTABLE
  ↓
1.005 kg   STABLE
```

Once stable:

```text id="x5sn3x"
✓ Stable reading available
```

Then if auto-capture is ON:

```text id="t6b006"
1.005 kg
● STABLE

↓ AUTO-CAPTURE

✓ Inserted into active test
```

This gives the judges something visible to interact with.

---

# 34. Simulator architecture

Because the source defines the simulator as a **zero-hardware balance emulator generating CAS, Mettler and Avery ASCII packets**, `Pasted markdown(20261004-065148).md` the dummy frontend should actually generate fake packets internally rather than merely changing the number displayed.

For example:

```ts id="0w6efz"
interface SerialTelemetryPacket {
  timestamp: string;
  protocol: "CAS" | "METTLER_SICS" | "AVERY_SMA";
  direction: "RX" | "TX";
  raw: string;
  weight: number;
  stable: boolean;
  unit: "g" | "kg";
}
```

That gives you a realistic bridge between:

**raw packet → parsed telemetry → live display → capture**

without needing hardware.

---

# 35. One excellent demo interaction

This should be your “wow” flow.

### Step 1

Click:

**Load Virtual Scale Simulator**

### Step 2

Select:

**CAS**

### Step 3

The dashboard begins receiving telemetry:

```text
RX  09:42:11  UNSTABLE
RX  09:42:12  UNSTABLE
RX  09:42:13  STABLE
```

### Step 4

The screen changes:

```text
12.345 kg
● STABLE
```

### Step 5

Click:

**Capture Reading**

### Step 6

The current test row receives:

```text
Observed Reading
12.345 kg
```

### Step 7

The telemetry log and test observation are both visible as connected evidence.

That makes the “digitalization” claim tangible.

---

# 36. What NOT to do

Avoid:

❌ A hacker-style terminal as the main UI  
❌ Huge raw packet logs  
❌ Ten serial configuration fields on screen  
❌ Making WELMEC dominate the page  
❌ Flashing LEDs everywhere  
❌ Fake IoT charts that don't answer anything  
❌ Random sensor graphs  
❌ Showing “connected” without distinguishing physical/simulator  
❌ Allowing unstable readings to look equivalent to stable ones

The bridge should look like **precision instrumentation software**, not an IoT hobby project.

---

# 37. 5-second comprehension test

A judge enters the screen.

Within seconds they should see:

```text id="8l3wxt"
LIVE SCALE BRIDGE

● VIRTUAL SCALE ACTIVE

12.345 kg

● STABLE

GROSS

[ Capture Reading ]

────────────────────────

WELMEC 7.2
C     12
P     08
Firmware ...
✓ Telemetry available
```

They immediately understand:

**Connected?** Yes.  
**What device?** Virtual/physical clearly identified.  
**Current reading?** 12.345 kg.  
**Stable?** Yes.  
**Can I use it?** Capture.  
**Is software assurance visible?** WELMEC panel.  

That's the right screen.

---

# 38. Final place in the architecture

One important architectural point:

**Scale Bridge is not a test step.**

It is a **supporting instrument interface** that can feed the current test procedure.

So:

```text id="r5obgc"
TEST SESSION
      │
      ├── Weighing Test
      │       ↑
      │       │
      │   Scale Bridge
      │
      ├── Repeatability
      │       ↑
      │       │
      │   Scale Bridge
      │
      └── Other Tests
```

This preserves the cleaner architecture we established earlier rather than turning hardware connection into another statutory workflow stage.

The source itself describes Scale Bridge as a dedicated `live_bridge` view and separately defines the IoT context that manages the physical serial connection, simulator, telemetry and auto-capture behavior. `Pasted markdown(20261004-065148).md`

---

## Final screen hierarchy

```text id="1v2p39"
LIVE SCALE BRIDGE
        │
        ▼
┌──────────────────────────┐
│ CONNECTION               │
│ ● Physical / Simulator   │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│ LIVE WEIGHT              │
│                          │
│       12.345 kg          │
│       ● STABLE           │
│                          │
│     [ CAPTURE ]          │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│ WELMEC 7.2               │
│ C / P / Firmware Hash    │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│ TELEMETRY                │
│ RX / TX packets          │
└──────────────────────────┘
```

**Next: Screen 16 - Legacy Excel Ingestion & Flaw Auditor.**

## Prompt:
10/4/2026, 6:44:16 PM

next

## Response:
10/4/2026, 6:44:29 PM · gpt-5-6-t-mini

> **Searched files for relevant information**
>
> 
>
> Worked for 6s

# Screen 16 - Legacy Excel Ingestion & Flaw Auditor

This is the **migration + quality-assurance screen**.

Its purpose is not simply:

> “Upload an Excel file.”

It should communicate a much stronger idea:

> **“Take an existing legacy verification spreadsheet, inspect what it contains, recalculate it using the application's configured methodology, and reveal discrepancies that could have produced incorrect compliance results.”**

The supplied specification defines Screen 16 as an `.xlsx` drag-and-drop ingestion workspace with a one-click benchmark and four analysis tabs: **Discrepancies, Weighing Recalculation, Eccentricity Comparison, and Extracted Metadata**. `Pasted markdown(20261004-065148).md`

---

# 1. Core mental model

The whole page should follow:

```text
LEGACY EXCEL
     ↓
INGEST
     ↓
UNDERSTAND
     ↓
RECALCULATE
     ↓
COMPARE
     ↓
FIND FLAWS
     ↓
MIGRATE / ACT
```

This is **not** another normal data-entry page.

It is closer to a **forensic spreadsheet auditor**.

---

# 2. Overall desktop wireframe

```text id="aex1h2"
┌──────────────────────────────────────────────────────────────────────────────┐
│ LEGACY EXCEL AUDITOR                                                        │
│ Inspect historical spreadsheets against the digital verification workflow   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                        │ │
│ │                     DROP LEGACY EXCEL FILE                              │ │
│ │                                                                        │ │
│ │                 Drag & drop .xlsx here                                 │ │
│ │                                                                        │ │
│ │                     or [ Browse Files ]                                 │ │
│ │                                                                        │ │
│ │                  Excel workbooks only                                   │ │
│ │                                                                        │ │
│ │               [ Run Instant Benchmark Demo ]                            │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐ │
│ │ 24            │ │ 3            │ │ 1            │ │ 20                 │ │
│ │ ROWS ANALYZED │ │ DISCREPANCIES│ │ HIGH RISK   │ │ MATCHED RECORDS     │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └────────────────────┘ │
│                                                                              │
│ [ Discrepancies ] [ Weighing ] [ Eccentricity ] [ Metadata ]               │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ ANALYSIS RESULTS                                                       │ │
│ │                                                                        │ │
│ │ ...                                                                    │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

The upload area gets the user's attention first; the results take over once ingestion completes.

---

# 3. Page header

Use:

### **Legacy Excel Auditor**

Supporting text:

> Import historical verification records and compare them against the digital test workflow.

Small secondary badge:

```text id="q6qk5l"
LEGACY DATA
```

Avoid calling the page merely **Excel Migration**.

“Migration” sounds like a file conversion tool.

“Legacy Excel Auditor” communicates the actual value much better.

---

# 4. Upload zone

The source explicitly requires:

**Drag-and-drop `.xlsx` upload card** plus **Run Instant Benchmark Demo**. `Pasted markdown(20261004-065148).md`

### Empty state

```text id="7r6vvs"
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                     ↑                                  │
│                Upload Spreadsheet                       │
│                                                         │
│ Drag and drop a legacy .xlsx verification workbook     │
│ here, or browse your computer.                         │
│                                                         │
│                 [ Browse Files ]                        │
│                                                         │
│                         or                              │
│                                                         │
│            [ Run Instant Benchmark Demo ]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Keep it uncluttered.

Do not show a hundred supported-format explanations.

---

# 5. Demo-first experience

For the hackathon, **Run Instant Benchmark Demo** is extremely important.

The source explicitly calls for this one-click action. `Pasted markdown(20261004-065148).md`

Click:

**Run Instant Benchmark Demo**

Then animate:

```text id="qv6hvn"
Reading workbook...
✓ Sheet detected

Extracting observations...
✓ 31 rows

Checking formulas...
✓ Formula patterns identified

Recalculating...
✓ Digital comparison complete

Finding discrepancies...
✓ Analysis finished
```

Then automatically move into the results state.

This lets a judge understand the feature without having to bring an Excel file.

---

# 6. Uploaded workbook state

Once the file exists:

```text id="o7z1k4"
┌───────────────────────────────────────────────────────────┐
│ ✓ WORKBOOK INGESTED                                      │
│                                                           │
│ Verification_Report_2025.xlsx                            │
│ 1.8 MB • 3 sheets • 31 observations                      │
│                                                           │
│ Imported just now                                         │
│                                                           │
│ [ Replace File ]                     [ Re-run Analysis ] │
└───────────────────────────────────────────────────────────┘
```

Don't immediately open every result.

Let the summary establish what happened.

---

# 7. Analysis summary cards

After ingestion:

```text id="n8i4cb"
31
OBSERVATIONS

3
DISCREPANCIES

1
HIGH-RISK FINDING

27
MATCHED
```

The exact values can be synthetic demo values.

What matters visually is:

**How much data?**

**How many issues?**

**How serious?**

---

# 8. Critical distinction: discrepancy ≠ failure

Don't label every discrepancy as a statutory failure.

Use:

```text id="5prg6j"
MATCH
WARNING
DISCREPANCY
HIGH-RISK
```

Then reserve:

`FAIL`

for a domain-calculated compliance outcome.

This keeps the auditor trustworthy.

---

# 9. Four analysis tabs

The source specifies exactly these four sub-tabs: `Pasted markdown(20261004-065148).md`

```text id="7c7q0y"
[ Discrepancies ]
[ Weighing Recalculation ]
[ Eccentricity Comparison ]
[ Extracted Metadata ]
```

The selected tab should be visually dominant.

---

# 10. Tab 1 - Discrepancies

This should be the **default tab after analysis**.

Why?

Because the user does not really care that the workbook was parsed.

They care:

> **“Did the old spreadsheet contain problems?”**

---

## Discrepancy layout

```text id="mng9s5"
┌────────────────────────────────────────────────────────────┐
│ AUDIT SUMMARY                                             │
│                                                           │
│ 3 discrepancies found                                    │
│ 1 requires immediate review                              │
└────────────────────────────────────────────────────────────┘

┌──────┬──────────────────────┬──────────┬───────────────────┐
│ #    │ Finding              │ Severity │ Evidence          │
├──────┼──────────────────────┼──────────┼───────────────────┤
│ 01   │ False Pass           │ HIGH     │ Row 17            │
│ 02   │ Formula mismatch     │ MEDIUM   │ Row 22            │
│ 03   │ Missing metadata     │ LOW      │ Sheet 1           │
└──────┴──────────────────────┴──────────┴───────────────────┘
```

---

# 11. Finding cards

For the most important finding:

```text id="cn9tov"
┌──────────────────────────────────────────────────────────────┐
│ HIGH-RISK DISCREPANCY                                       │
│                                                             │
│ False Pass detected                                         │
│                                                             │
│ Legacy spreadsheet result                                   │
│ PASS                                                        │
│                                                             │
│ Recalculated digital result                                 │
│ FAIL                                                        │
│                                                             │
│ Evidence                                                    │
│ Observation row 17                                          │
│                                                             │
│ [ Inspect Finding → ]                                       │
└──────────────────────────────────────────────────────────────┘
```

This is a very strong judge-facing visual.

---

# 12. Rounding-discrepancy demo

The specification includes a dedicated **rounding discrepancy trap** scenario where a naive spreadsheet approach produces a false pass while turning-point evaluation exposes a failing unrounded error. `Pasted markdown(20261004-065148).md`

This makes the Excel Auditor one of the strongest places to demonstrate your product.

Example:

```text id="1u8gs0"
LEGACY EXCEL
Observed error
0.00 g
✓ PASS

DIGITAL RE-CALCULATION
Unrounded error
-5.3 g
✕ FAIL

LEGAL LIMIT
±5.0 g
```

Then:

```text id="gqk6d9"
⚠ ROUNDING DISCREPANCY

The legacy result appears compliant after
rounding, while the recalculated result
exceeds the configured tolerance.

[ View Calculation ]
```

This is the kind of screen that lets a judge immediately understand **why your software is more reliable than manual spreadsheets**.

---

# 13. Finding drawer

Click:

**Inspect Finding →**

Open a right-side drawer.

```text id="3eym1g"
┌─────────────────────────────────────────────────────────┐
│ FINDING DETAILS                                     ×   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ HIGH-RISK DISCREPANCY                                   │
│                                                         │
│ Finding                                                │
│ False Pass                                             │
│                                                         │
│ Workbook Row                                            │
│ 17                                                      │
│                                                         │
│ Legacy Result                                           │
│ PASS                                                    │
│                                                         │
│ Recalculated Result                                     │
│ FAIL                                                    │
│                                                         │
│ Difference                                              │
│ -5.3 g                                                  │
│                                                         │
│ [ View Legacy Formula ]                                 │
│ [ View Recalculation ]                                  │
└─────────────────────────────────────────────────────────┘
```

Progressive disclosure keeps the main table clean.

---

# 14. Tab 2 - Weighing Recalculation

The source specifically requires a **side-by-side comparison table: Legacy Formula vs. OIML Turning Point**. `Pasted markdown(20261004-065148).md`

This should be visually unmistakable.

```text id="si1lhi"
WEIGHING RECALCULATION

┌───────────────────────┬───────────────────────┐
│ LEGACY SPREADSHEET    │ DIGITAL RE-CALCULATION│
├───────────────────────┼───────────────────────┤
│ Formula               │ Turning Point         │
│ I - L                │ P = I + 0.5e - ΔL    │
│                       │                       │
│ Error                 │ Error                 │
│ 0.0 g                 │ -5.3 g                │
│                       │                       │
│ Result                │ Result                │
│ PASS                  │ FAIL                  │
└───────────────────────┴───────────────────────┘
```

---

# 15. Don't drown the user in formulas

The source's overall design philosophy says technical proof should be revealed progressively and that the UI should use friendly terminology. `Pasted markdown(20261004-065148).md`

Therefore:

Primary:

**Legacy calculation**

Secondary:

**Digital calculation**

Then:

`View calculation proof`

Only after clicking should the detailed formula appear.

---

# 16. Recalculation comparison table

Below the hero comparison:

```text id="a5q7nq"
| Target Load | Legacy Reading | Legacy Error | Digital Error | Result |
|-------------|----------------|--------------|---------------|--------|
| 5.000 kg    | 5.005 kg       | +5 g         | +5.2 g        | FAIL   |
| 10.000 kg   | 10.005 kg      | +5 g         | +5.3 g        | FAIL   |
| 15.000 kg   | 15.000 kg      | 0 g          | +0.1 g        | PASS   |
```

Keep the language aligned with the broader product's human-readable observation terminology. `Pasted markdown(20261004-065148).md`

---

# 17. Tab 3 - Eccentricity Comparison

The source requires:

> **Recalculated corner load deviations.** `Pasted markdown(20261004-065148).md`

So make this visual rather than table-only.

```text id="m2m7da"
ECCENTRICITY COMPARISON

       LEGACY                   DIGITAL
┌────────────────┐       ┌────────────────┐
│       ●        │       │       ●        │
│                │       │                │
│ ●          ●   │  VS   │ ●          ●   │
│                │       │                │
│       ●        │       │       ●        │
└────────────────┘       └────────────────┘
```

Then:

```text id="m9or6e"
Corner 1    +1.2 g     +1.2 g    MATCH
Corner 2    +0.8 g     +0.9 g    DIFFERENCE
Corner 3    +1.5 g     +1.4 g    DIFFERENCE
Corner 4    -4.1 g     -6.2 g    HIGH-RISK
```

---

# 18. Corner visualization

Reuse the conceptual visual language from the existing Eccentricity screen.

The source already defines an SVG platter heatmap with positions transitioning between green/amber/crimson according to deviation. `Pasted markdown(20261004-065148).md`

For the Excel auditor, however, keep it **static comparison-oriented**.

Don't create a second fully interactive test tool here.

You are showing:

> **“What the spreadsheet said vs what the system recalculated.”**

---

# 19. Worst discrepancy callout

Under the platter:

```text id="1qmr5e"
WORST DIFFERENCE

Corner 4
Legacy      -4.1 g
Recalculated -6.2 g

Difference
-2.1 g

⚠ Requires review
```

This is far easier to understand than burying the value in a table.

---

# 20. Tab 4 - Extracted Metadata

The source calls this **Extracted Metadata**, specifically for instrument parameters and verification metadata. `Pasted markdown(20261004-065148).md`

Make this a clean structured view.

```text id="y07m7f"
EXTRACTED METADATA

INSTRUMENT
────────────────────────────
Manufacturer      Avery
Model             ZM201
Serial Number     AV-2026-8812

METROLOGICAL
────────────────────────────
Accuracy Class    Class III
Max Capacity      30 kg
Min Capacity      100 g
Verification e    5 g

VERIFICATION
────────────────────────────
Stage             Subsequent Verification
Operator          Shashi Shekhar
Date              04 Oct 2026

SOURCE
────────────────────────────
Workbook          verification_2025.xlsx
Sheet             Test Report
```

Don't turn this into editable inputs.

It is extracted evidence.

---

# 21. Metadata confidence

A useful visual addition is a simple extraction state:

```text id="9vwgfo"
✓ 24 fields confidently extracted
⚠ 2 fields require confirmation
```

For example:

```text id="5qbrhj"
Serial Number
✓ Found in Nameplate sheet

Verification Stage
⚠ Not explicitly labelled
```

This is a UX recommendation, not something explicitly specified by the source. It should therefore remain a frontend behavior until the backend/data contract supports it.

---

# 22. “Use for migration” action

Once data has been audited successfully, there should be a controlled next step.

At the bottom:

```text id="7p8i5r"
✓ Workbook analysis complete

27 records match
3 discrepancies require review

[ Export Audit Report ]    [ Create Digital Session → ]
```

The second action should only be enabled when the application can confidently map the required information.

For now, in the dummy frontend, it can open a confirmation dialog.

---

# 23. Don't automatically import questionable data

This is important.

Suppose the workbook contains:

```text id="x6j4rd"
Legacy PASS
Digital FAIL
```

Don't offer:

**Import All**

Instead:

```text id="h2rbcy"
3 records require review before migration.
```

Then:

**Review discrepancies**

This preserves the core integrity concept of the application.

---

# 24. Benchmark results

For the demo mode, create a compact top summary:

```text id="wmp0b8"
INSTANT BENCHMARK COMPLETE

31 rows analyzed
27 matched
3 discrepancies
1 high-risk issue
```

Then:

```text id="nlnjms"
Legacy spreadsheet
       ↓
Digital recalculation
       ↓
Discrepancy detection
       ↓
Human review
```

That's the story.

---

# 25. File replacement

Once a workbook is loaded:

```text id="yq1m9h"
Verification_Report_2025.xlsx

[ Replace File ]
```

If clicked:

```text id="orvmyi"
Replace current workbook?

Current analysis will be cleared.

[Cancel] [Replace]
```

---

# 26. Invalid file state

Because the page accepts `.xlsx`, give clear feedback:

```text id="4q5f0s"
✕ FILE TYPE NOT SUPPORTED

Please select an Excel workbook (.xlsx).

[ Choose File ]
```

Not:

> Upload failed.

---

# 27. Parsing state

Use a genuine progress experience.

```text id="5z1qap"
Analyzing workbook

Reading sheets                 ✓
Extracting instrument data     ✓
Extracting observations        ✓
Identifying legacy formulas    ●
Recalculating results          ○
Building discrepancy report   ○
```

This is much better than a generic spinner.

---

# 28. Large workbook state

For larger files:

```text id="tw2xid"
Analyzing 438 observations

████████████████░░░░ 81%

Current sheet
Verification Records
```

This creates confidence that something substantive is happening.

---

# 29. Legacy vs Digital visual language

Use two fixed column headers everywhere:

```text id="h7g57r"
LEGACY EXCEL
```

and

```text id="xv29m1"
DIGITAL VERIFICATION
```

Do not alternate between:

- Old
- New
- Current
- Correct
- System
- OIML
- Modern

Keep the terminology consistent.

---

# 30. Severity hierarchy

Use:

### HIGH-RISK

Red.

Something potentially changes the compliance result.

### REVIEW

Amber.

Difference exists but does not automatically establish a failure.

### INFORMATION

Neutral.

Metadata/formatting/etc.

This prevents the page from becoming visually noisy.

---

# 31. The strongest hackathon demo

This screen can become one of the **best 60-second demonstrations** in the whole application.

### Step 1

Click:

**Run Instant Benchmark Demo**

### Step 2

System shows:

```text id="e7k79q"
31 rows analyzed
3 discrepancies found
```

### Step 3

Open:

**Discrepancies**

You show:

```text id="0xw0bg"
LEGACY EXCEL
PASS

DIGITAL VERIFICATION
FAIL
```

### Step 4

Open:

**Weighing Recalculation**

The side-by-side result exposes the difference.

### Step 5

Open:

**Extracted Metadata**

Show that instrument parameters were automatically understood.

### Step 6

Say:

> “Instead of blindly migrating spreadsheets, we first audit the historical result and identify cases where legacy calculations differ from the configured digital evaluation.”

That demonstrates the actual value of your application.

---

# 32. Component architecture

```text id="6mle04"
ExcelIngestionView.tsx
│
├── LegacyFileDropzone
│   ├── FilePicker
│   ├── UploadProgress
│   └── BenchmarkButton
│
├── WorkbookSummary
│   ├── RowsAnalyzedCard
│   ├── DiscrepancyCard
│   ├── HighRiskCard
│   └── MatchedCard
│
├── AnalysisTabs
│   │
│   ├── DiscrepanciesView
│   │   ├── FindingsSummary
│   │   ├── FindingTable
│   │   └── FindingDrawer
│   │
│   ├── WeighingRecalculationView
│   │   ├── LegacyCalculationCard
│   │   ├── DigitalCalculationCard
│   │   └── ComparisonTable
│   │
│   ├── EccentricityComparisonView
│   │   ├── LegacyPlatter
│   │   ├── DigitalPlatter
│   │   └── CornerComparison
│   │
│   └── ExtractedMetadataView
│       ├── InstrumentMetadata
│       ├── VerificationMetadata
│       └── SourceMetadata
│
└── MigrationActionBar
    ├── ExportAuditReport
    └── CreateDigitalSession
```

---

# 33. Dummy state model

```ts id="t0e5f2"
type FindingSeverity =
  | "HIGH"
  | "REVIEW"
  | "INFO";

type FindingType =
  | "FALSE_PASS"
  | "FALSE_FAIL"
  | "FORMULA_MISMATCH"
  | "METADATA_MISMATCH"
  | "ECCENTRICITY_DIFFERENCE";

interface ExcelFinding {
  id: string;

  sheetName: string;
  rowNumber: number;

  type: FindingType;
  severity: FindingSeverity;

  title: string;

  legacyResult: string;
  digitalResult: string;

  description: string;
}
```

---

# 34. Dummy benchmark dataset

Create one **hero discrepancy** rather than making every row interesting.

Example:

```ts id="xvq5ua"
{
  id: "F-0017",
  sheetName: "Verification Data",
  rowNumber: 17,

  type: "FALSE_PASS",
  severity: "HIGH",

  title: "Rounding discrepancy",

  legacyResult: "PASS",
  digitalResult: "FAIL",

  description:
    "Legacy rounded value appears compliant while digital recalculation exceeds the configured tolerance."
}
```

Then a couple of minor findings:

```text id="7fa9hj"
F-0022
Formula mismatch
REVIEW

F-0028
Missing metadata
INFO
```

This keeps the demo believable instead of filling the page with artificial errors.

---

# 35. Visual design

This page can have a slightly more analytical feel than the certificate pages.

Use the standard design tokens:

```text id="7jcz8n"
Background     #F6F8FB
Surface        #FFFFFF
Border         #E4E8EF

Primary        #2563EB
PASS           #059669
WARNING        #D97706
FAIL           #DC2626
```

The most visually important pair should be:

```text id="yf7kjo"
LEGACY
vs
DIGITAL
```

Use a neutral divider between them.

---

# 36. One powerful comparison component

Build this as a reusable component:

```text id="1gu6h3"
┌─────────────────────────────────────┐
│ LEGACY                              │
│ PASS                                │
├─────────────────────────────────────┤
│               VS                    │
├─────────────────────────────────────┤
│ DIGITAL                             │
│ FAIL                                │
└─────────────────────────────────────┘
```

Then underneath:

```text id="ljtv37"
Why?
Digital recalculation detects
an unrounded value outside tolerance.

[ Inspect ]
```

This component can also be reused in your Jury Demo Assistant.

---

# 37. What NOT to do

Avoid:

❌ Making this a generic file uploader  
❌ Showing Excel grid replicas everywhere  
❌ Opening raw spreadsheet cells by default  
❌ Claiming every discrepancy is illegal/non-compliant  
❌ Automatically overwriting the original workbook  
❌ Auto-importing questionable records  
❌ Huge formula walls  
❌ Ten different charts  
❌ Too many “AI detected…” badges  
❌ Making migration more important than auditing

The unique value is **audit + comparison + safe migration**, not file storage.

---

# 38. 5-second comprehension test

When the judge arrives:

```text id="jcb5q0"
LEGACY EXCEL AUDITOR

Verification_Report_2025.xlsx
31 observations analyzed

3 DISCREPANCIES
1 HIGH-RISK

[ Discrepancies ]

LEGACY EXCEL           DIGITAL
PASS                   FAIL

⚠ Rounding discrepancy detected

[ Inspect Finding ]
```

They immediately understand:

**What did you upload?** Legacy verification data.  
**What did your system do?** Recalculate and compare.  
**Did it find anything?** Yes.  
**Why does it matter?** A historical PASS can become a DIGITAL FAIL.  
**What happens next?** Review/migrate safely.

That is a very strong product story.

---

# 39. Final architecture position

Screen 16 should sit **outside the main statutory test flow**:

```text id="w6h1pi"
                    METROLOGIX-76
                         │
             ┌───────────┴───────────┐
             │                       │
       NEW VERIFICATION       LEGACY DATA
             │                       │
             ↓                       ↓
        Test Session          Excel Auditor
             │                       │
             ↓                       ↓
          Testing               Audit
             │                       │
             └───────────┬───────────┘
                         ↓
                    Digital Record
                         ↓
                       Review
                         ↓
                     Certificate
```

So Excel Auditor is a **migration/assurance tool**, not a seventh or eighth testing procedure.

The source explicitly places it as `excel_migration` under the Assurance section, with the four required analysis areas. `Pasted markdown(20261004-065148).md`

---

# 40. The complete Screen 16 experience

```text id="m38z13"
UPLOAD
  │
  ▼
ANALYZE
  │
  ▼
┌──────────────────────────────┐
│ 31 RECORDS                   │
│ 3 DISCREPANCIES              │
│ 1 HIGH-RISK                  │
└──────────────────────────────┘
  │
  ├── Discrepancies
  │       ↓
  │   Find false pass
  │
  ├── Weighing Recalculation
  │       ↓
  │   Legacy vs Digital
  │
  ├── Eccentricity Comparison
  │       ↓
  │   Corner-by-corner difference
  │
  └── Extracted Metadata
          ↓
      Understand source data
          │
          ▼
      REVIEW / MIGRATE
```

And this gives us the complete **16-screen source-defined feature set**.

The next piece should now be the **Jury Demo Assistant**-not really another application page, but the cross-screen demonstration layer that ties the whole METROLOGIX-76 story together. The supplied specification defines it as a floating 10-minute timeline with countdown controls, presenter cues, statutory references, and automatic tab synchronization. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:45:23 PM

next

## Response:
10/4/2026, 6:45:32 PM · gpt-5-6-t-mini

> **Searched for detailed Jury Demo Assistant specifications**
>
> 
>
> Worked for 8s

# Screen 17 - Jury Demo Assistant / 10-Minute Autopilot

This one is different from the previous screens.

It is **not a normal application page**.

It is the **presentation control layer that sits on top of the entire METROLOGIX-76 application** and guides a hackathon judge through the product in a fixed sequence.

The supplied specification defines it as a **floating drawer** containing a minute-by-minute 10-minute timeline, countdown controls (`Play`, `Pause`, `Reset`), presenter cue cards, statutory references, key highlights, and automatic synchronization of the active sidebar tab when `Next Step` is clicked. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 1. Core mental model

The assistant should answer one question:

> **“What should I show the judges next, and what should I say?”**

So:

```text
JURY DEMO
    ↓
CURRENT TIME
    ↓
CURRENT DEMO STEP
    ↓
WHAT TO SHOW
    ↓
WHAT TO SAY
    ↓
NEXT
    ↓
APPLICATION NAVIGATES AUTOMATICALLY
```

That makes the presentation feel rehearsed without making the product itself feel scripted.

---

# 2. How it should appear

Do **not** create a permanent large sidebar for this.

Use a small floating trigger in the global header:

```text id="n2v7wp"
🎬 Jury Demo
```

or:

```text id="q6t4a8"
◉ DEMO
```

Clicking it opens the assistant as a **right-side floating drawer**.

---

# 3. Collapsed state

When not being used:

```text id="s8c0y9"
┌──────────────────────┐
│ 🎬 Jury Demo          │
│ 08:42 remaining       │
└──────────────────────┘
```

Keep this small.

It must never compete with the actual application.

---

# 4. Expanded drawer

```text id="k8w8jo"
                                           ┌───────────────────────────────┐
                                           │ JURY DEMO ASSISTANT       ×  │
                                           ├───────────────────────────────┤
                                           │                               │
                                           │ 08:42                         │
                                           │ REMAINING                     │
                                           │                               │
                                           │ [▶ Play] [Ⅱ Pause] [↻ Reset] │
                                           │                               │
                                           │ DEMO PROGRESS                 │
                                           │                               │
                                           │ ● 01 Overview                 │
                                           │ ● 02 Instrument               │
                                           │ ● 03 Automated Testing        │
                                           │ ● 04 Compliance                │
                                           │ ● 05 IoT                       │
                                           │ ● 06 Legacy Excel              │
                                           │ ● 07 Review                    │
                                           │ ● 08 Certificate               │
                                           │                               │
                                           │ ───────────────────────────── │
                                           │                               │
                                           │ CURRENT STEP                  │
                                           │ Automated Verification        │
                                           │                               │
                                           │ SHOW                          │
                                           │ Weighing Error                │
                                           │                               │
                                           │ SAY                           │
                                           │ “The system automatically      │
                                           │ calculates the test error and  │
                                           │ compares it with the legal     │
                                           │ tolerance.”                    │
                                           │                               │
                                           │ KEY HIGHLIGHTS                │
                                           │ ✓ Automated calculation        │
                                           │ ✓ PASS / FAIL                 │
                                           │ ✓ Evidence traceability        │
                                           │                               │
                                           │ [ ← Previous ] [ Next Step → ]│
                                           └───────────────────────────────┘
```

This should feel more like a **presenter's cockpit** than a generic help panel.

---

# 5. Header area

Top:

### **Jury Demo Assistant**

Subtitle:

> Guided 10-minute product walkthrough.

Then the timer:

```text id="1k6ka8"
08:42
REMAINING
```

Use IBM Plex Mono for the timer.

The timer should be highly visible but not huge enough to dominate the screen.

---

# 6. Countdown controls

The source explicitly requires:

- Play
- Pause
- Reset `Pasted markdown(20261004-065148).md`

Use:

```text id="w1tnet"
[ ▶ Play ] [ ⏸ Pause ] [ ↻ Reset ]
```

### Before starting

```text id="qmj7lf"
10:00
NOT STARTED

[ Start Demo ]
```

### Running

```text id="v9u0bo"
08:42
RUNNING

[ Pause ] [ Reset ]
```

### Paused

```text id="m3td3x"
08:42
PAUSED

[ Resume ] [ Reset ]
```

---

# 7. Timeline

The source explicitly calls for a **minute-by-minute timeline, Minutes 1 to 10**. `Pasted markdown(20261004-065148).md`

So don't represent it as ten random cards.

Use a clear vertical timeline:

```text id="4s3e2s"
10:00 ─ Overview
  │
  ├── 01:00 ─ Instrument Intake
  │
  ├── 02:00 ─ Physical Inspection
  │
  ├── 03:00 ─ Test Plan
  │
  ├── 04:00 ─ Automated Testing
  │
  ├── 05:00 ─ Eccentricity / Repeatability
  │
  ├── 06:00 ─ Environmental / Traceability
  │
  ├── 07:00 ─ IoT Bridge
  │
  ├── 08:00 ─ Legacy Excel Auditor
  │
  ├── 09:00 ─ Review + Digital Sign
  │
  └── 10:00 ─ Certificate + Verification
```

### Important

These minute labels are a **recommended demo sequence**, not a statutory sequence supplied by the source.

The source establishes the 10-minute timeline and the application's underlying workflow; it does not prescribe exact minute allocations for each feature. `Pasted markdown(20261004-065148).md`

So keep these timings configurable.

---

# 8. Current step

The current step should be unmistakable.

Example:

```text id="7nqj6i"
CURRENT STEP

04
AUTOMATED TESTING
```

Then:

```text id="eupglg"
Application view
Weighing Error
```

This matters because the assistant must tell the presenter **where the application should currently be**.

---

# 9. “SHOW” section

The assistant should explicitly tell the presenter what is on screen.

Example:

### SHOW

> **Weighing Error**

Then perhaps:

```text id="p8tpyh"
Focus:
Observation Grid
+
Error Corridor
```

This is better than making the presenter infer what to click.

---

# 10. “SAY” section

This is the most valuable part of the assistant.

The source explicitly calls for **presenter cues / script cue cards with statutory references and key highlights**. `Pasted markdown(20261004-065148).md`

Example:

```text id="s0l65u"
SAY

“Instead of manually calculating each
observation in a spreadsheet, the
system calculates the error and presents
the compliance result immediately.”

```

Then a small:

`Copy script`

button.

---

# 11. Keep script cues short

Do not create a presentation paragraph.

A cue card should be around 2-4 sentences.

Bad:

> “Our innovative cloud-enabled statutory digital transformation platform leverages...”

Good:

> “The operator enters the observed reading. The system calculates the error and compares it with the configured legal tolerance. PASS or FAIL is immediately visible.”

The UI is supposed to help the presenter **speak**, not make them read.

---

# 12. Key Highlights

Every step should have three or four points maximum.

Example:

```text id="i6tlur"
KEY HIGHLIGHTS

✓ Automated calculation
✓ Visual compliance result
✓ Audit-ready evidence
```

For the IoT step:

```text id="f7f8kc"
✓ Physical / virtual scale
✓ Stable-reading capture
✓ WELMEC examination
```

For Excel:

```text id="v7y0bq"
✓ Legacy workbook ingestion
✓ Recalculation
✓ Discrepancy detection
```

---

# 13. Statutory reference

The source specifically requests statutory references in the presenter cues. `Pasted markdown(20261004-065148).md`

Add a quiet expandable section:

```text id="g9k8so"
STATUTORY REFERENCE
OIML R 76
[ View reference ]
```

Clicking opens:

```text id="1ckn8j"
REFERENCE

OIML R 76
Relevant evaluation procedure

[ Close ]
```

Do not put long legal text directly into the cue card.

---

# 14. Automatic navigation

This is the **signature feature** of the Jury Demo Assistant.

The source explicitly says:

> Clicking `Next Step` automatically switches the active sidebar tab to the corresponding screen. `Pasted markdown(20261004-065148).md`

So:

```text id="7l3j1s"
[ Next Step → ]
        ↓
Timeline advances
        ↓
Application route changes
        ↓
Sidebar selection changes
        ↓
Relevant screen opens
        ↓
Assistant updates cue card
```

The presenter should never manually search through the sidebar.

---

# 15. Example

Current step:

```text id="w9wyxq"
STEP 04
WEIGHING
```

Click:

**Next Step →**

The application automatically:

```text id="r5m3r6"
Jury Assistant
     ↓
advances to STEP 05
     ↓
sidebar → Eccentricity
     ↓
Eccentricity screen opens
     ↓
new cue appears
```

The presenter sees:

> “Now we demonstrate corner-loading behavior and identify the worst position automatically.”

That is extremely polished.

---

# 16. Don't make automatic navigation destructive

If the presenter has manually changed some UI state, `Next Step` should not blindly wipe everything.

The assistant should only:

- change the active route
- update demo context
- select required demo scenario/state where appropriate

It should **not destroy user-entered data**.

---

# 17. Demo scenario integration

The application already has a Quick Scenario Launcher containing five synthetic demonstration cases. `Pasted markdown(20261004-065148).md`

The Jury Assistant should be able to say:

```text id="7o1f1j"
DEMO SCENARIO

Rounding Discrepancy Trap

[ Load Scenario ]
```

Then:

```text id="dr48gq"
✓ Scenario loaded

Next:
Open Weighing Error
```

This is much more powerful than showing a static page.

---

# 18. Recommended scenario sequence

For the 10-minute demo, I would use the source's existing synthetic scenarios rather than inventing new demo data.

### Opening

**Passing Baseline**

Shows the normal workflow.

### Main technical highlight

**Rounding Discrepancy Trap**

Shows why the digital system catches a false pass.

The source explicitly identifies this as the **core SIH highlight**. `Pasted markdown(20261004-065148).md`

### Second technical highlight

**Temperature Span Drift Fail**

Shows environmental non-compliance.

### Mechanical highlight

**Eccentricity Cantilever Twist**

Shows the red corner hotspot.

### Precision highlight

**High-Interval Class I Analytical**

Shows micro-precision.

You don't need to show all five during every demonstration.

---

# 19. Progress indicator

At the top:

```text id="c4b3bw"
DEMO PROGRESS

████████░░░░░░░░  6 / 10
```

But don't over-focus on it.

A simple:

`6 of 10`

is enough.

---

# 20. Previous / Next controls

Bottom:

```text id="idv0rd"
[ ← Previous ]                  [ Next Step → ]
```

### Previous

Should:

- move timeline backward
- navigate to previous route
- restore previous scenario context when applicable

### Next

Should:

- advance timeline
- navigate automatically
- update presenter cue
- change the highlighted step

---

# 21. Skip step

Useful addition:

```text id="0jrbi1"
⋮ More
   Skip Step
   Restart From Here
```

Because a real presentation might need to shorten a section.

Don't put a visible “Skip” button next to `Next Step`; that creates too many competing controls.

---

# 22. Pause behavior

While paused:

```text id="h9a42e"
DEMO PAUSED

Current step preserved.

The application view will remain unchanged.
```

This is important.

The presenter may need 30 seconds to answer a judge's question without the assistant advancing.

---

# 23. Timer warning

At:

```text id="ykrk7f"
02:00
```

show a subtle amber indicator:

```text id="b5a0ci"
2:00 remaining
```

At:

```text id="q1jm5u"
00:30
```

show:

```text id="4t5f6b"
30 seconds remaining
```

Don't add annoying sound effects unless explicitly requested.

---

# 24. Demo complete state

At the end:

```text id="h4p22j"
┌─────────────────────────────────────────┐
│ ✓ DEMO COMPLETE                         │
│                                         │
│ 10-minute walkthrough finished.         │
│                                         │
│ Covered                                  │
│ ✓ Automated testing                     │
│ ✓ IoT integration                       │
│ ✓ Legacy audit                          │
│ ✓ Review & authorization                │
│ ✓ Certificate verification              │
│                                         │
│ [ Restart Demo ] [ Close Assistant ]   │
└─────────────────────────────────────────┘
```

This gives the presentation a real ending.

---

# 25. Don't force the demo into a rigid script

The assistant should be a **guide**, not an autopilot that prevents the presenter from interacting.

The source calls it an **autopilot walkthrough assistant**, but its specified interaction is still centered around a floating drawer, timer controls, cues, and `Next Step`. `Pasted markdown(20261004-065148).md`

So:

```text
Presenter controls the presentation
                ↑
        Assistant provides guidance
```

not:

```text
Assistant takes over everything
```

---

# 26. Suggested 10-minute structure

A practical demonstration flow could be:

| Time | Demonstration |
|---|---|
| 0:00-1:00 | Problem + Dashboard |
| 1:00-2:00 | Instrument Registration |
| 2:00-3:00 | Test Plan / Applicability |
| 3:00-4:30 | Weighing + Rounding Trap |
| 4:30-5:30 | Eccentricity / Repeatability |
| 5:30-6:30 | Traceability + Environmental |
| 6:30-7:30 | Live Scale Bridge |
| 7:30-8:30 | Legacy Excel Auditor |
| 8:30-9:30 | Reviewer + Director Sign-Off |
| 9:30-10:00 | Certificate + QR + Audit Trail |

Again, this timing is a **recommended presentation plan**, while the source only mandates the 10-minute timeline, cue cards, references, controls and tab synchronization. `Pasted markdown(20261004-065148).md`

---

# 27. Why this particular sequence works

It tells the judges a story:

```text id="g8d8b0"
PROBLEM
Manual Excel
      ↓
SOLUTION
Digital Session
      ↓
INTELLIGENCE
Automatic calculations
      ↓
INTEGRATION
Live scale
      ↓
ASSURANCE
Audit + traceability
      ↓
AUTHORITY
Director signing
      ↓
OUTPUT
Verified certificate
```

That is much stronger than showing 15 screens randomly.

---

# 28. Jury mode visual treatment

The normal application remains exactly the same.

Only the assistant gets a slightly different styling:

```text id="r2d7h5"
Dark navy header
Thin blue accent
Subtle shadow
Compact drawer
```

Don't redesign the entire application when Demo Mode is active.

---

# 29. Demo mode badge

When active:

```text id="0g9bfi"
● JURY MODE
```

in the header.

This communicates to the presenter that automatic navigation is currently enabled.

When closed:

```text id="86kj3i"
```

the application returns completely to normal mode.

---

# 30. Accessibility

The drawer should support:

- `Esc` → close
- keyboard focus trap
- keyboard `←` / `→` navigation between steps
- `Space` → Play/Pause
- clear timer announcement
- visible focus states

The existing project specification already calls for accessible dialogs and keyboard-friendly UI primitives, so the assistant should follow the same system.

---

# 31. Mobile behavior

On mobile, do **not** use a huge permanent drawer.

Use:

```text id="h6a4ct"
🎬 Demo
```

floating at bottom-right.

Tap:

```text id="1b2b4j"
┌───────────────────────────────┐
│ JURY DEMO                 ×  │
│                               │
│ 08:42                         │
│                               │
│ STEP 04 / 10                  │
│ Automated Testing             │
│                               │
│ SAY                            │
│ “The system automatically...”  │
│                               │
│ [Previous] [Next →]           │
└───────────────────────────────┘
```

The assistant should occupy the majority of the viewport only when explicitly opened.

---

# 32. Component architecture

```text id="uh6v9h"
JuryDemoAssistant.tsx
│
├── JuryDemoTrigger
│
├── JuryDemoDrawer
│   ├── DemoHeader
│   │   ├── Title
│   │   ├── Timer
│   │   └── PlaybackControls
│   │
│   ├── DemoProgress
│   │
│   ├── DemoTimeline
│   │   └── DemoStep × 10
│   │
│   ├── CurrentStepCard
│   │   ├── ShowSection
│   │   ├── SaySection
│   │   ├── HighlightList
│   │   └── StatutoryReference
│   │
│   ├── ScenarioSelector
│   │
│   └── StepNavigation
│       ├── PreviousButton
│       └── NextStepButton
│
└── DemoCompletion
```

The source already specifically names `JuryDemoAssistant.tsx` in the component catalog. `Pasted markdown(20261004-065148).md`

---

# 33. State model

Keep it simple:

```ts
type DemoState =
  | "IDLE"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETE";

interface DemoStep {
  id: string;
  minute: number;

  title: string;

  route: string;

  show: string;

  presenterCue: string;

  highlights: string[];

  statutoryReference?: string;

  scenarioId?: string;
}

interface JuryDemoState {
  state: DemoState;

  currentStepIndex: number;

  elapsedSeconds: number;

  totalSeconds: number;

  isDrawerOpen: boolean;
}
```

---

# 34. Navigation mapping

This is where the assistant becomes powerful.

```ts id="2e9gu3"
const demoSteps = [
  {
    id: "overview",
    route: "/home",
  },
  {
    id: "intake",
    route: "/sessions/new",
  },
  {
    id: "test-plan",
    route: "/session/test-plan",
  },
  {
    id: "weighing",
    route: "/session/weighing",
  },
  {
    id: "eccentricity",
    route: "/session/eccentricity",
  },
  {
    id: "environment",
    route: "/session/environment",
  },
  {
    id: "bridge",
    route: "/scale-bridge",
  },
  {
    id: "excel",
    route: "/excel-auditor",
  },
  {
    id: "review",
    route: "/review",
  },
  {
    id: "certificate",
    route: "/reports",
  },
];
```

These route names are implementation suggestions; the supplied source defines the logical views rather than a fixed router contract. `Pasted markdown(20261004-065148).md`

---

# 35. The assistant should coordinate the whole product

This is the important part.

For example:

```text id="6nfb0x"
Jury Assistant
      │
      ├── ScenarioContext
      │
      ├── LabContext
      │
      ├── IoTContext
      │
      └── Router
```

The existing application architecture already has separate `ScenarioContext`, `LabContext`, `IoTContext`, and `ThemeContext`, so the Jury Assistant should orchestrate these rather than duplicating state. `Pasted markdown(20261004-065148).md`

---

# 36. Demo scenarios + assistant

Example:

```text id="ws7r1g"
STEP 04 - WEIGHING

Scenario:
Rounding Discrepancy Trap

[ Load Scenario ]

Then:

[ Open Weighing Screen → ]
```

After loading:

```text id="k7pzbp"
✓ Scenario loaded
✓ Weighing screen ready

[ Next Step → ]
```

This lets you stage your most important technical highlight reliably.

---

# 37. Do not fake results during a demo

The assistant can load **synthetic scenarios**, which the project explicitly supports. `Pasted markdown(20261004-065148).md`

But make the UI label them clearly:

```text id="r3p2de"
DEMO SCENARIO
SYNTHETIC DATA
```

That avoids implying that synthetic readings are real regulatory records.

---

# 38. The best “wow” moment

I would make this the central demo sequence:

```text id="5cg6uw"
JURY MODE
      ↓
Load:
Rounding Discrepancy Trap
      ↓
Next Step
      ↓
Automatically opens Weighing
      ↓
Legacy-style result:
PASS
      ↓
Digital calculation:
FAIL
      ↓
Amber “Rounding Trap Active”
      ↓
Next Step
      ↓
Eccentricity
      ↓
Next Step
      ↓
Review
      ↓
Director Sign
      ↓
Certificate
```

The assistant is not merely a timer.

It becomes the **orchestration layer for the entire product demonstration**.

---

# 39. What NOT to do

Avoid:

❌ Making the assistant look like an AI chatbot  
❌ Adding a giant ChatGPT-style conversation interface  
❌ Auto-speaking the entire presentation  
❌ Forcing every demo step to run automatically  
❌ Covering half the application with the drawer  
❌ Adding irrelevant AI-generated commentary  
❌ Showing long legal references  
❌ Making the countdown feel like a game

This is a **professional presentation control**, not a chatbot.

---

# 40. The 5-second comprehension test

When the presenter opens it:

```text id="0n5w0g"
JURY DEMO ASSISTANT

08:42 REMAINING

STEP 04 / 10
WEIGHING

SHOW
Weighing Error

SAY
“The system calculates the
error automatically...”

HIGHLIGHTS
✓ Automated calculation
✓ Compliance result
✓ Audit evidence

[ Next Step → ]
```

There should be zero ambiguity.

---

# 41. Final relationship to the application

The entire product becomes:

```text id="jc3gqu"
                  METROLOGIX-76
                        │
        ┌───────────────┴────────────────┐
        │                                │
   APPLICATION                     JURY ASSISTANT
        │                                │
        │                         10-min timeline
        │                                │
        │                         Presenter cues
        │                                │
        │                         Scenario loading
        │                                │
        │                         Auto navigation
        │                                │
        └───────────────┬────────────────┘
                        ↓
                COHERENT DEMO
```

The source explicitly treats the Jury Assistant as a floating 10-minute walkthrough with **Play / Pause / Reset**, presenter cues, statutory references, key highlights, and **automatic sidebar-tab synchronization via `Next Step`**. `Pasted markdown(20261004-065148).md`

---

## The final experience

A judge shouldn't see:

> “Now let me find the next page…”

They should see:

```text id="gnn7c7"
STEP 04
WEIGHING

[ Next Step → ]
```

and the application itself moves to the right place.

That is what makes the whole METROLOGIX-76 frontend feel like a **single engineered product rather than a collection of screens**.

**Next: Instrument Details & Test Session Overview - the central case workspace that ties the whole 7-step verification together.**

## Prompt:
10/4/2026, 6:46:23 PM

next

## Response:
10/4/2026, 6:46:34 PM · gpt-5-6-t-mini

> **Searched for Agreed Test Session Overview Design**
>
> 
>
> Worked for 9s

# Screen 18 - Instrument Details & Test Session Overview

This is the **central case workspace** of METROLOGIX-76.

One important distinction before designing it: the supplied master specification does not define a standalone numbered “Instrument Details & Test Session Overview” screen in the same way it defines Screens 11-16. What it does define is a persistent verification-session header containing instrument context, traceability and the 7-step workflow, plus the session-driven testing architecture. `Pasted markdown(20261004-065148).md`

So this screen is our **architectural consolidation layer**: the place where someone opens a specific verification case and immediately understands its complete state.

The core idea:

> **One instrument → one verification session → one source of truth.**

---

# 1. Why this screen exists

Without this screen, users jump among:

```text
Sessions
↓
Intake
↓
Test Plan
↓
Weighing
↓
Eccentricity
↓
Repeatability
↓
Environmental
↓
Review
```

and have to mentally reconstruct what is happening.

Instead, this screen gives them one case-level answer:

```text
WHAT IS THIS?
      ↓
WHAT STAGE IS IT IN?
      ↓
WHAT HAS BEEN COMPLETED?
      ↓
WHAT FAILED / NEEDS ATTENTION?
      ↓
WHAT DO I DO NEXT?
```

That makes this the **home page of a verification session**.

---

# 2. Core mental model

Think:

```text id="xv4dqt"
                    TEST SESSION
                         │
        ┌────────────────┼─────────────────┐
        ↓                ↓                 ↓
   INSTRUMENT        PROGRESS          COMPLIANCE
        │                │                 │
        ↓                ↓                 ↓
    Identity          7 Steps          PASS / FAIL
    Specs             Completed        Warnings
    Traceability      Current          Blockers
        │                │                 │
        └────────────────┼─────────────────┘
                         ↓
                    NEXT ACTION
```

The **Next Action** is the most important part.

---

# 3. Desktop page layout

```text id="bw0c9f"
┌──────────────────────────────────────────────────────────────────────────────┐
│ SESSION OVERVIEW                                                             │
│ Verification Session                                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ INSTRUMENT                                                              │ │
│ │                                                                        │ │
│ │ Avery Weigh-Tronix                                                     │ │
│ │ ZM201 Retail Platform                                                  │ │
│ │ AV-2026-8812                                                           │ │
│ │                                                                        │ │
│ │ Class III    Max 30 kg    Min 100 g    e 5 g    d 5 g                 │ │
│ │                                                                        │ │
│ │ ● IN TESTING                                                           │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ VERIFICATION PROGRESS                                                   │ │
│ │                                                                        │ │
│ │ ✓ Registration → ✓ Precondition → ● Test Plan → ○ Testing → ...       │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────────────────────────────┐ ┌────────────────────────────┐ │
│ │ OVERALL RESULT                          │ │ NEXT ACTION                 │ │
│ │                                         │ │                            │ │
│ │          ● IN PROGRESS                  │ │ Complete Test Plan         │ │
│ │                                         │ │                            │ │
│ │ 4 / 7 workflow stages complete          │ │ [ Continue → ]             │ │
│ └─────────────────────────────────────────┘ └────────────────────────────┘ │
│                                                                              │
│ TEST RESULTS                                                                │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ Test 01        │ │ Test 02        │ │ Test 03        │ │ Test 04        │ │
│ │ ✓ Complete     │ │ ✓ Complete     │ │ ● Active       │ │ ○ Pending      │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
│                                                                              │
│ EVIDENCE & ASSURANCE                                                        │
│ ┌──────────────────────────────────┐ ┌────────────────────────────────────┐ │
│ │ Evidence                         │ │ Traceability                       │ │
│ │ 12 photos                        │ │ F1 Standard Set                    │ │
│ │ 31 observations                  │ │ ✓ Valid                             │ │
│ │ 4 comments                       │ │ Expires 18 Mar 2027               │ │
│ └──────────────────────────────────┘ └────────────────────────────────────┘ │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ SESSION TIMELINE                                                        │ │
│ │ Registered → Precondition → Testing → Review → Sign → Certificate      │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ [ Back to Sessions ]                              [ Continue Testing → ]    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 4. Page header

Use:

### **Verification Session**

Supporting text:

> Complete overview of this instrument, workflow progress, evidence and next action.

Then:

```text id="3p17ry"
SESSION
SES-2026-00184
```

And status:

```text id="g04d18"
● IN TESTING
```

---

# 5. Instrument identity card

This is the most important information block.

The persistent session header defined by the source includes:

- Serial number
- Model
- Accuracy class
- Max
- Min
- `e`
- `d`
- standard-weight traceability
- interactive 7-step stepper `Pasted markdown(20261004-065148).md`

On this overview page, make those values especially easy to scan.

### Example

```text id="q28cm7"
Avery Weigh-Tronix
ZM201 Retail Platform

AV-2026-8812

CLASS III
30 kg MAX
100 g MIN
e = 5 g
d = 5 g
```

Use IBM Plex Mono for the technical values.

---

# 6. Instrument image

A small instrument thumbnail is worthwhile here.

```text id="2nm4g0"
┌───────────────────────────────┐
│                               │
│       [scale image]           │
│                               │
└───────────────────────────────┘
```

Keep it secondary.

The page is about the **verification case**, not product photography.

---

# 7. Verification stage

Show the case stage clearly:

```text id="v06tyh"
VERIFICATION STAGE

SUBSEQUENT VERIFICATION
```

Don't make the operator infer it from the progress state.

The application's data model defines verification stages such as `INITIAL_TYPE_APPROVAL`, `SUBSEQUENT_VERIFICATION`, and `IN_SERVICE_INSPECTION`. `Pasted markdown(20261004-065148).md`

---

# 8. The central 7-step workflow

This should be the strongest visual structure on the page.

The source explicitly establishes the guided workflow:

```text
Intake & Specifications
↓
Physical & Visual Audit
↓
Weighing Error & Linearity
↓
Corner Loading
↓
Repeatability
↓
Environmental Drift & Tare
↓
Review / Signature / Seal
```

`Pasted markdown(20261004-065148).md`

But remember our architectural improvement:

**Registration / Precondition / Test Plan are session gates; the OIML test procedure itself is contextual inside the testing stage.**

So on this overview screen:

```text id="0m8k71"
01 Registration        ✓
02 Precondition        ✓
03 Test Plan           ✓
04 Testing             ●
05 Review              ○
06 Director Sign       ○
07 Certificate        ○
```

That gives the user a more accurate operational picture.

---

# 9. Step states

### Complete

```text id="k5kqfi"
✓
```

### Current

```text id="9r6n36"
●
```

### Pending

```text id="3sz3k6"
○
```

### Blocked

```text id="x4l9ab"
!
```

### Approved / immutable

```text id="h3mybn"
🔒
```

Don't use too many colors.

---

# 10. Clickable workflow

Every completed/current step should be clickable.

For example:

```text id="mxk1x8"
[ Test Plan ✓ ]
```

opens Test Plan.

```text id="n0f69o"
[ Testing ● ]
```

opens the appropriate current testing procedure.

However, don't let users use the stepper to bypass mandatory gates.

Example:

```text id="xyy9w3"
Testing
    ↓
Traceability expired
    ↓
🔒 Blocked
```

The overview should communicate that constraint immediately.

---

# 11. Overall status card

Use a single strong status card.

### In progress

```text id="h6u3bt"
OVERALL STATUS

● IN TESTING

4 of 7 workflow stages complete
```

### Ready for review

```text id="fkknh4"
✓ READY FOR REVIEW

All required testing completed
```

### Remanded

```text id="sv1gi6"
⚠ REMANDED

Reviewer action required

Reason available
```

### Approved

```text id="0xe8nd"
🔒 APPROVED

Immutable certification record
```

This connects directly to the role/status model defined in the source. `Pasted markdown(20261004-065148).md`

---

# 12. Next Action card

This is the **most useful card on the page**.

Instead of:

> “Progress: 4/7”

tell the operator exactly what to do.

### Example

```text id="q17jvt"
NEXT ACTION

Complete Test Plan

The instrument scope has not yet been
confirmed.

[ Continue → ]
```

Or:

```text id="evc9ce"
NEXT ACTION

Continue Weighing Test

6 observations remaining.

[ Resume Test → ]
```

Or:

```text id="1g0x6d"
NEXT ACTION

Resolve 1 reviewer comment

[ Open Review → ]
```

This gives the session a human-friendly operational center.

---

# 13. Test result summary

Don't replicate the entire test screens.

Use compact cards.

```text id="s31phm"
TEST RESULTS

┌──────────────────────┐
│ Test 01              │
│ ✓ PASS               │
│ 31 observations      │
│ [View]               │
└──────────────────────┘

┌──────────────────────┐
│ Test 02              │
│ ✓ PASS               │
│ 4 positions          │
│ [View]               │
└──────────────────────┘

┌──────────────────────┐
│ Test 03              │
│ ● ACTIVE             │
│ 12 / 24 readings     │
│ [Resume]             │
└──────────────────────┘
```

Again, use backend-defined test names when integrated.

---

# 14. Avoid inventing official test names

The master source establishes eight applicable OIML tests in the Test Applicability Matrix, but does **not** provide a canonical exhaustive naming list for them. `Pasted markdown(20261004-065148).md`

So the session overview should ideally render:

```ts
test.name
```

from the backend.

For frontend-only demo mode, using `Test 01`, `Test 02`, etc. is safer than pretending a custom label is statutory terminology.

---

# 15. Evidence summary

This page should answer:

> “What evidence exists?”

Example:

```text id="3yug1s"
EVIDENCE

12 Photos
31 Observations
10 Repeatability Readings
4 Audit Comments

[ View Evidence → ]
```

This could eventually pull from:

- photo dossier
- observation records
- audit comments
- environmental readings
- hardware telemetry

The source explicitly incorporates photo evidence, observations, and row-level audit comments throughout the workflow. `Pasted markdown(20261004-065148).md`

---

# 16. Traceability card

Show the selected standard weight:

```text id="tgwqlw"
TRACEABILITY

F1 Standard Set
FW-24-018

✓ VALID

Calibration
18 Mar 2027
```

Do not duplicate the entire registry.

Make it a **status proof**.

If expired:

```text id="nflp7g"
🔒 TESTING BLOCKED

FW-24-018
Calibration expired

[ Resolve Traceability ]
```

This ties directly to the hard-lockout requirement defined for Standard Weights. `Pasted markdown(20261004-065148).md`

---

# 17. Session metadata

A compact metadata section:

```text id="l5g6e9"
SESSION DETAILS

Session ID          SES-2026-00184
Verification Stage  Subsequent Verification
Created             04 Oct 2026
Operator            Shashi Shekhar
Laboratory          RRSL Bengaluru
Status              In Testing
```

Keep it compact.

Don't turn it into a 20-field table.

---

# 18. Audit summary

A small assurance card:

```text id="w4lk32"
AUDIT SUMMARY

✓ Session history recorded
✓ Evidence linked
✓ Comments tracked
✓ Current state consistent

[ View Audit Trail → ]
```

This gives Screen 13 a clear entry point.

---

# 19. Review summary

Once review begins:

```text id="vwqtx0"
REVIEW

Reviewer
A. Kumar

Decision
✓ Approved & Forwarded

Comments
0 unresolved

[ Open Review → ]
```

For remanded:

```text id="p6j1p6"
REVIEW

⚠ REMANDED

1 issue requires correction

Reason:
Observation requires clarification.

[ View Review ]
```

---

# 20. Director state

For a Director:

```text id="i0x4pe"
DIRECTOR AUTHORITY

Reviewer recommendation
✓ Approved

Certificate
Ready for signature

[ Sign & Stamp Certificate ]
```

For a Metrologist, the same area becomes:

```text id="2tbe9b"
DIRECTOR AUTHORITY

Waiting for reviewer and director
```

This reinforces role separation.

The source explicitly defines the Director as the final statutory authority and says the signed session becomes immutable. `Pasted markdown(20261004-065148).md`

---

# 21. Certificate preview after approval

Once signed, the overview shouldn't disappear.

Instead:

```text id="0i3tgc"
CERTIFICATE

CERT-2026-000184

✓ VERIFIED

Director
A. Kumar

[ View Certificate ]
[ Download PDF/A ]
```

Now the overview becomes a permanent case summary.

---

# 22. Session timeline

This should be a clean horizontal or vertical timeline:

```text id="4b3h8z"
SESSION HISTORY

✓ Registered
     ↓
✓ Precondition completed
     ↓
✓ Test plan confirmed
     ↓
● Testing
     ↓
○ Review
     ↓
○ Director
     ↓
○ Certificate
```

A vertical timeline is better on mobile.

---

# 23. “What needs attention?” card

This deserves its own area because it dramatically improves usability.

Example:

```text id="gdr1te"
ATTENTION NEEDED

⚠ 1 item

Observation row 14 has a reviewer flag.

[ Review Issue → ]
```

If there are no issues:

```text id="j55d7n"
✓ NO ACTIONS REQUIRED

Session is progressing normally.
```

This is a much better operational signal than a generic “Notifications” card.

---

# 24. Role-specific footer

At the very bottom, the action should adapt to the user's role.

### Metrologist

```text id="18nh0v"
[ Continue Testing → ]
```

### Reviewer

```text id="gweqs0"
[ Open Review → ]
```

### Director

```text id="l0v0cj"
[ Sign & Stamp Certificate → ]
```

### Auditor

```text id="u4pz5h"
[ View Audit Trail ] [ View Certificate ]
```

### Approved

```text id="t5rdw3"
🔒 READ-ONLY

[ View Certificate ] [ Audit Trail ]
```

This is consistent with the source's role-aware permissions. `Pasted markdown(20261004-065148).md`

---

# 25. The overview should not be a dashboard

Very important.

Avoid:

```text id="b7e7e7"
Revenue
Efficiency
Monthly Tests
Performance
Charts
Analytics
```

This page is about **one case**.

The operational dashboard already exists separately.

---

# 26. Recommended content hierarchy

The page should visually prioritize:

```text id="o7xyy9"
1. Instrument identity
2. Current status
3. Next action
4. Workflow progress
5. Test results
6. Attention items
7. Evidence
8. Traceability
9. Audit metadata
```

Not the reverse.

---

# 27. Main hero layout

A particularly strong version is:

```text id="v0yn9r"
┌───────────────────────────────────────────────────────────────┐
│ AVERY WEIGH-TRONIX                                            │
│ ZM201 RETAIL PLATFORM                                         │
│ AV-2026-8812                                                  │
│                                                               │
│ Class III • 30 kg • e = 5 g                  ● IN TESTING     │
│                                                               │
│ ───────────────────────────────────────────────────────────── │
│                                                               │
│ NEXT ACTION                                                   │
│ Complete Test Plan                                            │
│                                                               │
│                           [ Continue → ]                       │
└───────────────────────────────────────────────────────────────┘
```

This is an excellent “5-second” top fold.

---

# 28. Workflow stepper directly underneath

```text id="5s3u3p"
01         02         03         04         05         06       07
●          ●          ●          ◉          ○          ○        ○
Register   Precheck   Plan       Testing    Review     Sign     Cert
✓          ✓          ✓          CURRENT
```

This creates a very strong visual anchor.

---

# 29. Session health

One compact line:

```text id="x6l8m1"
SESSION HEALTH

✓ Traceability
✓ Required data
✓ Evidence
⚠ 1 attention item
```

This is better than another KPI card.

---

# 30. Empty / new session state

For a newly registered instrument:

```text id="3a1f9a"
NEW VERIFICATION SESSION

Instrument registration complete.

Next:
Complete precondition checks.

[ Start Precondition Check → ]
```

For a newly created session, don't show fake test percentages.

---

# 31. Approved immutable state

This is where the overview becomes especially elegant.

Top banner:

```text id="5yqf2a"
┌────────────────────────────────────────────────────────┐
│ 🔒 APPROVED - IMMUTABLE VERIFICATION RECORD            │
│                                                        │
│ This session is read-only following final authorization│
└────────────────────────────────────────────────────────┘
```

The source explicitly establishes this permanent read-only behavior after approval. `Pasted markdown(20261004-065148).md`

Then every test card becomes:

```text id="ggmwj9"
✓ COMPLETE
READ-ONLY
```

---

# 32. Remanded state

Don't merely show:

`REMANDED`

Show why the user is here.

```text id="bo9rra"
┌────────────────────────────────────────────────────────┐
│ ⚠ SESSION REMANDED                                    │
│                                                        │
│ Reviewer requested additional clarification.           │
│                                                        │
│ 1 issue requires operator action.                     │
│                                                        │
│ [ View Issue → ]                                       │
└────────────────────────────────────────────────────────┘
```

The source explicitly requires remand to carry statutory justification. `Pasted markdown(20261004-065148).md`

---

# 33. Component architecture

```text id="xhci87"
VerificationSessionOverview.tsx
│
├── SessionHeader
│   ├── InstrumentIdentity
│   ├── MetrologicalSummary
│   └── StatusBadge
│
├── SessionHero
│   ├── OverallStatus
│   ├── NextActionCard
│   └── AttentionSummary
│
├── SessionStepper
│
├── TestResultsOverview
│   └── TestResultCard × N
│
├── SessionEvidenceSummary
│   ├── PhotoCount
│   ├── ObservationCount
│   └── CommentCount
│
├── TraceabilitySummary
│
├── ReviewSummary
│
├── SessionMetadata
│
├── AuditSummary
│
├── SessionTimeline
│
└── RoleAwareActionFooter
```

---

# 34. State model

```ts id="n2p4ir"
type SessionPhase =
  | "REGISTRATION"
  | "PRECONDITION"
  | "TEST_PLAN"
  | "TESTING"
  | "REVIEW"
  | "DIRECTOR_SIGN"
  | "CERTIFICATE";

type SessionStatus =
  | "FRESH"
  | "IN_TESTING"
  | "PENDING_REVIEW"
  | "REMANDED"
  | "APPROVED";

interface VerificationSessionOverview {
  id: string;

  instrumentId: string;

  phase: SessionPhase;
  status: SessionStatus;

  verificationStage: VerificationStage;

  completedStages: number;
  totalStages: number;

  nextAction: {
    label: string;
    description: string;
    route: string;
  };

  attentionCount: number;

  applicableTests: number;
  completedTests: number;

  evidence: {
    photoCount: number;
    observationCount: number;
    commentCount: number;
  };

  traceability: {
    standardSetId: string;
    status: "VALID" | "EXPIRING" | "EXPIRED";
  };
}
```

---

# 35. Session overview with the existing contexts

This screen is a natural consumer of the application's existing frontend state architecture.

### `LabContext`

Provides:

- current laboratory
- user
- role
- online/sync status

### `ScenarioContext`

Provides:

- active synthetic scenario
- loaded session
- demo state

### `IoTContext`

Provides:

- current hardware connection
- last captured weight

The source already defines these contexts and their responsibilities. `Pasted markdown(20261004-065148).md`

---

# 36. Scenario banner

When a synthetic scenario is active:

```text id="6m4jm7"
DEMO SCENARIO

Rounding Discrepancy Trap
Synthetic verification data

[ View Scenario ]
```

This is useful for the Jury Demo Assistant.

And importantly, the source explicitly distinguishes these synthetic scenarios as demonstration stress cases. `Pasted markdown(20261004-065148).md`

---

# 37. Scale Bridge connection

If the current active test has recently captured a reading:

```text id="1bqy7i"
LAST HARDWARE READING

12.345 kg
● STABLE

Captured 18:42:11

[ View in Test ]
```

This is an excellent bridge between Screen 15 and the session.

---

# 38. Don't overload with historical details

The overview should summarize, not become the audit trail.

For example:

```text id="31d8n4"
Audit
42 events
✓ Chain verified

[ View Audit Trail ]
```

rather than putting 42 events onto this page.

This keeps Screen 13 meaningful.

---

# 39. The “case file” feeling

The final design should feel like a **digital case file**:

```text id="b85xcs"
┌───────────────────────────────────────────────┐
│ VERIFICATION CASE                            │
│                                               │
│ Instrument identity                           │
│ ↓                                             │
│ Verification status                           │
│ ↓                                             │
│ Workflow                                     │
│ ↓                                             │
│ Evidence                                     │
│ ↓                                             │
│ Assurance                                    │
│ ↓                                             │
│ Decision                                     │
└───────────────────────────────────────────────┘
```

That is the correct mental model for a regulated verification system.

---

# 40. The 5-second comprehension test

When someone opens a session, they should immediately see:

```text id="h2p2u7"
AV-2026-8812
Avery ZM201
Class III • 30 kg

● IN TESTING

Progress
3 / 7 stages

NEXT ACTION
Complete Test Plan

TESTS
2 Complete
1 Active
5 Pending

TRACEABILITY
✓ Valid

ATTENTION
0

[ Continue → ]
```

That's perfect.

No hunting.

No scrolling through a giant form.

No need to understand metrology to understand the current state.

---

# 41. Final architecture

This becomes the **hub** around which all the other screens operate:

```text id="n1c8jx"
                 SESSION OVERVIEW
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
   Instrument       Test Plan        Traceability
       │               │                │
       └───────────────┼────────────────┘
                       ↓
                 Test Procedures
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
    Weighing      Eccentricity    Repeatability
       │               │                │
       └───────────────┼────────────────┘
                       ↓
                 Environmental
                       ↓
                     Review
                       ↓
                  Audit Trail
                       ↓
                 Director Sign
                       ↓
                   Certificate
```

This is why I would make this the **central case-level screen** rather than another item in the global sidebar.

The supplied architecture already says the persistent session header should expose instrument context, traceability and the 7-step workflow; this screen simply gives that session context its proper **single-page operational home**. `Pasted markdown(20261004-065148).md`

**Next: Screen 19 - Test Readiness / Preflight Gate.**

## Prompt:
10/4/2026, 6:47:31 PM

next

## Response:
10/4/2026, 6:47:42 PM · gpt-5-6-t-mini

> **Searched files for relevant information**
>
> 
>
> Worked for 6s

# Screen 19 - Test Readiness / Preflight Gate

This is the **final safety gate before the first actual measurement is recorded**.

It sits between:

**Test Plan → Preflight → OIML Test Procedures**

Its purpose is brutally simple:

> **“Is everything required for this verification ready, and is it safe to start?”**

This screen should prevent the operator from starting a test session with missing instrument information, invalid traceability, an incomplete test plan, or another unresolved prerequisite.

The supplied specification establishes the broader prerequisites this screen needs to surface: instrument registration/specification validation, standard-weight traceability and hard lockout, test-scope determination, environmental conditions, and the guided verification workflow. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 1. Core mental model

This screen is a **GO / NO-GO gate**.

```text id="3nk1x8"
            TEST PLAN
                ↓
          PRE-FLIGHT CHECK
                ↓
       ┌─────────────────────┐
       │                     │
       │    CAN WE START?    │
       │                     │
       └─────────────────────┘
          ↓             ↓
        YES             NO
         ↓               ↓
   START TESTING      RESOLVE
```

The user should never leave this screen wondering what is blocking them.

---

# 2. Overall desktop wireframe

```text id="a8k4y1"
┌──────────────────────────────────────────────────────────────────────────────┐
│ TEST READINESS                                                              │
│ Preflight check before measurement                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ SESSION                                                                 │ │
│ │                                                                        │ │
│ │ Avery Weigh-Tronix • ZM201 Retail Platform                             │ │
│ │ AV-2026-8812 • Class III • 30 kg                                      │ │
│ │                                                                        │ │
│ │ Subsequent Verification                                                │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌──────────────────┐ ┌──────────────────┐ ┌───────────────────────────────┐ │
│ │ INSTRUMENT       │ │ TRACEABILITY     │ │ TEST PLAN                    │ │
│ │                  │ │                  │ │                               │ │
│ │ ✓ READY          │ │ ✓ VALID          │ │ ✓ COMPLETE                   │ │
│ │ Specs validated  │ │ F1 • FW-24-018   │ │ 8 / 8 applicable             │ │
│ └──────────────────┘ └──────────────────┘ └───────────────────────────────┘ │
│                                                                              │
│ READINESS CHECKLIST                                                         │
│                                                                              │
│ ✓ Instrument identity verified                                             │
│ ✓ Metrological specifications validated                                     │
│ ✓ Required standard weights valid                                           │
│ ✓ Test applicability confirmed                                               │
│ ✓ Required environmental baseline available                                  │
│ ○ Physical precondition not yet confirmed                                    │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ ENVIRONMENT BASELINE                                                    │ │
│ │                                                                        │ │
│ │ Temperature      23.4 °C      Humidity      48 %                      │ │
│ │ Pressure         1008 hPa      Recorded      18:31:42                  │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐ │
│ │ READINESS                                                               │ │
│ │                                                                        │ │
│ │ 5 / 6 checks complete                                                  │ │
│ │ █████████████████████░░░ 83%                                           │ │
│ │                                                                        │ │
│ │ 1 action is required before testing can begin.                         │ │
│ │                                                                        │ │
│ │                        [ Resolve Issue ]                                │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│                                                              [ Start Testing]│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Page header

Use:

### **Test Readiness**

Supporting text:

> Complete the preflight checks before recording verification measurements.

Right side:

```text id="3jv0sz"
● PRE-FLIGHT
```

When all checks pass:

```text id="xk6h8k"
✓ READY TO START
```

When blocked:

```text id="g4p53k"
⚠ ACTION REQUIRED
```

---

# 4. Session context

Keep the persistent session identity visible.

```text id="9u2bcr"
Avery Weigh-Tronix
ZM201 Retail Platform

AV-2026-8812

Class III
30 kg Max
e = 5 g

SUBSEQUENT VERIFICATION
```

This follows the application-wide session header pattern containing instrument identity, metrological specifications, traceability and workflow context. `Pasted markdown(20261004-065148).md`

---

# 5. Three readiness cards

These are the **three pillars** of preflight.

## Instrument

```text id="6u8ct4"
INSTRUMENT

✓ READY

Identity
Specifications
Validation
```

Clicking it opens the relevant instrument details.

---

## Traceability

```text id="m97h65"
TRACEABILITY

✓ VALID

F1
FW-24-018

Expires
18 Mar 2027
```

This must become red/blocked when the selected standard is expired, because the source explicitly specifies a hard lockout that disables test input when standard weights are expired. `Pasted markdown(20261004-065148).md`

---

## Test Plan

```text id="om6m7q"
TEST PLAN

✓ COMPLETE

8 / 8
APPLICABLE
```

Click:

**View Test Plan →**

and return to Screen 11.

---

# 6. Readiness checklist

This is the actual preflight engine.

Make each item a row:

```text id="t0g9m4"
✓  Instrument registered
✓  Identification complete
✓  Metrological specifications validated
✓  Accuracy class confirmed
✓  Standard weight traceability valid
✓  Test applicability determined
✓  Required environment recorded
✓  No blocking audit issue
```

Don't make operators manually check boxes for things the system can determine.

A checkmark should mean:

> **System evidence says this prerequisite is satisfied.**

Not:

> **Someone clicked the checkbox.**

---

# 7. Checklist row anatomy

```text id="1u1p7n"
✓

INSTRUMENT SPECIFICATIONS VALIDATED

Max, Min, e and d have passed configured
validation rules.

                      [View →]
```

For a warning:

```text id="h5vktv"
⚠

ENVIRONMENT BASELINE

Temperature recorded, but pressure
measurement is missing.

                      [Resolve →]
```

For a blocker:

```text id="j7ufag"
✕

STANDARD WEIGHT TRACEABILITY

Selected standard set is expired.

                      [Resolve →]
```

This follows the application's existing inline feedback philosophy: show the problem close to where it matters and provide an actionable next step. `Pasted markdown(20261004-065148).md`

---

# 8. Three readiness states

Every prerequisite should use one of only three states:

### READY

```text id="x70gto"
✓ READY
```

### ATTENTION

```text id="xk8z6d"
⚠ ATTENTION
```

### BLOCKED

```text id="d2z2jv"
✕ BLOCKED
```

Don't invent ten shades of status.

---

# 9. Critical rule: attention vs blocker

This distinction matters.

### Attention

The test can potentially continue, but an operator should resolve something first.

### Blocked

The application must prevent testing from starting.

For example:

```text id="phm9la"
Expired standard weight
        ↓
BLOCKED
        ↓
Start Testing disabled
```

This is directly aligned with the source's explicit hard-lockout behavior for expired standards. `Pasted markdown(20261004-065148).md`

---

# 10. Environment baseline

The source requires environmental conditions to be captured, including:

- Ambient Temperature
- Relative Humidity
- Atmospheric Pressure `Pasted markdown(20261004-065148).md`

So add:

### **Laboratory Environment**

```text id="9zq6dp"
LABORATORY ENVIRONMENT

Temperature
23.4 °C

Relative Humidity
48 %

Atmospheric Pressure
1008 hPa

Recorded
04 Oct 2026 • 18:31:42
```

---

# 11. Automatic baseline

Do not force the operator to type the values if the lab system already provides them.

Use:

```text id="r9i9q0"
✓ AUTO-POPULATED FROM LAB BASELINE
```

Then:

```text id="r4a7b5"
[ Edit ]
```

The source specifically describes automatic laboratory baseline population for these values. `Pasted markdown(20261004-065148).md`

---

# 12. Environment warning

If one parameter is missing:

```text id="8kixxp"
⚠ ENVIRONMENT INCOMPLETE

Atmospheric pressure has not been recorded.

[ Record Pressure ]
```

Don't show:

```text
Validation error 0x4003
```

The operator needs a human action.

---

# 13. Physical precondition check

The overall workflow includes the physical/visual audit before measurement, including the spirit-level and security-seal checks. `Pasted markdown(20261004-065148).md`

Therefore the preflight should summarize:

```text id="ug7mcl"
PHYSICAL PRECONDITION

✓ Instrument level confirmed
✓ Security seal inspected
✓ Visual inspection complete
```

or:

```text id="7ql1sv"
⚠ PHYSICAL PRECONDITION

Visual inspection has not been completed.

[ Complete Inspection → ]
```

Do not duplicate the entire camera/inspection screen here.

This is only the gate.

---

# 14. Test plan confirmation

Show:

```text id="kqzqig"
TEST PLAN

8 applicable procedures
8 configured
0 unresolved scope issues

✓ PLAN READY
```

and:

**View Plan →**

This connects directly to the Test Applicability Matrix we designed earlier.

---

# 15. Standard weight readiness

This needs to be especially strong.

### Valid

```text id="qqn1f3"
STANDARD WEIGHTS

F1 • FW-24-018
✓ CALIBRATION VALID

18 Mar 2027
```

### Expiring soon

```text id="vewd7y"
STANDARD WEIGHTS

F1 • FW-24-018
⚠ EXPIRING SOON

12 days remaining
```

### Expired

```text id="8twrfp"
┌───────────────────────────────────────────────┐
│ 🔒 TESTING BLOCKED                            │
│                                               │
│ Standard weight set FW-24-018 has expired.   │
│                                               │
│ Replace the standard before testing begins.  │
│                                               │
│ [ Manage Standard Weights ]                  │
└───────────────────────────────────────────────┘
```

The supplied specification explicitly requires an **un-dismissible full-width red lockout** when standard weights are expired. `Pasted markdown(20261004-065148).md`

---

# 16. Readiness score

Give the operator a simple summary:

```text id="7g84i0"
READINESS

6 / 6 CHECKS PASSED

████████████████████████ 100%
```

But don't treat this as a fake “AI confidence score.”

It is simply:

> **completed readiness checks / required readiness checks**

---

# 17. When blocked

At the bottom:

```text id="5lzgv0"
START TESTING

✕ Cannot begin testing

Resolve 1 blocking issue first.

[ View Blocking Issues ]
```

The primary button should be disabled.

---

# 18. When ready

When every mandatory condition passes:

```text id="5vuwj7"
┌────────────────────────────────────────────────────────────┐
│ ✓ READY TO BEGIN TESTING                                  │
│                                                            │
│ All required preflight checks have passed.                 │
│                                                            │
│                     [ Start Testing → ]                    │
└────────────────────────────────────────────────────────────┘
```

This should be the strongest green element on the page.

---

# 19. Start Testing confirmation

Don't force a modal for a completely ready case unless your interaction flow benefits from it.

A more elegant solution:

Click:

**Start Testing →**

Then transition:

```text id="qqd0xj"
READY
  ↓
INITIALIZING TEST SESSION
  ↓
LOADING TEST PLAN
  ↓
VERIFYING TRACEABILITY
  ↓
OPENING FIRST PROCEDURE
```

Then route directly to the appropriate test screen.

---

# 20. If a check changes while on this page

Example: a standard weight becomes expired.

The page should immediately update:

```text id="lmn8bo"
✓ READY TO START
       ↓
      ⚠
       ↓
🔒 TESTING BLOCKED
```

and disable the CTA.

The source's traceability model explicitly contemplates state-driven lockout across test screens, so this should also affect the readiness gate. `Pasted markdown(20261004-065148).md`

---

# 21. Blocker drawer

Click:

**View Blocking Issues**

Open a drawer:

```text id="x2lbm7"
┌─────────────────────────────────────────────┐
│ BLOCKING ISSUES                         ×   │
├─────────────────────────────────────────────┤
│                                             │
│ 01                                          │
│ Standard weight expired                     │
│                                             │
│ F1 • FW-24-018                              │
│ Expired 04 Oct 2026                         │
│                                             │
│ [ Replace Standard ]                        │
│                                             │
│ 02                                          │
│ Physical inspection incomplete              │
│                                             │
│ [ Complete Inspection ]                     │
└─────────────────────────────────────────────┘
```

This is much better than scattering the problem across multiple pages.

---

# 22. “Why can't I start?” interaction

This is an important usability feature.

If Start Testing is disabled, clicking the disabled area can show:

```text id="z0o8c7"
WHY IS TESTING BLOCKED?

2 mandatory prerequisites remain unresolved.

1. Standard weight validity
2. Physical inspection

[ View Issues ]
```

That removes frustration immediately.

---

# 23. Session progress

Keep the global session stepper visible.

Example:

```text id="00uh7s"
Registration     ✓
Precondition     ✓
Test Plan        ✓
Readiness        ● YOU ARE HERE
Testing          ○
Review           ○
Certificate      ○
```

This screen itself becomes:

**the final checkpoint before Testing.**

---

# 24. Contextual test preview

A useful secondary panel:

```text id="sdh0s1"
NEXT TEST

Procedure
TEST_03

Status
READY

Required evidence
Observation readings
Scale capture

[ Start After Preflight ]
```

Again, use the backend-defined procedure name when available.

Don't invent a statutory test name.

---

# 25. Scale bridge status

Because the app supports live hardware, add a small contextual indicator:

```text id="j6n0kq"
SCALE BRIDGE

● SIMULATOR ACTIVE
12.345 kg

```

or:

```text id="vqh0h0"
SCALE BRIDGE

○ NOT CONNECTED

Hardware connection is optional unless
the active procedure requires live capture.
```

This last part should ultimately be driven by test requirements rather than being a universal blocker.

---

# 26. Important: not everything should be a hard blocker

This is where the UX needs discipline.

For example:

```text id="9hh1ma"
Live hardware not connected
```

should **not automatically block all testing** if manual observation entry is permitted for that test.

Likewise, a demo can legitimately use the virtual simulator.

So the readiness engine should distinguish:

```text id="cx8fl1"
MANDATORY
OPTIONAL
INFORMATIONAL
```

This prevents the preflight screen from becoming unnecessarily restrictive.

---

# 27. Readiness rules architecture

Rather than hardcoding conditions inside the React component:

```ts
if (!instrument) ...
if (!weights) ...
```

make the page consume readiness rules:

```ts
interface ReadinessCheck {
  id: string;

  title: string;
  description: string;

  status: "READY" | "ATTENTION" | "BLOCKED";

  severity: "MANDATORY" | "OPTIONAL";

  actionLabel?: string;
  actionRoute?: string;
}
```

Then:

```ts
const readiness = {
  mandatoryTotal: 6,
  mandatoryPassed: 6,
  checks: [...]
};
```

This will make backend integration much cleaner later.

---

# 28. Final preflight state model

```ts
type ReadinessStatus =
  | "READY"
  | "ATTENTION"
  | "BLOCKED";

interface TestReadiness {
  status: ReadinessStatus;

  checks: ReadinessCheck[];

  requiredChecks: number;
  passedChecks: number;

  blockers: number;

  instrumentReady: boolean;
  traceabilityReady: boolean;
  testPlanReady: boolean;

  environmentReady: boolean;
  physicalInspectionReady: boolean;

  canStartTesting: boolean;
}
```

---

# 29. Component architecture

```text id="o9j3pw"
TestReadinessView.tsx
│
├── SessionHeader
│
├── ReadinessHeader
│   ├── PageTitle
│   ├── SessionIdentity
│   └── ReadinessStatus
│
├── ReadinessPillars
│   ├── InstrumentReadinessCard
│   ├── TraceabilityReadinessCard
│   └── TestPlanReadinessCard
│
├── ReadinessChecklist
│   └── ReadinessCheckRow × N
│
├── PhysicalPreconditionSummary
│
├── EnvironmentBaselineCard
│
├── BlockingIssuesDrawer
│
├── ReadinessSummary
│   ├── ProgressBar
│   ├── PassCount
│   └── BlockerCount
│
└── StartTestingFooter
```

---

# 30. Mobile layout

On mobile, stack the three pillars:

```text id="2u5jdz"
TEST READINESS

AV-2026-8812
Class III

─────────────────

INSTRUMENT
✓ READY

─────────────────

TRACEABILITY
✓ VALID

─────────────────

TEST PLAN
✓ COMPLETE

─────────────────

READINESS
6 / 6

████████████ 100%

✓ READY TO BEGIN

[ Start Testing → ]
```

That is very easy to scan.

---

# 31. Design language

This screen should feel **serious and controlled**, but not alarming.

Use:

```text id="a97fya"
READY      → Emerald
ATTENTION  → Amber
BLOCKED    → Crimson
PRIMARY    → Blue
```

Keep the rest neutral.

No gradients.

No giant dashboard graphics.

---

# 32. One excellent visual

Use a circular readiness indicator:

```text id="h7inwk"
        ╭─────────╮
       │    100%   │
       │           │
       │   READY   │
        ╰─────────╯
```

But only if it stays secondary.

The checklist itself remains the evidence.

---

# 33. What NOT to do

Avoid:

❌ “AI Readiness Score: 97%”  
❌ Arbitrary percentage scoring  
❌ Manually tickable system checks  
❌ Huge checklist paragraphs  
❌ Making every optional feature mandatory  
❌ Hiding blockers in tooltips  
❌ Allowing Start Testing when mandatory prerequisites fail  
❌ Showing technical OIML clauses everywhere  
❌ Repeating the entire Test Plan

The page is a **gate**, not a regulation manual.

---

# 34. The strongest user flow

The perfect operator journey becomes:

```text id="x5t8zz"
TEST PLAN
    ↓
[ Continue → ]
    ↓
TEST READINESS
    ↓
┌───────────────────────────────────┐
│ Instrument       ✓ READY          │
│ Traceability     ✓ VALID          │
│ Test Plan        ✓ COMPLETE       │
│ Environment      ✓ READY          │
│ Physical Audit   ✓ COMPLETE       │
└───────────────────────────────────┘
    ↓
✓ 6 / 6 CHECKS PASSED
    ↓
[ START TESTING → ]
    ↓
FIRST ACTIVE PROCEDURE
```

---

# 35. Blocked example

This should be equally polished:

```text id="k6r4n1"
TEST READINESS

AV-2026-8812
Class III

INSTRUMENT
✓ READY

TRACEABILITY
✕ BLOCKED
Standard FW-24-018 expired

TEST PLAN
✓ COMPLETE

ENVIRONMENT
✓ READY

PHYSICAL INSPECTION
✓ COMPLETE

────────────────────────────────

1 BLOCKER

Testing cannot begin until the
standard weight is replaced.

[ Manage Standard Weights ]
```

This is exactly the type of controlled behavior that makes the product feel like a real laboratory system rather than a collection of CRUD pages.

---

# 36. 5-second comprehension test

The judge should instantly see:

```text id="x86t5h"
TEST READINESS

WHAT?
AV-2026-8812 • Class III

READY?
✓ YES

WHY?
Instrument ✓
Traceability ✓
Test Plan ✓
Environment ✓

HOW MANY BLOCKERS?
0

NEXT?
[ START TESTING → ]
```

Or, when blocked:

```text id="jdhg3n"
READY?
✕ NO

BLOCKER
Expired standard weight

NEXT
Replace standard
```

No interpretation required.

---

# 37. Where this fits in our architecture

This is the cleanest end-to-end sequence:

```text id="qjts8f"
REGISTER INSTRUMENT
        ↓
PRECONDITION CHECK
        ↓
TEST PLAN
        ↓
★ TEST READINESS ★
        ↓
OIML TEST PROCEDURES
        ↓
REVIEW
        ↓
DIRECTOR SIGN
        ↓
CERTIFICATE
        ↓
AUDIT / REPOSITORY
```

The supplied design already establishes the instrument validation, physical audit, traceability gate, Test Applicability Matrix and guided test workflow; this preflight screen brings those prerequisites together into one explicit **GO / NO-GO checkpoint** before measurements begin. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

## The key design principle

**Never make the operator ask “Can I start?”**

The screen should answer it for them:

> **✓ READY TO BEGIN TESTING**

or

> **🔒 TESTING BLOCKED - 2 issues need attention**

That single principle will make this screen one of the most useful parts of the entire frontend.

**Next: Screen 20 - Settings / Laboratory Configuration.**

## Prompt:
10/4/2026, 6:48:31 PM

next

## Response:
10/4/2026, 6:48:42 PM · gpt-5-6-t-mini

> **Searched files for Screen 20 unsaved dangerous action settings**
>
> 
>
> Worked for 15s

# Screen 20 - Settings / Laboratory Configuration

This is the **system-control center** of METROLOGIX-76.

Unlike the testing screens, Settings should **not feel like another workflow page**. It should feel stable, administrative and deliberately controlled.

The source establishes the underlying entities this page must configure: laboratory identity, users/roles, standard-weight calibration information, application/theme behavior, and role permissions. It also defines Admin as the role responsible for laboratory system settings and weight-set calibration dates. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

One important source note: the supplied specification clearly defines the **settings areas and the Admin responsibility**, but does not provide a complete canonical settings-screen wireframe. So the detailed layout below is the recommended UI structure around those source-supported capabilities.

---

# 1. Core mental model

The Settings page should answer:

> **“How is this laboratory configured, who is allowed to do what, and what system rules are currently active?”**

So:

```text id="0h0g3e"
LAB CONFIGURATION
       ↓
IDENTITY
       ↓
ACCESS
       ↓
TRACEABILITY
       ↓
TEST DEFAULTS
       ↓
REPORTING
       ↓
SYSTEM BEHAVIOR
```

---

# 2. Overall desktop layout

I would use a **two-column settings workspace**, not a giant vertical form.

```text id="9a3j2x"
┌──────────────────────────────────────────────────────────────────────────────┐
│ SETTINGS                                                                     │
│ Laboratory configuration and system controls                                 │
├───────────────────────┬──────────────────────────────────────────────────────┤
│ SETTINGS              │ LABORATORY                                           │
│                       │                                                      │
│ ● Laboratory          │ RRSL Bengaluru                                      │
│   Users & Roles       │ Laboratory profile and statutory identity           │
│   Standards           │                                                      │
│   Test Defaults       │ ┌────────────────────────────────────────────────┐ │
│   Language            │ │ Laboratory name                                │ │
│   Certificates        │ │ Regional Reference Standards Laboratory        │ │
│   Appearance          │ │                                                │ │
│   Demo Mode           │ │ Laboratory code                                │ │
│                       │ │ RRSL-BLR                                        │ │
│                       │ │                                                │ │
│                       │ │ City / State                                   │ │
│                       │ │ Bengaluru / Karnataka                          │ │
│                       │ │                                                │ │
│                       │ │ Accreditation / registration details            │ │
│                       │ └────────────────────────────────────────────────┘ │
│                       │                                                      │
│                       │ ┌────────────────────────────────────────────────┐ │
│                       │ │ SYSTEM STATUS                                  │ │
│                       │ │ ● Online                                       │ │
│                       │ │ Local sync      ✓                              │ │
│                       │ │ Last saved      18:42:11                       │ │
│                       │ └────────────────────────────────────────────────┘ │
│                       │                                                      │
│                       │                     [ Save Changes ]                │
└───────────────────────┴──────────────────────────────────────────────────────┘
```

Left side = **settings navigation**.

Right side = **only the selected configuration area**.

---

# 3. Page header

Use:

### **Settings**

Supporting text:

> Configure laboratory identity, users, standards, test behavior and reporting preferences.

Right side:

```text id="5l1o3b"
ADMIN
```

For non-admin users:

```text id="q7j8a0"
READ-ONLY
```

This immediately communicates permission.

---

# 4. Settings navigation

Use these sections:

```text id="w89h7j"
LABORATORY
USERS & ROLES
STANDARDS
TEST DEFAULTS
LANGUAGE
CERTIFICATES
APPEARANCE
DEMO MODE
```

This structure matches the settings areas we established for the application.

Do **not** put every individual field into the sidebar.

---

# 5. Laboratory settings

Selected by default.

### Header

**Laboratory**

> Manage the identity and statutory profile of this laboratory node.

---

## Identity card

```text id="96r9x4"
LABORATORY IDENTITY

Laboratory Name
Regional Reference Standards Laboratory

Laboratory Code
RRSL-BLR

Lab Type
[ RRSL ▾ ]

City
Bengaluru

State
Karnataka
```

The supplied data model defines:

- `id`
- `code`
- `name`
- `city`
- `state`
- `labType`
- `nablAccreditationNo`

and supports lab types such as `RRSL` and `GATC`. `Pasted markdown(20261004-065148).md`

So these should become first-class settings.

---

# 6. Accreditation information

Separate technical identity from accreditation.

```text id="y5v6x3"
ACCREDITATION

NABL Accreditation Number
[ __________________ ]

Status
● Active

Valid Until
[ DD / MM / YYYY ]
```

But keep this section small.

The user shouldn't need to fill a giant government form every time they change a setting.

---

# 7. Laboratory branding

Recommended:

```text id="r0sojp"
DOCUMENT IDENTITY

Laboratory Logo
[ Upload ]

Government Identity Mark
[ Configured ✓ ]

Report Header
[ Preview ]
```

This is a **configuration recommendation**, not a source-defined requirement.

Its purpose is to support consistent certificate generation.

---

# 8. Unsaved changes

This is essential for Settings.

When modified:

```text id="xqnr57"
● Unsaved changes
```

At the bottom:

```text id="h9bg5u"
You have unsaved changes.

[ Discard ]     [ Save Changes ]
```

If the user attempts to navigate away:

```text id="6l7jpc"
UNSAVED CHANGES

Your changes have not been saved.

[ Stay Here ] [ Discard Changes ]
```

This is much safer than silently losing administrative configuration.

---

# 9. Users & Roles

This section should feel like **access control**, not a people directory.

Header:

### **Users & Roles**

> Control who can register, review, authorize and inspect verification records.

---

## User list

```text id="h0f3j7"
┌────────────────────────────────────────────────────────────────┐
│ USER                    ROLE           LAB              STATUS  │
├────────────────────────────────────────────────────────────────┤
│ Shashi Shekhar          METROLOGIST    RRSL-BLR          ● Active│
│ A. Kumar                DIRECTOR       RRSL-BLR          ● Active│
│ R. Singh                REVIEWER       RRSL-BLR          ● Active│
│ P. Das                  AUDITOR        RRSL-BLR          ● Active│
└────────────────────────────────────────────────────────────────┘
```

---

# 10. Role capability matrix

Click a user:

```text id="wbxj3d"
A. Kumar
LAB DIRECTOR

ACCESS LEVEL

✓ Review sessions
✓ Approve
✓ Sign certificates
✓ View audit trail
✓ Download certificates

Cannot
✕ Enter test observations
```

The source explicitly establishes distinct capabilities for Metrologist, Reviewer, Director, Auditor and Admin, including Director-only signing and Auditor read-only inspection. `Pasted markdown(20261004-065148).md`

---

# 11. Don't allow dangerous role changes casually

Changing:

```text id="8m0gd8"
DIRECTOR
↓
METROLOGIST
```

should require confirmation.

```text id="8ttr9y"
CHANGE ROLE?

This will modify the user's authorization
within the laboratory.

[ Cancel ] [ Confirm Change ]
```

For highly privileged operations, an additional authorization step can be introduced later.

---

# 12. Standards configuration

This section links directly to the Standard Weights page.

Header:

### **Standards**

> Manage laboratory standard-weight sets and their calibration validity.

Example:

```text id="t1v3ok"
F1 • FW-24-018
✓ VALID

Calibration Date
18 Mar 2026

Expiry Date
18 Mar 2027

[ View ] [ Edit ]
```

The source explicitly defines the standard registry and calibration-validity countdown, and Admin is responsible for weight-set calibration dates. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 13. Add standard flow

Admin:

**+ Add Standard Set**

Modal:

```text id="t9c3m8"
ADD STANDARD SET

Standard Class
[ F1 ▾ ]

Set ID
[ FW-24-019 ]

Calibration Certificate
[ Upload ]

Calibration Date
[ 18 / 03 / 2026 ]

Expiry Date
[ 18 / 03 / 2027 ]

[ Cancel ] [ Save Standard ]
```

Do not let normal Metrologists access this.

---

# 14. Retire a standard

Use a deliberately dangerous-action pattern:

```text id="z0r7i2"
RETIRE STANDARD

FW-24-018

Retiring this set will prevent it from
being selected for future verification.

[ Cancel ]
[ Retire Standard ]
```

Then require explicit confirmation.

---

# 15. Test Defaults

This should configure **operational defaults**, not let Admin casually override statutory logic.

Header:

### **Test Defaults**

> Configure laboratory defaults used when creating new verification sessions.

Examples:

```text id="te3q79"
DEFAULT VERIFICATION STAGE
[ Subsequent Verification ▾ ]

DEFAULT UNIT
[ kg ▾ ]

AUTO-SAVE OBSERVATIONS
[ ON ]

AUTO-CAPTURE STABLE READINGS
[ ON ]

DEFAULT REPORT LANGUAGE
[ English ▾ ]
```

---

# 16. Critical distinction: defaults vs legal rules

Do **not** place arbitrary controls such as:

```text id="l0no9e"
MPE LIMIT
[ Edit ]

OIML formula
[ Edit ]
```

into ordinary Settings.

The application is intended to automate configured verification procedures; the Test Plan should determine applicability from rules, not let an administrator casually rewrite statutory logic.

The source's design already emphasizes automatic calculations, predefined test applicability and controlled role permissions. `Pasted markdown(20261004-065148).md`

A better split is:

```text id="bhx3r0"
TEST DEFAULTS
       ↓
Operational configuration

STATUTORY RULES
       ↓
Controlled rule/configuration layer
```

---

# 17. Language settings

The source explicitly supports:

- English
- Hindi
- parallel bilingual output `Pasted markdown(20261004-065148).md`

Settings:

```text id="w2l88x"
LANGUAGE

Application Language
[ English ▾ ]

Certificate Language
[ English ▾ ]

Available Certificate Modes

● English
○ Hindi
○ Bilingual
```

---

# 18. Certificate settings

This section controls output presentation.

```text id="t3q9ff"
CERTIFICATE OUTPUT

Default Language
English

Default Format
PDF/A

Additional Format
DOCX

Verification QR
[ Enabled ✓ ]

Digital Signature
[ Enabled ✓ ]

Certificate Number Prefix
CERT

[ Preview Certificate ]
```

The PDF/A, DOCX, QR and Director signature behaviors are established elsewhere in the source. `Pasted markdown(20261004-065148).md`

---

# 19. Certificate numbering

For the dummy frontend:

```text id="2e3j1m"
NEXT CERTIFICATE

CERT-2026-000185
```

But don't make this editable casually.

If an Admin changes numbering rules:

```text id="v4zh5g"
This configuration affects future
certificate identifiers.
```

Then confirmation.

---

# 20. Appearance

Keep this section extremely simple.

```text id="6p92wl"
APPEARANCE

Theme

[ Light ]  [ Dark ]

Density

○ Comfortable
● Compact

Technical Font
IBM Plex Mono

Reduced Motion
[ OFF ]
```

The supplied design system already supports both light and dark themes and specifies Inter + IBM Plex Mono. `Pasted markdown(20261004-065148).md`

For this product, I recommend **Light** as the default because it makes official/laboratory workflows easier to scan.

---

# 21. Don't let themes break status semantics

Regardless of theme:

```text id="gq8n2g"
PASS       remains clearly PASS
FAIL       remains clearly FAIL
WARNING    remains clearly WARNING
LOCKED     remains clearly LOCKED
```

The status colors have semantic meaning throughout the application.

---

# 22. Demo Mode

This is where hackathon-specific controls belong.

Header:

### **Demo Mode**

> Configure synthetic scenarios and presentation behavior.

Show:

```text id="1a7g4e"
Jury Demo Assistant
● Enabled

Synthetic Scenarios
● Enabled

Virtual Scale Simulator
● Enabled

Tamper Simulation
● Enabled
```

Then:

```text id="j8q4rd"
[ Open Jury Demo Assistant ]
```

The source explicitly defines the scenario launcher, virtual scale simulator and Jury Demo Assistant as frontend demonstration features. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 23. Demo-only warnings

Clearly label:

```text id="of6m1x"
DEMO ENVIRONMENT

Synthetic scenarios do not represent
real statutory records.
```

For tamper simulation:

```text id="qj7mka"
SIMULATION ONLY

Integrity simulation affects demo state,
not production audit records.
```

This avoids confusion.

---

# 24. Dangerous Actions

Place this section at the **very bottom**.

Don't put it in the main settings flow.

```text id="5wk8yd"
────────────────────────────────────────

DANGEROUS ACTIONS

Reset demo environment
[ Reset ]

Clear local demo data
[ Clear ]

Restore default configuration
[ Restore Defaults ]
```

Use a muted red section heading.

---

# 25. Destructive confirmation

For:

**Restore Default Configuration**

show:

```text id="11h9t0"
RESTORE DEFAULTS?

This will replace the current demo
configuration with the application defaults.

This action cannot be undone.

Type RESET to continue.

[ Cancel ] [ Restore Defaults ]
```

This is much safer than a simple confirmation button.

---

# 26. System status

At the bottom:

```text id="1p5y6v"
SYSTEM STATUS

Application
v1.0.0-demo

Connection
● Online

Data Sync
✓ Synchronized

Laboratory
RRSL-BLR

Last Configuration Save
04 Oct 2026 • 18:44:12
```

The source's LabContext already models sync states such as:

- online/Postgres
- local SQLite syncing
- offline `Pasted markdown(20261004-065148).md`

So this panel maps naturally to the architecture.

---

# 27. Admin vs normal users

This screen should change based on the current role.

### Admin

Editable settings:

```text id="iyzv3h"
EDIT
SAVE
ADD
REMOVE
```

### Metrologist

Mostly read-only:

```text id="98m0eo"
LABORATORY
✓ View

STANDARDS
✓ View

DEMO
✓ View

SYSTEM
✓ View
```

### Reviewer

Can inspect configuration relevant to review but cannot modify it.

### Director

Can inspect/sign-related configuration, but shouldn't gain Admin system-management powers merely by being Director.

### Auditor

Read-only.

This follows the role model defined in the source. `Pasted markdown(20261004-065148).md`

---

# 28. Read-only visual treatment

Don't just grey out everything.

Use:

```text id="x8a3bf"
🔒 Managed by Administrator
```

next to protected sections.

Example:

```text id="s0cxup"
Certificate Number Prefix
CERT

🔒 Managed by Admin
```

This makes the permission system understandable.

---

# 29. Audit settings changes

Settings changes themselves should feed the existing audit trail.

For example:

```text id="59fzid"
ADMIN
Changed laboratory default language
English → Bilingual
04 Oct 2026 • 18:41:27
```

Then Screen 13 can show:

**Configuration Changed**

This creates consistency across the platform.

---

# 30. Important: settings should never silently alter active sessions

Suppose Admin changes:

```text id="x18y0u"
Default report language:
English → Bilingual
```

That should affect **future/new sessions**, unless explicitly designed otherwise.

An already approved certificate should never silently change because someone edited Settings.

Similarly:

```text id="blz9fy"
Session already APPROVED
       ↓
configuration changes
       ↓
approved record remains unchanged
```

This preserves the immutable-record concept already established in the application.

---

# 31. Settings save behavior

When the Admin changes a setting:

```text id="n4q8zj"
Save Changes
```

then:

```text id="gk1m0z"
Saving configuration...
       ↓
✓ Configuration saved
```

Toast:

> Laboratory configuration updated.

If save fails:

```text id="j7ssmd"
✕ Could not save configuration

No changes were applied.

[ Try Again ]
```

---

# 32. Component architecture

```text id="xn47e5"
SettingsView.tsx
│
├── SettingsHeader
│
├── SettingsNavigation
│
├── SettingsContent
│   │
│   ├── LaboratorySettings
│   │   ├── LaboratoryIdentityCard
│   │   ├── AccreditationCard
│   │   └── BrandingCard
│   │
│   ├── UserRoleSettings
│   │   ├── UserTable
│   │   ├── UserDetailsDrawer
│   │   └── RoleCapabilities
│   │
│   ├── StandardsSettings
│   │   ├── StandardRegistry
│   │   ├── AddStandardModal
│   │   └── RetireStandardModal
│   │
│   ├── TestDefaultsSettings
│   │
│   ├── LanguageSettings
│   │
│   ├── CertificateSettings
│   │
│   ├── AppearanceSettings
│   │
│   └── DemoModeSettings
│
├── SystemStatus
│
├── DangerZone
│
└── UnsavedChangesBar
```

---

# 33. Settings data model

```ts id="c3uhrr"
interface LaboratorySettings {
  laboratory: {
    name: string;
    code: string;
    city: string;
    state: string;
    labType: "RRSL" | "GATC";
    nablAccreditationNo: string;
  };

  defaults: {
    verificationStage: VerificationStage;
    unit: string;
    autoSave: boolean;
    autoCaptureStableReadings: boolean;
  };

  language: {
    application: "ENGLISH" | "HINDI";
    certificate: "ENGLISH" | "HINDI" | "BILINGUAL";
  };

  certificates: {
    defaultFormat: "PDF_A" | "DOCX";
    qrEnabled: boolean;
    digitalSignatureEnabled: boolean;
  };

  appearance: {
    theme: "LIGHT" | "DARK";
  };

  demo: {
    enabled: boolean;
    syntheticScenarios: boolean;
    virtualScale: boolean;
    tamperSimulation: boolean;
  };
}
```

The `Laboratory` entity and the `VerificationStage` / `UserRole` types are directly consistent with the supplied frontend data model. `Pasted markdown(20261004-065148).md`

---

# 34. Settings navigation should preserve context

If the Admin edits:

**Standards**

then switches to:

**Certificate**

don't reload the entire application.

Only replace the right-side content.

This creates the feel of a professional enterprise configuration workspace.

---

# 35. Search in Settings?

No.

Don't add a giant search bar to this page.

The settings count is small enough that a clear left navigation is much better.

---

# 36. Mobile version

On mobile:

```text id="4o7z3f"
SETTINGS

[ Laboratory ▾ ]

──────────────────

Laboratory Identity
Regional Reference Standards Laboratory

Code
RRSL-BLR

Lab Type
RRSL

City
Bengaluru
```

The settings section selector becomes a dropdown.

---

# 37. Visual treatment

Settings should be the **quietest screen in the product**.

Use:

```text id="p1g0o5"
White cards
Neutral borders
Dark navy headings
Small blue active states
Very limited status color
```

No giant icons.

No dashboard KPIs.

No charts.

---

# 38. What NOT to do

Avoid:

❌ A 50-field mega form  
❌ Putting dangerous actions beside normal saves  
❌ Letting Admin directly alter an active certificate  
❌ Mixing statutory rules with cosmetic preferences  
❌ Hiding permission information  
❌ Allowing arbitrary MPE edits in ordinary settings  
❌ Creating separate pages for every tiny preference  
❌ Making Settings look like another testing screen

The Settings page should feel **boring in the best possible way**: predictable, controlled and safe.

---

# 39. The 5-second comprehension test

When Admin opens Settings:

```text id="j2x0wm"
SETTINGS

LABORATORY
RRSL Bengaluru

USERS & ROLES
5 users

STANDARDS
12 sets
✓ Valid

TEST DEFAULTS
Subsequent Verification

LANGUAGE
English

CERTIFICATES
PDF/A + DOCX

APPEARANCE
Light

DEMO MODE
Enabled
```

They instantly know where everything lives.

---

# 40. Final architecture

This gives the whole application a clean outer structure:

```text id="5a7n74"
                    METROLOGIX-76
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       WORK            ASSURANCE         OUTPUT
       │                 │                 │
     Home            Review              Reports
     Sessions         Standards
     Instruments      Audit
       │
       └──────────── TEST SESSION ──────────┐
                                            │
             Precondition → Plan → Ready   │
                        ↓                   │
                 OIML Procedures           │
                        ↓                   │
                  Review / Sign             │
                        ↓                   │
                    Certificate            │
                                            │
                         SYSTEM             │
                          Settings ─────────┘
```

The source's application architecture already separates laboratory/user state, role permissions, standards, testing, review, certificates and demonstration controls; Settings should therefore be the **administrative layer above the workflow**, not part of the workflow itself. `Pasted markdown(20261004-065148).md`

---

## Final principle for Settings

Every setting should clearly answer:

**What does this control?**

**Who can change it?**

**Does it affect current sessions or only future ones?**

**Is it reversible?**

That will make the configuration layer feel as trustworthy as the testing layer.

---

### We have now covered the complete planned frontend screen architecture

```text id="m4rj6v"
01  Login
02  Home / Dashboard
03  Instrument Intake
04  Physical Inspection
05  Weighing Error
06  Eccentricity
07  Repeatability
08  Environmental / Tare
09  Standard Weights
10  Sessions
11  Test Plan
12  Review & Director Sign
13  Cryptographic Audit
14  Certificate Repository
15  Scale Bridge
16  Excel Auditor
17  Jury Demo Assistant
18  Session Overview
19  Test Readiness
20  Settings
```

The next logical step is **not another page design**. It is to turn these 20 screens into one **complete frontend implementation blueprint**: routes, components, shared state, mock data, exact page-to-page navigation, role guards, and the implementation order for your AI coding IDE.

## Prompt:
10/4/2026, 6:49:46 PM

next

## Response:
10/4/2026, 6:49:55 PM · gpt-5-6-t-mini

# Next - Complete Frontend Implementation Blueprint

Now that the 20 major views are defined, the next step is to convert them into **one coherent React application architecture** rather than building 20 isolated pages.

The most important principle is:

> **Build one METROLOGIX-76 system with a single Test Session mental model-not 20 separate screens.**

The source already establishes React 18+, TypeScript, Tailwind CSS, Lucide React, frontend-only scope, modular React contexts, role-based permissions, realistic mock datasets, and the 7-step statutory workflow. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 1. Final application architecture

```text
METROLOGIX-76
│
├── GLOBAL SHELL
│   ├── Top Header
│   ├── Sidebar
│   ├── Notifications
│   ├── Theme
│   └── Jury Assistant
│
├── WORK
│   ├── Home
│   ├── Sessions
│   └── Instruments
│
├── ASSURANCE
│   ├── Review
│   ├── Standards
│   └── Audit
│
├── OUTPUT
│   └── Reports
│
└── SYSTEM
    └── Settings
```

Then, once a session is opened:

```text
SESSION
│
├── Overview
├── Readiness
├── Test Plan
│
├── Step 1 - Intake / Specifications
├── Step 2 - Physical & Visual
├── Step 3 - Weighing
├── Step 4 - Eccentricity
├── Step 5 - Repeatability
├── Step 6 - Environmental / Tare
│
├── Review / Sign
└── Certificate
```

The original source describes the testing sequence from instrument arrival through intake, physical/visual inspection, weighing, eccentricity, repeatability, environmental/tare, review/signature and report export. `Pasted markdown(20261004-065148).md`

---

# 2. Route architecture

I would use routes like this:

```text
/
├── /login
│
├── /home
├── /sessions
├── /instruments
│
├── /review
├── /standards
├── /audit
│
├── /reports
│
├── /settings
│
└── /sessions/:sessionId
    ├── /overview
    ├── /readiness
    ├── /plan
    ├── /intake
    ├── /physical
    ├── /weighing
    ├── /eccentricity
    ├── /repeatability
    ├── /environment
    ├── /review
    └── /certificate
```

This is far cleaner than treating every test page as an unrelated top-level product area.

---

# 3. Global shell

Create this first.

```text
App
│
└── AuthProvider
    └── LabProvider
        └── ThemeProvider
            └── ScenarioProvider
                └── IoTProvider
                    └── BrowserRouter
                        └── AppShell
```

The source already defines `LabContext`, `ScenarioContext`, `IoTContext`, and `ThemeContext` as the major frontend state providers. `Pasted markdown(20261004-065148).md`

---

# 4. Recommended project structure

```text
src/
│
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── session/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   ├── status/
│   ├── dialogs/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── sessions/
│   ├── instruments/
│   ├── readiness/
│   ├── test-plan/
│   ├── physical/
│   ├── weighing/
│   ├── eccentricity/
│   ├── repeatability/
│   ├── environment/
│   ├── standards/
│   ├── review/
│   ├── audit/
│   ├── reports/
│   ├── live-bridge/
│   ├── excel-auditor/
│   ├── settings/
│   └── jury-demo/
│
├── contexts/
│   ├── LabContext.tsx
│   ├── ScenarioContext.tsx
│   ├── IoTContext.tsx
│   └── ThemeContext.tsx
│
├── data/
│   ├── instruments.ts
│   ├── sessions.ts
│   ├── observations.ts
│   ├── standards.ts
│   ├── users.ts
│   └── scenarios.ts
│
├── hooks/
├── lib/
├── types/
├── utils/
├── constants/
└── styles/
```

---

# 5. Shared design system first

Do **not** start by coding Dashboard.

First create:

```text
Button
Input
Select
SegmentedControl
Badge
StatusPill
MetricCard
Card
DataTable
Drawer
Modal
Tooltip
Tabs
ProgressRing
Stepper
EmptyState
Toast
LockoutBanner
```

The source specifically calls out reusable components such as `Header`, `Sidebar`, `VerificationSessionHeader`, `Button`, `ComplianceBadge`, `StatusPill`, `MetricCard`, `DataTable`, `Modal`, and `LockoutBanner`. `Pasted markdown(20261004-065148).md`

This is what stops the application from becoming visually inconsistent.

---

# 6. Design tokens

Use the agreed light-first visual language:

```css
--background: #F6F8FB;
--surface: #FFFFFF;
--border: #E4E8EF;

--text-primary: #172033;
--text-secondary: #596579;

--navy: #172554;
--primary: #2563EB;

--pass: #059669;
--warning: #D97706;
--fail: #DC2626;
--pending: #6366F1;
```

Typography:

```text
Inter
    ↓
all interface text

IBM Plex Mono
    ↓
serial numbers
measurements
errors
hashes
technical values
```

The supplied specification also calls for Inter and IBM Plex Mono with tabular numeric alignment. `Pasted markdown(20261004-065148).md`

---

# 7. The most important shared component

## `VerificationSessionHeader`

Every active test page should inherit the same context header.

```text
┌───────────────────────────────────────────────────────────────────┐
│ ZM201 Retail Platform     AV-2026-8812     CLASS III             │
│ Max 30 kg • Min 0.1 kg • e 0.005 kg      ✓ Traceability Valid   │
├───────────────────────────────────────────────────────────────────┤
│ 01       02       03       04       05       06       07         │
│ Intake → Physical → Weighing → Eccentricity → Repeat → Env → ...│
└───────────────────────────────────────────────────────────────────┘
```

This should never be duplicated manually across pages.

---

# 8. Session state is the central object

Everything should revolve around:

```ts
interface VerificationSession {
  id: string;
  instrumentId: string;

  reviewStatus: ReviewStatus;
  complianceStatus: ComplianceStatus;

  verificationStage: VerificationStage;

  readiness: TestReadiness;
  testPlan: TestPlan;

  physicalInspection: PhysicalInspection;
  weighing: WeighingTest;
  eccentricity: EccentricityTest;
  repeatability: RepeatabilityTest;
  environment: EnvironmentTest;

  reviewer?: ReviewRecord;
  directorSignature?: SignatureRecord;

  createdAt: string;
  updatedAt: string;
}
```

That is the key architectural move.

Instead of:

```text
Weighing page owns its own data
Eccentricity page owns its own data
Repeatability page owns its own data
```

use:

```text
                VerificationSession
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Weighing      Eccentricity    Repeatability
```

---

# 9. Instrument object

The supplied model already defines laboratory and observation structures, accuracy classes, verification stages, statuses and user roles. `Pasted markdown(20261004-065148).md`

Extend it into:

```ts
interface Instrument {
  id: string;

  manufacturer: string;
  modelName: string;
  serialNumber: string;
  approvalNumber: string;

  accuracyClass: AccuracyClass;

  maxCapacity: number;
  minCapacity: number;

  e: number;
  d: number;
  unit: string;

  n: number;

  receptorType: string;
  numSupports: number;

  verificationStage: VerificationStage;

  firmwareVersion?: string;
  calibrationCounter?: number;

  status: ReviewStatus;
  complianceStatus: ComplianceStatus;
}
```

---

# 10. Status engine

Never hard-code status colors individually in pages.

Create:

```ts
getComplianceVisual(status)
```

Example:

```ts
PASS
→ emerald
→ CheckCircle

FAIL
→ crimson
→ XCircle

MARGINAL
→ amber
→ AlertTriangle

PENDING
→ indigo
→ Clock

LOCKED_OUT
→ dark red
→ Lock
```

The source explicitly defines these compliance states and their visual semantics. `Pasted markdown(20261004-065148).md`

---

# 11. Permission engine

Create one central utility:

```ts
can(user, action, resource)
```

Example:

```ts
can(user, "ENTER_OBSERVATION", session)

can(user, "REVIEW_SESSION", session)

can(user, "SIGN_CERTIFICATE", session)

can(user, "EDIT_STANDARD", standard)
```

Then pages don't contain scattered logic like:

```ts
if (role === "DIRECTOR") ...
```

everywhere.

The source establishes visual permission enforcement, including disabling observation inputs for Reviewer/Director and Director-only digital signing. `Pasted markdown(20261004-065148).md`

---

# 12. Permission matrix

```text
                         METROLOGIST REVIEWER DIRECTOR AUDITOR ADMIN

Register Instrument          ✓          -        -       -       ✓
Enter Observations           ✓          -        -       -       -
Submit Review                ✓          -        -       -       -
Review Session               -          ✓        ✓       ✓       ✓
Remand                       -          ✓        -       -       -
Sign Certificate             -          -        ✓       -       -
Audit Trail                  -          ✓        ✓       ✓       ✓
Download Certificate         ✓          ✓        ✓       ✓       ✓
Manage Standards             -          -        -       -       ✓
System Settings              -          -        -       -       ✓
```

This matrix becomes the single source of truth.

---

# 13. Lock-state engine

This deserves its own logic.

```ts
getSessionLockState(session)
```

Possible states:

```text
EDITABLE
REVIEW_LOCKED
APPROVAL_LOCKED
APPROVED_LOCKED
TRACEABILITY_LOCKED
```

Most importantly:

```text
APPROVED
   ↓
ALL TEST INPUTS DISABLED
   ↓
GOLDEN PADLOCK
```

The source explicitly requires approved sessions to become permanently read-only. `Pasted markdown(20261004-065148).md`

---

# 14. Traceability gate

This should also be centralized.

```ts
if (standardSet.expired) {
    session.locked = true;
}
```

Then all tests automatically inherit:

```text
LOCKOUT
```

rather than each test page implementing its own check.

The source specifies a hard lockout when standard weights are expired, disabling test input across testing screens. `Pasted markdown(20261004-065148).md`

---

# 15. Scenario engine

One of the strongest hackathon features.

Create:

```ts
loadScenario("rounding_discrepancy_trap")
```

which changes the session dataset globally.

The source defines five synthetic scenarios, including the rounding-discrepancy false-pass trap, temperature drift failure, eccentricity failure and high-precision Class I case. `Pasted markdown(20261004-065148).md`

So the scenario launcher should **not** navigate to a separate fake page.

It should modify the active test scenario.

---

# 16. Example: Rounding Trap

Header:

```text
SCENARIO
Rounding Discrepancy Trap

⚠ DEMO CASE
```

Weighing screen:

```text
Legacy Spreadsheet
I - L
0.0 g
✓ PASS

METROLOGIX-76
Turning Point Analysis
-5.3 g
✕ FAIL
```

This is much more powerful in a live demo because judges see the application's core value immediately. The source identifies this as the core SIH highlight. `Pasted markdown(20261004-065148).md`

---

# 17. IoT architecture

`IoTContext` should own:

```text
isConnected
isSimulatorActive
currentPacket
currentWeight
isStable
unit
isZero
mode
serialLogs
welmecAudit
autoCaptureToGrid
lastCapturedWeight
```

The source defines these exact concepts in the frontend architecture. `Pasted markdown(20261004-065148).md`

Then:

```text
LiveBridge
     ↓
IoTContext
     ↓
VerificationSession
     ↓
Observation Row
```

The weighing page simply asks:

```ts
captureCurrentReading()
```

rather than knowing anything about WebSerial.

---

# 18. Error handling architecture

Create one standard pattern:

```text
Inline validation
      +
Toast feedback
      +
Actionable empty state
      +
Blocking modal only when necessary
```

The source explicitly calls for inline red errors, toasts and actionable empty states. `Pasted markdown(20261004-065148).md`

Example:

```text
✕ Reading required

Enter an observed reading or
capture it from the connected scale.

[ Capture Live Weight ]
```

That's much better than:

```text
Error 422
```

---

# 19. Page implementation order

This is extremely important.

Do **not** build pages in visual order.

Build in dependency order:

### Phase 1 - Foundation

```text
1. Design tokens
2. App Shell
3. Sidebar
4. Header
5. Router
6. Providers
7. Permissions
8. Status system
9. Modal / Drawer / Toast system
```

### Phase 2 - Core business objects

```text
10. Instrument model
11. VerificationSession model
12. Observation model
13. Standards model
14. Mock datasets
```

### Phase 3 - Workflow

```text
15. Sessions
16. Instrument Registration
17. Session Overview
18. Test Readiness
19. Test Plan
20. Physical Inspection
21. Weighing
22. Eccentricity
23. Repeatability
24. Environmental
```

### Phase 4 - Assurance

```text
25. Standards
26. Review
27. Audit
28. Certificate
```

### Phase 5 - Special features

```text
29. Live Scale Bridge
30. Excel Auditor
31. Jury Assistant
32. Settings
```

### Phase 6 - Polish

```text
33. Responsive
34. Keyboard navigation
35. Loading states
36. Empty states
37. Error states
38. Animation
39. Demo scenarios
40. Final visual refinement
```

---

# 20. The actual user journey

When the app is used normally:

```text
HOME
 ↓
+ Register Instrument
 ↓
INSTRUMENT
 ↓
CREATE SESSION
 ↓
PRECONDITION
 ↓
TEST PLAN
 ↓
READINESS
 ↓
PHYSICAL
 ↓
WEIGHING
 ↓
ECCENTRICITY
 ↓
REPEATABILITY
 ↓
ENVIRONMENT
 ↓
SUBMIT FOR REVIEW
 ↓
REVIEW
 ↓
DIRECTOR SIGN
 ↓
LOCK
 ↓
CERTIFICATE
```

That single journey should be the backbone of the entire application.

---

# 21. Important UX rule

Never force the operator to remember where they are.

At all times show:

```text
Instrument
+
Session
+
Current Step
+
Overall Progress
+
Current Verdict
+
What to do next
```

For example:

```text
CLASS III • AV-2026-8812

Step 04 of 07
Eccentricity

3 / 4 corners recorded

● PASS

Next:
Record Corner 4
```

This is much stronger than a generic page title:

```text
Eccentricity Test
```

---

# 22. Every screen gets a primary answer

The application's visual hierarchy should consistently be:

```text
HUMAN ANSWER
       ↓
EVIDENCE
       ↓
TECHNICAL PROOF
```

Example:

```text
PASS
Corner loading within statutory tolerance.

        ↓

Corner 1   +1.2 g
Corner 2   +0.8 g
Corner 3   +1.0 g
Corner 4   +1.4 g

        ↓

Calculation
E = P - L
...
```

The technical formula is available, but it does not dominate the screen.

---

# 23. What the AI coding IDE should generate

Your master coding prompt should tell the IDE:

> Build the application from the shared design system outward. Never create isolated page-specific components when the interaction pattern can be reused. Preserve `VerificationSession` as the central domain object. Keep statutory calculations and statuses deterministic and traceable. Use mock data through adapters, so API integration can replace the adapter later without rewriting page components.

This directly respects the source's frontend-only scope and modular architecture. `Pasted markdown(20261004-065148).md`

---

# 24. Final folder-to-screen mapping

```text
features/
│
├── dashboard/
│   └── HomePage.tsx
│
├── sessions/
│   ├── SessionsPage.tsx
│   └── SessionOverview.tsx
│
├── instruments/
│   └── InstrumentRegistration.tsx
│
├── readiness/
│   └── TestReadinessView.tsx
│
├── test-plan/
│   └── TestPlanView.tsx
│
├── physical/
│   └── PhysicalInspectionView.tsx
│
├── weighing/
│   ├── WeighingView.tsx
│   ├── ObservationGrid.tsx
│   └── ErrorCorridor.tsx
│
├── eccentricity/
│   ├── EccentricityView.tsx
│   └── PlatterHeatmap.tsx
│
├── repeatability/
│   ├── RepeatabilityView.tsx
│   └── RepeatabilityScatter.tsx
│
├── environment/
│   └── EnvironmentView.tsx
│
├── review/
│   ├── ReviewPipeline.tsx
│   ├── RowCommentDrawer.tsx
│   └── DirectorSignModal.tsx
│
├── audit/
│   └── AuditTrailView.tsx
│
├── reports/
│   └── ReportRepositoryView.tsx
│
├── live-bridge/
│   └── LiveBridge.tsx
│
├── excel-auditor/
│   └── ExcelIngestionView.tsx
│
├── jury-demo/
│   └── JuryDemoAssistant.tsx
│
└── settings/
    └── SettingsView.tsx
```

---

# 25. The final mental model

The entire frontend should now feel like this:

```text
                    METROLOGIX-76
                           │
                           ▼
                    LABORATORY HOME
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
         INSTRUMENT                  SESSIONS
             │                           │
             └─────────────┬─────────────┘
                           ▼
                    VERIFICATION SESSION
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
             READINESS             TEST PLAN
                                      │
                                      ▼
                              OIML PROCEDURES
                                      │
                 ┌─────────┬──────────┼─────────┬──────────┐
                 ▼         ▼          ▼         ▼          ▼
              Physical  Weighing  Eccentric  Repeat   Environment
                 └─────────┴──────────┬─────────┴──────────┘
                                      ▼
                                    REVIEW
                                      │
                                      ▼
                               DIRECTOR SIGN
                                      │
                                      ▼
                               IMMUTABLE RECORD
                                      │
                                      ▼
                                  CERTIFICATE
```

That is the architecture I would now freeze before asking an AI IDE to generate the frontend.

**Next:** the most useful step is to build the **exact master prompt for your AI coding IDE**, telling it precisely how to implement this architecture, including UI rules, component rules, routes, state, mock data, animations, responsive behavior, and “do not make the UI messy” constraints.

## Prompt:
10/4/2026, 6:50:35 PM

next

## Response:
10/4/2026, 6:50:46 PM · gpt-5-6-t-mini

> **Retrieved architecture details and master prompt sections**
>
> 
>
> Worked for 7s

# NEXT - MASTER PROMPT FOR YOUR AI CODING IDE

This is the prompt I would give to Cursor, Windsurf, Claude Code, Lovable-style coding agents, or another AI IDE **after the UI/UX architecture is finalized**.

It is deliberately written to prevent the exact problem you were facing: AI-generated frontend becoming messy, generic, overcomplicated, visually inconsistent, and disconnected from the backend/domain.

The prompt below is grounded in your METROLOGIX-76 specification: React 18+/TypeScript/Tailwind/Lucide, frontend-only scope, role-aware workflow, reusable components, the 7-step testing process, synthetic scenarios, IoT bridge, review/signing, audit trail and certificate repository. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

```text
# METROLOGIX-76 - MASTER FRONTEND IMPLEMENTATION DIRECTIVE

You are the senior frontend architect, product designer, UX engineer and React engineer responsible for transforming the existing project into a premium, production-quality frontend for:

METROLOGIX-76
OIML R 76 Digital Test Report System for Non-Automatic Weighing Instruments (NAWI)
SIH Problem Statement 26035

============================================================
0. YOUR PRIMARY OBJECTIVE
============================================================

Do NOT merely generate pages.

Build a coherent digital laboratory operating system.

The final product must feel like a serious government/legal-metrology laboratory application:
- precise
- calm
- trustworthy
- modern
- highly structured
- technically credible
- extremely easy to understand
- visually premium
- presentation-ready for hackathon judges

A person unfamiliar with metrology should understand what is happening on a page within approximately 5-10 seconds.

The UI must communicate:

WHAT IS HAPPENING?
WHAT IS THE CURRENT RESULT?
WHAT NEEDS ATTENTION?
WHAT SHOULD I DO NEXT?

The interface must never feel like:
- a generic SaaS admin dashboard
- a template marketplace dashboard
- a student project
- an AI-generated UI
- a dense enterprise spreadsheet
- an over-decorated futuristic dashboard

The product should feel like:
Government laboratory software + precision engineering workstation + modern enterprise UX.

============================================================
1. HARD SCOPE RESTRICTIONS
============================================================

FRONTEND ONLY.

Use:
- React 18+
- TypeScript
- Tailwind CSS
- Lucide React
- existing project stack whenever possible

Do NOT create:
- backend servers
- database migrations
- raw SQL
- FastAPI routes
- Docker infrastructure
- Nginx configuration
- backend authentication systems
- backend APIs unless already present and merely consumed by the frontend

Do not rewrite the backend.

Inspect the existing repository before changing architecture.

Reuse existing backend contracts/types/API adapters where available.

If backend behavior is unavailable:
use deterministic mock adapters and clearly isolate them so they can later be replaced by API calls.

============================================================
2. FIRST ACTION - DEEPLY INSPECT THE EXISTING PROJECT
============================================================

Before writing UI code:

1. Inspect every frontend directory.
2. Inspect package.json.
3. Inspect routing.
4. Inspect existing components.
5. Inspect existing TypeScript types.
6. Inspect context/state management.
7. Inspect API clients/services.
8. Inspect existing CSS/Tailwind configuration.
9. Inspect existing pages.
10. Identify duplicated UI patterns.
11. Identify broken or messy UI.
12. Identify components that should be reused.
13. Identify backend fields already available to frontend.

Do NOT blindly create a new application beside the existing application.

Modify the existing frontend intelligently.

Before implementation, create a mental map:

Backend/domain:
    What already exists?

Frontend:
    What already works?

Reusable:
    What can be retained?

Replace:
    What must be redesigned?

Missing:
    What must be added?

============================================================
3. PRODUCT MENTAL MODEL
============================================================

The most important domain concept is:

VERIFICATION SESSION

Do NOT design the product as 20 disconnected pages.

Everything revolves around:

Laboratory
    ↓
Instrument
    ↓
Verification Session
    ↓
Test Plan
    ↓
Test Readiness
    ↓
OIML Procedures
    ↓
Review
    ↓
Digital Signature
    ↓
Immutable Record
    ↓
Certificate

The 7-step testing process is:

1. Intake & Specifications
2. Physical & Visual Audit
3. Weighing Error & Linearity
4. Eccentricity / Corner Loading
5. Repeatability
6. Environmental Drift & Tare
7. Review, Digital Signature & Statutory Seal

Important architectural rule:

INTAKE IS NOT a test step inside the actual OIML procedure sequence.

Recommended conceptual flow:

REGISTER INSTRUMENT
    ↓
PRECONDITION CHECK
    ↓
TEST PLAN
    ↓
READINESS GATE
    ↓
7 OIML TEST PROCEDURES
    ↓
REVIEW
    ↓
SIGN
    ↓
CERTIFICATE

Scale Bridge is supporting infrastructure, not a test step.

Excel auditing is an assurance tool, not a test step.

Jury Demo Assistant is presentation infrastructure, not a statutory test.

============================================================
4. INFORMATION ARCHITECTURE
============================================================

Use the following simplified global sidebar architecture:

WORK
- Home
- Sessions
- Instruments

ASSURANCE
- Review
- Standards
- Audit

OUTPUT
- Reports

SYSTEM
- Settings

When an active verification session is open,
switch the sidebar into contextual session navigation.

Contextual navigation:

SESSION
- Overview
- Readiness
- Test Plan
- Physical Inspection
- Weighing
- Eccentricity
- Repeatability
- Environment
- Review / Sign
- Certificate

Do NOT expose every technical test as an unrelated top-level navigation item.

============================================================
5. ROUTING
============================================================

Recommended routes:

/login
/home
/sessions
/instruments
/review
/standards
/audit
/reports
/settings

/session/:sessionId
/session/:sessionId/overview
/session/:sessionId/readiness
/session/:sessionId/plan
/session/:sessionId/intake
/session/:sessionId/physical
/session/:sessionId/weighing
/session/:sessionId/eccentricity
/session/:sessionId/repeatability
/session/:sessionId/environment
/session/:sessionId/review
/session/:sessionId/certificate

Supporting routes if appropriate:

/live-bridge
/excel-auditor

These supporting tools must remain visually secondary to the verification workflow.

============================================================
6. GLOBAL APPLICATION SHELL
============================================================

Create one reusable AppShell.

Structure:

App
 └── Providers
      ├── LabProvider
      ├── ScenarioProvider
      ├── IoTProvider
      └── ThemeProvider
           └── Router
                └── AppShell

Global shell:

HEADER
SIDEBAR
MAIN CONTENT
GLOBAL TOAST SYSTEM
GLOBAL MODAL SYSTEM
GLOBAL DRAWER SYSTEM
JURY DEMO ASSISTANT

============================================================
7. GLOBAL HEADER
============================================================

Header should contain:

- Government/laboratory identity
- Active laboratory switcher
- Current user
- Current role
- role indicator
- scenario launcher
- IoT live weight chip
- theme control
- Jury Assistant launcher
- notifications if already supported

The source specifies:
- laboratory switching
- role switching
- synthetic scenarios
- live IoT readout
- theme switching
- Jury Demo Assistant

Preserve these capabilities.

Do not overcrowd the header.

Use hierarchy.

Primary:
Laboratory + role

Secondary:
IoT state + utilities

Tertiary:
theme/demo controls

============================================================
8. PERSISTENT SESSION HEADER
============================================================

Every active test view must use:

VerificationSessionHeader

Show:

Instrument model
Serial number
Accuracy Class
Max
Min
e
d

Traceability status

7-step progress indicator

Example:

CLASS III
Avery ZM201 Retail Platform
AV-2026-8812

Max 30 kg
Min 0.1 kg
e 0.005 kg
d 0.005 kg

✓ Standard Weights Valid

01 Intake
02 Physical
03 Weighing
04 Eccentricity
05 Repeatability
06 Environment
07 Review

This header must be reusable.

Do not duplicate its markup between pages.

============================================================
9. CORE STATE ARCHITECTURE
============================================================

Use modular contexts where appropriate.

LabContext:
- active lab
- current user
- authentication state
- role
- sync state
- online state
- session counts

ScenarioContext:
- current synthetic scenario
- loading state
- scenario errors
- available scenarios
- scenario loader
- active scenario session

IoTContext:
- connection status
- simulator status
- current weight
- stability
- unit
- gross/net mode
- serial packet
- serial logs
- WELMEC audit telemetry
- auto-capture
- captureCurrentReading()

ThemeContext:
- theme
- toggle
- setter

Do not introduce global state unnecessarily.

============================================================
10. CENTRAL DOMAIN OBJECT - VERIFICATION SESSION
============================================================

Create or adapt a central VerificationSession model.

Example:

interface VerificationSession {
  id: string;
  instrumentId: string;

  reviewStatus: ReviewStatus;
  complianceStatus: ComplianceStatus;

  verificationStage: VerificationStage;

  readiness?: TestReadiness;
  testPlan?: TestPlan;

  physicalInspection?: PhysicalInspection;
  weighing?: WeighingTest;
  eccentricity?: EccentricityTest;
  repeatability?: RepeatabilityTest;
  environment?: EnvironmentTest;

  reviewer?: ReviewRecord;
  directorSignature?: SignatureRecord;

  createdAt: string;
  updatedAt: string;
}

All test screens must read/write session state rather than owning isolated unrelated state.

============================================================
11. TYPES
============================================================

Preserve these existing concepts where already present:

AccuracyClass:
CLASS_I
CLASS_II
CLASS_III
CLASS_IIII

VerificationStage:
INITIAL_TYPE_APPROVAL
SUBSEQUENT_VERIFICATION
IN_SERVICE_INSPECTION

ReviewStatus:
DRAFT
IN_TESTING
PENDING_REVIEW
APPROVED
REMANDED

ComplianceStatus:
PASS
FAIL
MARGINAL
PENDING
LOCKED_OUT

UserRole:
METROLOGIST
REVIEWER
DIRECTOR
AUDITOR
ADMIN

Do not rename domain terminology unnecessarily.

============================================================
12. PERMISSION ARCHITECTURE
============================================================

Create a centralized permission function:

can(user, action, resource)

Examples:

can(user, "REGISTER_INSTRUMENT")
can(user, "ENTER_OBSERVATION")
can(user, "SUBMIT_REVIEW")
can(user, "REVIEW_SESSION")
can(user, "REMAND_SESSION")
can(user, "SIGN_CERTIFICATE")
can(user, "VIEW_AUDIT")
can(user, "MANAGE_STANDARDS")
can(user, "EDIT_SETTINGS")

Do not scatter role conditions throughout the UI.

Role capabilities:

METROLOGIST
- register instruments
- load presets
- enter test data
- capture live weights
- submit for review

REVIEWER
- inspect submitted sessions
- add comments
- flag rows
- approve
- remand

DIRECTOR
- review
- digitally sign
- seal
- permanently lock approved session

AUDITOR
- read-only inspection
- audit trail
- certificates

ADMIN
- system settings
- laboratory configuration
- standard-weight management

============================================================
13. VISUAL PERMISSION ENFORCEMENT
============================================================

Permissions must be visually obvious.

Do not merely remove everything the user cannot access.

When something is unavailable because of role:

prefer:

[🔒 Read-only]

or:

[Managed by Administrator]

rather than an unexplained disabled control.

When Reviewer or Director opens test-entry screens:
- observation inputs are disabled
- audit/review actions remain available

When Metrologist attempts Director signing:
show a clear accessible error:

"Access Denied: Only a Lab Director is authorized to digitally sign."

Once a session becomes APPROVED:
- all editable inputs become permanently disabled
- show a golden padlock
- show "Immutable Record"
- visually reinforce read-only state

============================================================
14. TRACEABILITY LOCKOUT
============================================================

Standard weight validity is a global safety gate.

If the selected standard set is expired:

show a full-width blocking banner:

TRACEABILITY LOCKED

The selected standard weight set is no longer valid.

Testing inputs must be disabled.

Provide:

[View Standard Set]

Do not allow users to bypass this through individual test pages.

Centralize the gate.

============================================================
15. DESIGN SYSTEM
============================================================

Visual direction:

LIGHT-FIRST PRECISION LABORATORY

The result should be:
- white surfaces
- very light cool-gray background
- navy/blue hierarchy
- restrained shadows
- precise borders
- excellent spacing
- minimal decorative noise

Avoid excessive glassmorphism.

Use subtle depth only where useful.

Color semantics:

BACKGROUND
#F6F8FB / #F8FAFC

SURFACE
#FFFFFF

BORDER
#E4E8EF

PRIMARY TEXT
#172033

SECONDARY TEXT
#596579

NAVY
#172554

PRIMARY BLUE
#2563EB

PASS
#059669

WARNING
#D97706

FAIL
#DC2626

PENDING
#6366F1

Purple should be reserved primarily for digital-authority/signing context.

============================================================
16. TYPOGRAPHY
============================================================

Inter:
all normal UI copy

IBM Plex Mono:
- measurements
- serial numbers
- certificate numbers
- errors
- readings
- hashes
- technical identifiers

Use tabular numerals.

Technical numbers must align visually.

============================================================
17. SPACING / SHAPE
============================================================

Use consistent spacing based around:

4
8
12
16
24
32

Cards:
12px radius

Large panels:
16px radius

Inputs/buttons:
8px radius

Avoid excessive rounded "pill everything" design.

Pills should primarily communicate:
- status
- role
- class
- compact metadata

============================================================
18. INFORMATION DENSITY RULE
============================================================

NEVER produce wall-of-text screens.

Maximum:
4-6 important fields per card.

Break complex forms into logical cards.

Primary content:
human-readable summary

Secondary content:
evidence

Tertiary:
technical calculation

Do not force every calculation into the main visual hierarchy.

============================================================
19. HUMAN-FRIENDLY LABELS
============================================================

Prefer:

Target Test Load
instead of:
L

Observed Reading
instead of:
I

Calculated Error
instead of:
Ec

Legal Tolerance Limit
instead of:
±MPE

Technical notation can still appear as secondary sublabels or calculation-proof tooltips.

Do not remove technical correctness.

Make it progressively disclosed.

============================================================
20. COMPLIANCE VISUAL LANGUAGE
============================================================

PASS:
emerald

FAIL:
crimson

MARGINAL / near limit:
amber

PENDING:
indigo/slate

LOCKED:
red/dark destructive treatment

Every status should have:
- icon
- label
- accessible text

Never communicate status through color alone.

============================================================
21. REUSABLE COMPONENT LIBRARY
============================================================

Build shared primitives first.

Required reusable components:

Button
Input
Select
SegmentedControl
Tabs
Badge
ComplianceBadge
StatusPill
MetricCard
Card
DataTable
Modal
Drawer
Tooltip
Toast
ProgressRing
Stepper
LockoutBanner
EmptyState
Skeleton
ConfirmDialog
PageHeader
SectionHeader
Field
FormCard

Do not create five slightly different button implementations.

Do not duplicate modal behavior.

Do not duplicate status badge markup.

============================================================
22. CORE FEATURE COMPONENTS
============================================================

Layout:

Header
Sidebar
Breadcrumbs
VerificationSessionHeader

Testing:

TestReadinessView
TestPlanView
ObservationGrid
ErrorCorridorChart
PlatterHeatmap
RepeatabilityView
TareTempView
PhysicalAuditorView

Review:

ReviewerQueue
ReviewPipeline
RowLevelCommentDrawer
DirectorSignModal
GreenStampedSeal

Infrastructure:

LiveBridge
VirtualScaleSimulator
WelmecAuditPanel

Assurance:

ExcelIngestionView
AuditTrailView

Output:

ReportRepositoryView

Demo:

JuryDemoAssistant

============================================================
23. HOME PAGE
============================================================

Home is an operational overview.

Primary KPIs:

Active Verifications
Pending Director Sign-Off
Pass Rate
Traceability Status

Then:

Recent Verification Sessions

Then:

Compliance distribution

Then:

Quick Start actions

Do not overload the homepage with every available feature.

The first screen should immediately communicate the state of the laboratory.

============================================================
24. SESSIONS PAGE
============================================================

Primary mental model:

"Where are my verification sessions?"

Support:
- search
- status filters
- class filters
- date filters
- laboratory context
- progress
- continue action

Session cards/table must show:

Instrument
Serial
Class
Verification stage
Progress
Current status
Last activity
Next action

Primary CTA:

Resume Session →

============================================================
25. INSTRUMENT REGISTRATION
============================================================

Use modular cards.

Preset banner:
Avery Class III Retail
Mettler Class I Lab
Sansui Class II Gold
Essae Class IIII Industrial

Then:

Nameplate / OCR
Identification
Metrological Specifications
Photo Dossier

Live validation should be immediately visible.

Do not create an intimidating 30-field form.

============================================================
26. TEST READINESS
============================================================

This is a GO / NO-GO gate.

Show three readiness pillars:

Instrument
Traceability
Test Plan

Each should show:
READY
ATTENTION
BLOCKED

Then detailed checks.

Examples:

Instrument identity complete
Specifications valid
Required documentation present
Standard weights valid
Test plan prepared
Environment baseline available

Primary decision:

READY TO START TESTING

or:

TESTING BLOCKED

Always answer:
"Can I start?"

============================================================
27. TEST PLAN
============================================================

Use a high-readability applicability matrix.

Map applicable statutory tests against:
- instrument class
- verification stage

Clearly distinguish:
Applicable
Not Applicable
Pending Configuration

Do not turn this into a spreadsheet-like wall.

============================================================
28. PHYSICAL INSPECTION
============================================================

Main visual:

inspection evidence

Secondary panels:

Spirit level
Seal integrity
Physical checklist

Use visual inspection language.

Make the spirit bubble a strong visual anchor.

Avoid putting 25 checkboxes on screen simultaneously.

============================================================
29. WEIGHING TEST
============================================================

This is a key product screen.

Provide:

split view:
Observation Grid + Error Corridor

Layout options:
Split View
Grid Only
Chart Only

Use two test series:

Ascending
Descending

Observation table:

Target Load
Observed Reading
Capture
Calculated Error
Tolerance
Compliance
Inspect Trace

Error corridor:
- actual error
- legal tolerance boundaries
- clear pass / warning / fail regions

Provide calculation proof in drawer/tooltip.

============================================================
30. ROUNDING TRAP DEMO
============================================================

This is one of the most important hackathon demonstration moments.

Scenario:

rounding_discrepancy_trap

Show side-by-side:

Legacy Spreadsheet
vs
METROLOGIX-76 Turning Point Analysis

Example:

Legacy:
I - L
0.0 g
PASS

METROLOGIX-76:
Unrounded error
-5.3 g

Legal limit
±5.0 g

FINAL
FAIL

Clearly label:

DEMO SCENARIO
Rounding Trap Active

Do not hide why the result differs.

============================================================
31. ECCENTRICITY
============================================================

Main visual:
SVG platter heatmap

Show:
Center
Corner 1
Corner 2
Corner 3
Corner 4

Use:
- loading point
- observed value
- deviation
- tolerance
- status

If one corner fails:
make the failing point visually dominant.

Example synthetic scenario:
Corner 4 = -6.2 g

The visual should make the mechanical problem instantly understandable.

============================================================
32. REPEATABILITY
============================================================

Show:

10-reading sequence

Then prominently:

Total Observed Spread

Allowable Limit

Verdict

Scatter plot below/alongside.

Do not make users mentally calculate spread from ten rows.

============================================================
33. ENVIRONMENT / TARE
============================================================

Use sub-tabs:

Tare Accuracy
Temperature Drift
Chamber HUD

Environmental baseline card:
Temperature
Relative Humidity
Pressure

Thermal sequence visualization:
reference → elevated → low → recovery

Show result clearly.

============================================================
34. STANDARDS
============================================================

Registry of standard weight sets.

Show:

Class
Set ID
Calibration date
Expiry date
Status
Days remaining

Expired standards must be visually obvious.

Primary action:

View Standard Set

Admin:
Add / Edit / Retire

============================================================
35. REVIEW
============================================================

Two-panel design.

LEFT:
reviewer queue

RIGHT:
selected session audit summary

Show:

overall result
test results
exceptions
comments
traceability
review history

Actions:

Add Comment
Approve & Forward
Remand

Remand must require justification.

============================================================
36. DIRECTOR SIGNING
============================================================

Signing is a focused modal.

Show:

Session identity
Final compliance summary
Statutory declaration
SHA-256 digest preview
PIN input

Then:

Sign & Stamp

After success:
show Green Guilloche Seal

Show:
verified state
director
laboratory
timestamp
QR
digest

Then transition session to:

APPROVED
IMMUTABLE

============================================================
37. AUDIT TRAIL
============================================================

Use chronological timeline.

Each important event:

timestamp
actor
role
action
result
hash

Use IBM Plex Mono for digests.

Make the audit chain visually convincing but not theatrical.

============================================================
38. CERTIFICATE REPOSITORY
============================================================

Searchable repository.

Language selector:

English
Hindi
Bilingual

Certificate cards/grid show:

Certificate ID
Serial Number
Accuracy Class
Director
Date
QR thumbnail
Status

Actions:

Download PDF/A
Download DOCX
Verify

============================================================
39. LIVE SCALE BRIDGE
============================================================

Keep it as supporting infrastructure.

Main areas:

Connection status

Large live weight display

Stable / unstable state

Gross / Net

Serial logs

WELMEC software audit

Virtual simulator

Protocol presets:

CAS
Mettler SICS
Avery SMA

Main objective:
prove that a real or simulated scale can feed test observations.

============================================================
40. EXCEL AUDITOR
============================================================

Position this as an assurance tool.

Main upload:
XLSX drag/drop

Sub-tabs:

Discrepancies
Weighing Recalculation
Eccentricity Comparison
Extracted Metadata

The important UX story:

Old spreadsheet
     ↓
import
     ↓
audit
     ↓
recalculate
     ↓
detect discrepancy
     ↓
show correct statutory conclusion

============================================================
41. JURY DEMO ASSISTANT
============================================================

Floating presentation drawer.

Controls:

Play
Pause
Reset
Next Step

Show:
- timeline
- presenter cue
- statutory reference
- current screen
- key highlight

"Next Step" must navigate the application automatically.

This should feel like a professional presentation mode,
not like a chatbot window.

============================================================
42. SETTINGS
============================================================

Settings sections:

Laboratory
Users & Roles
Standards
Test Defaults
Language
Certificates
Appearance
Demo Mode

Danger Zone at bottom.

Admin sees edit controls.

Other roles see appropriate read-only state.

Unsaved changes must be detected.

Never silently discard changes.

============================================================
43. MOCK DATA
============================================================

Use realistic deterministic datasets.

Preserve the provided instruments:

Avery Class III Retail
Mettler Class I Analytical
Sansui Class II Gold
Essae Class IIII Industrial

Preserve the supplied synthetic scenarios:

standard_class_iii_retail
rounding_discrepancy_trap
temperature_span_drift_fail
eccentricity_cantilever_twist
high_interval_class_i_analytical

Do not replace them with random fake data.

The synthetic datasets should be coherent across:
- dashboard
- session
- readiness
- test plan
- all test steps
- review
- audit
- certificate

If a scenario is loaded:
EVERY relevant screen must reflect the same scenario.

============================================================
44. STATE TRANSITIONS
============================================================

Implement a clear lifecycle:

DRAFT
    ↓
IN_TESTING
    ↓
PENDING_REVIEW
    ↓
APPROVED

Alternative:

PENDING_REVIEW
    ↓
REMANDED
    ↓
IN_TESTING
    ↓
PENDING_REVIEW

APPROVED:
permanent read-only

Expired standards:
LOCKED_OUT

Do not create inconsistent intermediate states.

============================================================
45. ERROR / EMPTY / LOADING STATES
============================================================

Every meaningful page requires:

loading state
empty state
error state
success state
blocked state
read-only state where relevant

Empty states must contain:
what is missing
why it matters
what action can fix it

Example:

No verification sessions

"No active verification sessions are currently in progress."

[ Register Instrument ]

Not:

"No data."

============================================================
46. FORM UX
============================================================

Every form:

- grouped by purpose
- 4-6 fields maximum per card
- clear labels
- inline validation
- unit labels
- sensible defaults
- keyboard accessible
- clear primary action
- clear cancellation

Use friendly labels.

Do not force users to understand internal variable names.

============================================================
47. TABLE UX
============================================================

Tables must:

- use tabular numerals
- align numeric values
- preserve readable row height
- expose important status immediately
- support horizontal scrolling on smaller screens
- never become a wall of tiny text

Technical detail should open through:
drawer
tooltip
modal
or expanded row

============================================================
48. RESPONSIVE DESIGN
============================================================

Desktop:
full application shell

Tablet:
compressed two-column layout

Mobile:
single-column flow
collapsible navigation
horizontal scrolling where tables require it
sticky primary action

Do not simply shrink desktop UI.

Recompose layouts appropriately.

============================================================
49. ACCESSIBILITY
============================================================

Use:
- semantic HTML
- visible focus states
- keyboard navigation
- ARIA labels where appropriate
- accessible dialogs
- accessible status announcements
- sufficient contrast
- icon + text for critical states

Do not rely on hover for essential information.

============================================================
50. MOTION
============================================================

Animations must communicate state.

Use subtle animation for:

page transitions
loading
step completion
live IoT stability
seal generation
drawer transitions
progress

Never animate everything.

No spinning gradients.
No excessive parallax.
No decorative blobs.
No unnecessary 3D effects.

============================================================
51. VISUAL QUALITY BAR
============================================================

Before considering a screen complete, evaluate:

Does it have one obvious primary action?

Can a new user understand the page in 5-10 seconds?

Is the most important result visually dominant?

Are technical details secondary?

Are spacing and alignment consistent?

Are cards overloaded?

Are there too many colors?

Are there too many icons?

Does anything look like a generic dashboard template?

Does it look believable as professional laboratory software?

If not:
REDESIGN before continuing.

============================================================
52. DO NOT OVER-DESIGN
============================================================

Avoid:

- excessive rounded cards
- giant gradients
- neon colors
- oversized headings
- decorative illustrations
- glassmorphism everywhere
- excessive shadows
- too many badges
- excessive micro-animations
- unnecessary charts
- dashboard tiles for everything
- sidebars with 20+ unrelated items

Precision beats decoration.

============================================================
53. PAGE HIERARCHY
============================================================

Every screen should follow:

LEVEL 1
Human answer / primary state

LEVEL 2
Evidence

LEVEL 3
Technical proof

Example:

PASS
"All evaluated loads remain within the legal tolerance."

Then:
observation data

Then:
formula / calculation proof

============================================================
54. SOURCE OF TRUTH RULE
============================================================

Do not invent statutory rules, numerical thresholds,
legal interpretations, or OIML requirements that are not already represented by the provided application specification/backend.

When backend data exists:
use backend data.

When application mock data exists:
use the mock data.

When a business rule is not defined:
keep it configurable or clearly marked as a UI placeholder.

Do not silently make up legal logic.

============================================================
55. NO FAKE FUNCTIONALITY
============================================================

Every visible interactive control must have a meaningful frontend behavior.

Do not create buttons that do nothing.

If functionality is intentionally simulated:
label it clearly as DEMO or SIMULATED.

Examples:
Virtual Scale Simulator
Demo PIN
Synthetic Scenarios

Never present simulation as real hardware or production evidence.

============================================================
56. CODE QUALITY
============================================================

Use:

- strict TypeScript
- reusable components
- clear props
- small components
- hooks for reusable behavior
- predictable state updates
- no giant 2000-line components
- no duplicated business logic
- no duplicated status logic
- no magic strings where enums/constants are appropriate

Prefer feature-oriented architecture.

============================================================
57. FILE ORGANIZATION
============================================================

Recommended:

src/
  app/
  components/
    layout/
    navigation/
    ui/
    session/
    charts/
    dialogs/
  contexts/
  features/
    auth/
    dashboard/
    sessions/
    instruments/
    readiness/
    test-plan/
    physical/
    weighing/
    eccentricity/
    repeatability/
    environment/
    review/
    audit/
    standards/
    reports/
    live-bridge/
    excel-auditor/
    settings/
    jury-demo/
  data/
  hooks/
  lib/
  types/
  utils/
  constants/
  styles/

Do not create arbitrary folders without reason.

============================================================
58. IMPLEMENTATION ORDER
============================================================

Follow this order.

PHASE 1
Design system

PHASE 2
App shell

PHASE 3
Providers/state

PHASE 4
Domain types + mock data

PHASE 5
Routing

PHASE 6
Home

PHASE 7
Sessions

PHASE 8
Instrument registration

PHASE 9
Session overview

PHASE 10
Readiness

PHASE 11
Test plan

PHASE 12
Physical

PHASE 13
Weighing

PHASE 14
Eccentricity

PHASE 15
Repeatability

PHASE 16
Environment

PHASE 17
Standards

PHASE 18
Review

PHASE 19
Audit

PHASE 20
Certificates

PHASE 21
Live Bridge

PHASE 22
Excel Auditor

PHASE 23
Settings

PHASE 24
Jury Assistant

PHASE 25
Responsive refinement

PHASE 26
Accessibility

PHASE 27
Visual QA

============================================================
59. IMPORTANT DEVELOPMENT STRATEGY
============================================================

Do not implement all 20 screens at once.

For each phase:

1. Implement.
2. Run.
3. Inspect.
4. Fix.
5. Verify responsiveness.
6. Verify state behavior.
7. Verify role behavior.
8. Verify visual consistency.
9. Continue.

After each major feature:
clean up duplicated code before proceeding.

============================================================
60. VISUAL QA CHECKLIST
============================================================

For every screen check:

[ ] no overflow
[ ] no clipped text
[ ] no weird alignment
[ ] no unnecessary card nesting
[ ] no inconsistent spacing
[ ] no random colors
[ ] no tiny unreadable text
[ ] no giant empty areas
[ ] no excessive controls
[ ] no duplicate labels
[ ] no generic placeholder copy
[ ] status is obvious
[ ] next action is obvious
[ ] role restrictions are obvious
[ ] loading/empty/error states exist

============================================================
61. FINAL PRODUCT TEST
============================================================

The app must support a complete uninterrupted demo:

LOGIN
  ↓
HOME
  ↓
LOAD AVERY PRESET
  ↓
CREATE SESSION
  ↓
READINESS
  ↓
TEST PLAN
  ↓
PHYSICAL INSPECTION
  ↓
WEIGHING
  ↓
ECCENTRICITY
  ↓
REPEATABILITY
  ↓
ENVIRONMENT
  ↓
SUBMIT FOR REVIEW
  ↓
SWITCH TO REVIEWER
  ↓
REVIEW
  ↓
SWITCH TO DIRECTOR
  ↓
SIGN
  ↓
GREEN SEAL
  ↓
IMMUTABLE LOCK
  ↓
CERTIFICATE
  ↓
AUDIT TRAIL

Then test the special demonstration:

LOAD ROUNDING TRAP
  ↓
WEIGHING
  ↓
show legacy false PASS
  ↓
show true turning-point FAIL
  ↓
open calculation proof
  ↓
show statutory consequence

Then test:

VIRTUAL SCALE
  ↓
CONNECT
  ↓
STABLE WEIGHT
  ↓
CAPTURE
  ↓
OBSERVATION ROW

============================================================
62. FINAL DESIGN PRINCIPLE
============================================================

METROLOGIX-76 must feel like a system that knows:

where the instrument is,
what test is being performed,
what the evidence says,
whether the instrument passes,
what is blocking progress,
who is allowed to act,
and what happens next.

The UI must make that obvious without requiring the user
to understand the implementation.

Build with restraint.

Build with consistency.

Build around the verification session.

Build for trust.

============================================================
63. FINAL INSTRUCTION TO THE AI
============================================================

Do NOT start coding blindly.

First inspect the existing project.

Then produce a concise implementation plan based on the actual repository.

Then implement the foundation.

Then progressively build the application.

Do not destroy working functionality merely to match the new design.

Do not invent backend functionality.

Do not create disconnected mock pages.

Do not stop at visual mockups.

All screens must share real frontend state and interact coherently.

The finished frontend should look like one premium,
high-precision product designed by a strong product team,
not a collection of AI-generated pages.
```

---

# The most important part

When you put this into an AI coding IDE, **do not ask it to “build the whole website” in one shot**.

Give it the master prompt first, let it inspect the repository, and then make it work in controlled phases:

```text
MASTER PROMPT
      ↓
Repository analysis
      ↓
Design system
      ↓
App shell
      ↓
State architecture
      ↓
Core session model
      ↓
Workflow
      ↓
Assurance
      ↓
Reports
      ↓
Special features
      ↓
Visual QA
```

That matches the architecture already established in your source, particularly the reusable component catalog, four-context state model, role enforcement, synthetic scenarios and IoT state model. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

### One rule I would absolutely enforce in your IDE

After every major page, tell the coding agent:

```text
STOP.

Do not continue to the next screen.

Inspect the current implementation for:
1. visual hierarchy
2. spacing consistency
3. component reuse
4. responsiveness
5. role behavior
6. state correctness
7. accidental complexity
8. generic AI-dashboard aesthetics

Fix all issues first.

Only then proceed.
```

That single loop will make a **huge** difference to the final frontend quality.

## Prompt:
10/4/2026, 6:51:59 PM

next

## Response:
10/4/2026, 6:52:08 PM · gpt-5-6-t-mini

# NEXT - PHASE 1: DESIGN SYSTEM IMPLEMENTATION

Before your AI IDE builds a single business screen, make it build the **visual foundation** of METROLOGIX-76.

This is the part that determines whether every later page looks like **one premium product** or like 20 different AI-generated pages.

The source establishes React/Tailwind/Lucide, the precision-laboratory aesthetic, reusable UI primitives, Inter + IBM Plex Mono, tabular numbers, and semantic PASS/FAIL/WARNING/PENDING states. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 1. Design-system objective

The AI should create a system where this:

```text
Button
Card
Table
Badge
Modal
Input
Tabs
Metric
```

looks identical everywhere.

For example, a PASS state on:

```text
Dashboard
Weighing
Eccentricity
Review
Certificate
```

must use the same visual language.

Not:

```text
Dashboard → green pill
Weighing  → green square
Review    → green text
Certificate → green badge
```

Instead:

```text
PASS
✓ same icon
✓ same emerald family
✓ same typography
✓ same border treatment
✓ same semantic meaning
```

---

# 2. Token structure

Create a central token file.

```text
src/
└── styles/
    ├── tokens.css
    ├── globals.css
    └── theme.css
```

Do not scatter hex values throughout components.

---

# 3. Color system

### Foundation

```css
:root {
  --bg: #F6F8FB;
  --surface: #FFFFFF;
  --surface-subtle: #F8FAFC;

  --border: #E4E8EF;
  --border-strong: #CBD5E1;

  --text-primary: #172033;
  --text-secondary: #596579;
  --text-muted: #7A8699;

  --navy: #172554;
  --blue: #2563EB;
}
```

### Compliance

```css
:root {
  --pass: #059669;
  --pass-bg: #ECFDF5;

  --warning: #D97706;
  --warning-bg: #FFFBEB;

  --fail: #DC2626;
  --fail-bg: #FEF2F2;

  --pending: #6366F1;
  --pending-bg: #EEF2FF;
}
```

These semantic states are central to the source specification. `Pasted markdown(20261004-065148).md`

---

# 4. Don't abuse colors

Most of the application should actually be:

```text
white
gray
navy
blue
```

Then:

```text
green → PASS
amber → WARNING
red → FAIL
indigo → PENDING
purple → digital authority
```

That makes the status colors meaningful.

If every card is blue, green, purple, orange and pink, **nothing is important**.

---

# 5. Typography system

Use:

```text
Inter
```

for:

```text
headings
labels
buttons
navigation
descriptions
forms
```

Use:

```text
IBM Plex Mono
```

for:

```text
30.000 kg
AV-2026-8812
+2.5 g
CERT-2026-000184
SHA256...
```

The source explicitly recommends this split and tabular numerals for technical values. `Pasted markdown(20261004-065148).md`

---

# 6. Type scale

Don't let the AI randomly choose:

```text
text-xl
text-2xl
text-4xl
text-7xl
```

for every heading.

Define a hierarchy:

```text
Page title       28-32px
Section title    18-20px
Card title       14-16px
Body             14px
Metadata         12-13px
Technical value  14-20px mono
Hero metric      28-36px mono
```

The exact values can be tuned during visual QA.

The principle is more important:

> **One obvious heading hierarchy across the entire application.**

---

# 7. Spacing system

Use the existing 4/8-based rhythm:

```text
4
8
12
16
24
32
```

Map it consistently:

```text
Icon ↔ label             8px
Field spacing             12px
Inside card               16px
Between cards              16-24px
Section spacing            24-32px
Page margins               24-32px
```

Never let one page use 13px and another use 19px merely because the AI thought it looked good.

---

# 8. Radius system

Use restrained geometry:

```text
Input / button      8px
Card               12px
Large panel        16px
Modal              16px
Status pill        full
```

Not every element should be a pill.

The product is precision software, so geometry should feel controlled.

---

# 9. Shadow system

Use only three levels:

```css
--shadow-none
--shadow-subtle
--shadow-elevated
```

Most cards:

```text
border + almost no shadow
```

Focused overlays:

```text
moderate shadow
```

Modals:

```text
stronger shadow
```

This keeps the interface crisp.

---

# 10. Button system

Build:

```text
Primary
Secondary
Ghost
Danger
Success
Icon
```

Example:

```text
[ + Register Instrument ]     primary

[ Cancel ]                    secondary

[ Inspect Trace ]             ghost

[ Remand Session ]            danger

[ Approve ]                   success
```

Every button must have:

```text
default
hover
active
focus
disabled
loading
```

The source's component catalog explicitly calls for reusable button variants and loading behavior. `Pasted markdown(20261004-065148).md`

---

# 11. Button hierarchy

Only one primary CTA per major section.

Bad:

```text
[Save] [Continue] [Calculate] [Submit] [Approve] [Export]
```

Good:

```text
[ Save & Continue ]

Secondary:
[ Save Draft ]
[ Cancel ]
```

The user should immediately know what the intended action is.

---

# 12. Input system

Create one standard field:

```text
<Field
  label="Target Test Load"
  unit="kg"
  help="Known standard load placed on platform"
/>
```

Visual:

```text
Target Test Load
Known standard load

┌─────────────────────────────┐
│ 10.000                 kg   │
└─────────────────────────────┘
```

Do not place units into placeholder text.

---

# 13. Input states

Every input needs:

```text
default
focus
filled
error
disabled
read-only
success
```

Example:

```text
Observed Reading

┌─────────────────────────────┐
│ 10.005                  kg  │
└─────────────────────────────┘

✓ Stable reading captured
```

---

# 14. Compliance Badge

Build exactly one component:

```tsx
<ComplianceBadge status="PASS" />
```

It should automatically determine:

```text
icon
label
color
background
border
accessible text
```

Example:

```text
✓ PASS
```

and:

```text
✕ FAIL
```

The source explicitly defines `ComplianceBadge` as a reusable component. `Pasted markdown(20261004-065148).md`

---

# 15. Accuracy-class badge

Separate compliance from instrument class.

```text
Class I
Class II
Class III
Class IIII
```

Never make:

```text
Class III = PASS
```

They are different concepts.

Use:

```text
[ CLASS III ]
[ PASS ]
```

rather than one confusing badge.

---

# 16. Status architecture

Create:

```ts
StatusPill
ComplianceBadge
RoleBadge
TraceabilityBadge
ConnectionBadge
```

Each has one responsibility.

For example:

```text
CLASS III
PASS
METROLOGIST
TRACEABILITY VALID
CONNECTED
```

This makes the UI highly scannable.

---

# 17. Cards

The default card:

```text
┌─────────────────────────────────────────┐
│ Card title                         ...   │
│                                          │
│ Main content                             │
│                                          │
│ Supporting content                       │
└─────────────────────────────────────────┘
```

Card rules:

```text
padding: 16-24px
radius: 12px
border: 1px solid
background: white
```

Do not nest cards five levels deep.

Bad:

```text
Card
 └ Card
    └ Card
       └ Card
```

Good:

```text
Page
 ├── Card
 ├── Card
 └── Card
```

---

# 18. Metric cards

Use only for genuinely important numbers.

Example:

```text
ACTIVE VERIFICATIONS

12
sessions

↑ 3 from yesterday
```

The source's dashboard uses metric cards for operational KPIs. `Pasted markdown(20261004-065148).md`

Don't turn:

```text
temperature
serial number
accuracy class
city
```

into metric cards.

---

# 19. Tables

Create one strong `DataTable`.

Requirements:

```text
sticky headers
numeric alignment
tabular numbers
row hover
row selection
status cells
empty state
loading state
pagination if required
responsive overflow
```

For metrology:

```text
Target Load      right
Observed Reading right
Error             right
Tolerance         right
Status            center
```

Technical values should line up vertically.

---

# 20. Modal system

One reusable accessible modal.

Use it for:

```text
Director signing
Photo zoom
Confirmation
Calculation proof
Dangerous actions
```

The source specifically favors focused modals for signing, photo inspection and calculation proofs. `Pasted markdown(20261004-065148).md`

---

# 21. Drawer system

Drawer = contextual detail.

Use it for:

```text
Row audit comment
Trace details
Session metadata
Technical calculations
Review comments
```

Don't navigate the user away just to inspect one row.

---

# 22. Toast system

Create consistent toast states:

```text
✓ Saved successfully
✓ Reading captured
✓ Session submitted

⚠ Standard expires in 3 days

✕ Could not save changes
```

Keep them brief.

No paragraph-long toast notifications.

---

# 23. Empty states

This is a major quality signal.

Bad:

```text
No Data
```

Good:

```text
No active verification sessions

There are currently no instruments being tested
in this laboratory.

[ Register Instrument ]
```

Every empty state needs:

```text
What?
Why?
Next action?
```

The source specifically calls for actionable empty states. `Pasted markdown(20261004-065148).md`

---

# 24. Loading states

Avoid blank white screens.

Use skeletons:

```text
┌─────────────────────────────┐
│ ██████████████              │
│ ████████████████████        │
│ ███████                     │
└─────────────────────────────┘
```

For tables:

```text
██████    ███████    █████
██████    ███████    █████
██████    ███████    █████
```

For actions:

```text
[ ◌ Saving... ]
```

---

# 25. Error states

Inline errors should explain the problem.

Bad:

```text
Invalid input.
```

Good:

```text
Observed reading is required.

Enter a reading or capture it from
the connected scale.
```

Then:

```text
[ Capture Live Reading ]
```

The source specifically asks for inline red errors and actionable recovery. `Pasted markdown(20261004-065148).md`

---

# 26. Lockout component

Build:

```text
<LockoutBanner />
```

Example:

```text
┌─────────────────────────────────────────────────────────────┐
│ 🔒 TRACEABILITY LOCKED                                      │
│                                                             │
│ Standard weight set F1-2024-018 expired on 18 Mar 2026.   │
│ Testing cannot continue until a valid set is selected.    │
│                                                             │
│ [ View Standard Weights ]                                  │
└─────────────────────────────────────────────────────────────┘
```

This must be visually stronger than ordinary warnings.

---

# 27. Stepper

The stepper is a **core product identity component**.

```text
01 ─── 02 ─── 03 ─── 04 ─── 05 ─── 06 ─── 07
✓       ✓       ●       ○       ○       ○       ○
```

States:

```text
completed
current
available
locked
blocked
```

Current:

```text
●
```

Completed:

```text
✓
```

Locked:

```text
○
```

Blocked:

```text
!
```

---

# 28. Session progress

Don't show merely:

```text
67%
```

Use:

```text
4 / 7 steps complete

Physical inspection
✓

Weighing
✓

Eccentricity
● Current
```

A percentage is secondary.

The user understands steps better than percentages.

---

# 29. Technical number component

Build:

```tsx
<TechnicalValue
  value="10.005"
  unit="kg"
/>
```

Result:

```text
10.005 kg
```

Use:

```text
IBM Plex Mono
tabular-nums
```

This should be reused everywhere.

---

# 30. Calculation Proof component

Instead of exposing equations everywhere:

```text
Calculated Error
-5.3 g       [ⓘ]
```

Click:

```text
┌──────────────────────────────────────────┐
│ CALCULATION PROOF                         │
│                                          │
│ Turning Point                            │
│ P = I + 0.5e - ΔL                        │
│                                          │
│ = 10.005 + 0.0025 - 0.0025               │
│ = 10.005 kg                              │
│                                          │
│ Calculated Error                         │
│ P - L = -5.3 g                           │
│                                          │
│ Reference                                │
│ OIML R 76-1 ...                           │
└──────────────────────────────────────────┘
```

The source explicitly calls for calculation-proof progressive disclosure. `Pasted markdown(20261004-065148).md`

---

# 31. Global shell dimensions

Desktop target:

```text
Header      ~64px
Sidebar     ~240-260px
Main        remaining viewport
```

Use a comfortable content width rather than stretching every screen to the entire monitor.

Something like:

```text
max-width: 1440px
```

for dense operational screens.

---

# 32. Sidebar behavior

Default:

```text
240px
```

Collapsed:

```text
72px
```

Expanded:

```text
icon + label
```

Collapsed:

```text
icon only
```

Tooltip on collapsed icons.

During active sessions:

```text
contextual mode
```

rather than exposing every application feature.

---

# 33. Header behavior

Header remains stable.

Don't make each page invent a new header.

Use:

```text
Lab
Role
IoT
Utilities
```

as persistent context.

Active sessions additionally get:

```text
VerificationSessionHeader
```

below it.

---

# 34. Responsive behavior

At desktop:

```text
Sidebar | Content
```

At tablet:

```text
Compact Sidebar
```

At mobile:

```text
Header
↓
Context selector
↓
Content
```

For an observation table, horizontal scrolling is acceptable.

Do **not** shrink 8 columns until everything becomes unreadable.

---

# 35. Animation rules

Maximum philosophy:

> Motion should explain state, not decorate the page.

Good:

```text
step completion
drawer slide
modal entrance
live scale stability
seal generation
loading
```

Bad:

```text
floating blobs
glowing borders
constant pulsing
animated gradients
parallax
```

---

# 36. Iconography

Use Lucide consistently.

Examples:

```text
Home            LayoutDashboard
Sessions        ClipboardList
Instrument      Scale
Review          ClipboardCheck
Standards       Weight
Audit           ShieldCheck
Reports         FileText
Settings        Settings

PASS            CheckCircle
FAIL            XCircle
Warning         AlertTriangle
Lock            Lock
Live            Radio
```

Do not mix random icon libraries.

The source explicitly specifies Lucide React. `Pasted markdown(20261004-065148).md`

---

# 37. The "one visual language" test

After the design system is implemented, these screens:

```text
Dashboard
Weighing
Review
Settings
```

should visibly look like the same application.

The user should recognize:

```text
same typography
same cards
same buttons
same status system
same spacing
same navigation
```

without consciously thinking about it.

---

# 38. Design-system implementation prompt

Give your coding IDE this next:

```text
PHASE 1 - DESIGN SYSTEM

Do not build business pages yet.

First inspect the repository and implement a centralized
METROLOGIX-76 design system.

Create reusable:
Button
Input
Select
SegmentedControl
Card
MetricCard
DataTable
ComplianceBadge
StatusPill
RoleBadge
TraceabilityBadge
ConnectionBadge
Modal
Drawer
Toast
EmptyState
Skeleton
ProgressRing
Stepper
LockoutBanner
TechnicalValue
CalculationProof

Create centralized:
colors
spacing
radii
shadows
typography
breakpoints
focus states
dark/light variables

Use Inter for UI.
Use IBM Plex Mono for technical values and identifiers.

Implement:
PASS
FAIL
MARGINAL
PENDING
LOCKED_OUT

as semantic states.

Do not hard-code colors inside feature components.

Do not duplicate styles.

Do not build Dashboard, Weighing, Review, or Settings yet.

Create a small internal component showcase page
to visually validate every primitive.

The showcase should demonstrate:

buttons
inputs
tables
badges
cards
modals
drawers
toasts
loading
empty
errors
lockout
stepper
technical values

Then perform visual QA.

The component showcase is not a product page.
It is an internal design-system validation screen.

Do not proceed to Phase 2 until:
- spacing is consistent
- typography is consistent
- status colors are consistent
- components are reusable
- dark/light themes work
- keyboard focus works
- mobile behavior works
- no component contains unnecessary visual decoration
```

---

# 39. The component showcase should look like this

```text
┌─────────────────────────────────────────────────────────────┐
│ METROLOGIX-76 DESIGN SYSTEM                                 │
│ Internal component validation                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ BUTTONS                                                     │
│ [Primary] [Secondary] [Ghost] [Danger]                     │
│                                                             │
│ STATUS                                                      │
│ ✓ PASS   ⚠ WARNING   ✕ FAIL   ◷ PENDING   🔒 LOCKED       │
│                                                             │
│ INPUTS                                                      │
│ Target Test Load                                            │
│ ┌──────────────────────────────┐                            │
│ │ 10.000                   kg  │                            │
│ └──────────────────────────────┘                            │
│                                                             │
│ TECHNICAL VALUE                                             │
│ 10.005 kg                                                   │
│ AV-2026-8812                                                │
│                                                             │
│ STEPPER                                                     │
│ ✓ ─ ✓ ─ ● ─ ○ ─ ○ ─ ○ ─ ○                                  │
│                                                             │
│ TABLE                                                       │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

This screen is extremely valuable because it lets you catch visual inconsistency **before** you have 20 complicated pages.

---

# 40. The next implementation phase

After this foundation is locked, the correct next build is:

**PHASE 2 - APPLICATION SHELL**

That phase should define the exact:

```text
Header
Sidebar
Contextual Session Sidebar
Page Container
Breadcrumbs
Session Header
Notifications
Role Switcher
Lab Switcher
IoT Status Chip
Scenario Launcher
Theme Switcher
Jury Assistant trigger
```

Only after that should the actual Home/Sessions workflow screens be built.

The source already identifies Header, Sidebar, Breadcrumbs and `VerificationSessionHeader` as the core layout components, so this is the correct dependency order. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:52:50 PM

next

## Response:
10/4/2026, 6:52:58 PM · gpt-5-6-t-mini

> **Implemented Phase Two app shell**
>
> 
>
> Worked for a few seconds

# PHASE 2 - APPLICATION SHELL

Now we build the **frame that every page lives inside**.

This is more important than it looks. The source specifically defines a global `Header`, `Sidebar`, `Breadcrumbs`, and `VerificationSessionHeader`, plus laboratory switching, role switching, scenario launching, live scale status, theme control, and the Jury Assistant. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

The shell must make METROLOGIX-76 feel like **one coherent system** before any individual feature is opened.

---

# 1. The final shell

Desktop:

```text id="k2t0mj"
┌───────────────────────────────────────────────────────────────────────────────┐
│ METROLOGIX-76   RRSL Bengaluru   [METROLOGIST]   10.250 kg ● STABLE   ☾  ◉ │
├───────────────┬───────────────────────────────────────────────────────────────┤
│               │                                                               │
│ WORK          │  Breadcrumbs                                                 │
│  Home         │                                                               │
│  Sessions     │  PAGE CONTENT                                                 │
│  Instruments  │                                                               │
│               │                                                               │
│ ASSURANCE     │                                                               │
│  Review       │                                                               │
│  Standards    │                                                               │
│  Audit        │                                                               │
│               │                                                               │
│ OUTPUT        │                                                               │
│  Reports      │                                                               │
│               │                                                               │
│ SYSTEM        │                                                               │
│  Settings     │                                                               │
│               │                                                               │
│               │                                                               │
│               │                                                               │
│ ● Online      │                                                               │
└───────────────┴───────────────────────────────────────────────────────────────┘
```

When a verification session is open:

```text id="v9d8hz"
┌───────────────────────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER                                                                 │
├───────────────┬───────────────────────────────────────────────────────────────┤
│ SESSION       │ ZM201 Retail Platform • AV-2026-8812 • CLASS III             │
│               │ Max 30 kg • e 0.005 kg • ✓ Traceability Valid               │
│ Overview      ├───────────────────────────────────────────────────────────────┤
│ Readiness     │ 01 ✓ ─ 02 ✓ ─ 03 ● ─ 04 ○ ─ 05 ○ ─ 06 ○ ─ 07 ○             │
│ Test Plan     ├───────────────────────────────────────────────────────────────┤
│ Physical      │                                                               │
│ Weighing      │ CURRENT TEST PAGE                                             │
│ Eccentricity  │                                                               │
│ Repeatability │                                                               │
│ Environment   │                                                               │
│ Review / Sign │                                                               │
│ Certificate   │                                                               │
└───────────────┴───────────────────────────────────────────────────────────────┘
```

Notice the important distinction:

**Global navigation tells me where I am in the application.**

**Session navigation tells me where I am in this verification.**

---

# 2. Shell component tree

Build this hierarchy:

```text id="5v9g6o"
<AppShell>
│
├── <Header />
│
├── <AppLayout>
│   │
│   ├── <Sidebar />
│   │
│   └── <MainViewport>
│       │
│       ├── <Breadcrumbs />
│       │
│       ├── <VerificationSessionHeader />   ← only in session routes
│       │
│       └── <PageContent />
│
└── <GlobalOverlays>
    ├── <ToastViewport />
    ├── <GlobalModal />
    └── <JuryDemoAssistant />
```

Don't allow individual pages to independently create the application chrome.

---

# 3. Header design

The header should be around **64px** tall.

Left:

```text id="ec4n1k"
METROLOGIX-76
Legal Metrology
```

Then active lab:

```text id="5g5y7x"
▣ RRSL Bengaluru
```

Center/right:

```text id="6k9zv0"
METROLOGIST
```

IoT:

```text id="0f9a22"
⚖ 10.250 kg
● STABLE
```

Utilities:

```text id="6h2x4r"
Scenario
Theme
Jury
Profile
```

The source calls for a national laboratory switcher, role switcher, synthetic scenario launcher, live IoT readout, dark/light toggle, and Jury Assistant. `Pasted markdown(20261004-065148).md`

---

# 4. Header hierarchy

Do **not** give every control the same visual weight.

Use:

```text id="s3pdvc"
METROLOGIX-76
      ↓
active lab
      ↓
role
      ↓
live instrument signal
      ↓
utilities
```

The application identity should remain visually dominant.

---

# 5. Laboratory switcher

Click:

```text id="6jowp7"
▣ RRSL Bengaluru ▾
```

Open:

```text id="4owjku"
┌──────────────────────────────────┐
│ ACTIVE LABORATORY                 │
│                                  │
│ ✓ RRSL Bengaluru                 │
│   Bengaluru, Karnataka           │
│                                  │
│ ○ RRSL Ahmedabad                 │
│   Ahmedabad, Gujarat              │
│                                  │
│ ○ RRSL Delhi                     │
│   New Delhi                      │
└──────────────────────────────────┘
```

Don't make it a massive dropdown.

The source explicitly envisions multi-lab switching such as RRSL Bengaluru, Ahmedabad and Delhi. `Pasted markdown(20261004-065148).md`

---

# 6. Laboratory switch behavior

On switching laboratory:

```text id="44uk7e"
Switch laboratory
        ↓
confirm
        ↓
current context updates
        ↓
dashboard/session data reloads
```

If an active session is open:

```text id="v9g6v9"
SWITCH LABORATORY?

You currently have an active verification
session in RRSL Bengaluru.

Changing laboratory will leave this session.

[ Cancel ] [ Switch Laboratory ]
```

Don't silently move the operator between laboratory contexts.

---

# 7. Role switcher

For the hackathon/demo:

```text id="qf0mso"
[ METROLOGIST ▾ ]
```

Dropdown:

```text id="r4v5jd"
SWITCH ROLE

✓ Metrologist
  Test Officer

○ Reviewer
  Technical Review

○ Director
  Statutory Authority

○ Auditor
  Read-only Inspection

○ Admin
  System Configuration
```

The source explicitly includes the role-switcher mechanism and five defined roles. `Pasted markdown(20261004-065148).md`

---

# 8. Important role-switcher treatment

Because this is a demo feature, distinguish:

```text id="g6m4jf"
DEMO ROLE SWITCHER
```

from a real production identity system.

In the UI, for example:

```text id="l8k7n4"
Demo Environment
```

should remain visible somewhere subtle.

That prevents the presentation feature from being mistaken for real security.

---

# 9. IoT status chip

When disconnected:

```text id="3q7mke"
⚖ Scale
○ Disconnected
```

Simulator:

```text id="90x9m3"
⚖ 10.250 kg
● STABLE
SIM
```

Physical connection:

```text id="dq0vsr"
⚖ 10.250 kg
● STABLE
USB
```

Unstable:

```text id="8x3f9a"
⚖ 10.246 kg
● UNSTABLE
```

The underlying IoT context already defines current weight, stability, unit, zero state, gross/net mode, connection and simulator state. `Pasted markdown(20261004-065148).md`

---

# 10. Clicking the IoT chip

Don't immediately send the user to another page.

Open a compact popover:

```text id="xkzby1"
LIVE SCALE

10.250 kg
● STABLE

Mode
GROSS

Connection
Virtual Simulator

[ Open Scale Bridge ]
```

That gives useful information without disrupting the current test.

---

# 11. Scenario launcher

Header control:

```text id="b2b9e8"
Demo Scenario ▾
```

Opening:

```text id="6f0o9d"
DEMO SCENARIOS

Standard Class III Retail
✓ Passing baseline

Rounding Discrepancy Trap
⚠ False spreadsheet PASS → true FAIL

Temperature Span Drift
✕ Thermal non-compliance

Eccentricity Cantilever Twist
✕ Corner-loading failure

High-Interval Class I
✓ Micro-precision
```

These five scenarios are explicitly defined in the source. `Pasted markdown(20261004-065148).md`

---

# 12. Scenario selection behavior

When selected:

```text id="g4j4gn"
Rounding Discrepancy Trap
```

show a small global banner:

```text id="n6ps3b"
DEMO SCENARIO
Rounding Discrepancy Trap
[ Exit Scenario ]
```

Do not make users wonder whether they are looking at real records.

---

# 13. Theme switch

Use a simple icon button:

```text id="6v2mjb"
☼
```

Tooltip:

```text id="qg95b1"
Switch to dark theme
```

The source supports dark/light theme through `ThemeContext`. `Pasted markdown(20261004-065148).md`

For your primary demonstration, keep the app in the agreed light-first appearance.

---

# 14. Sidebar

This is where we simplify the source's original 14-item sidebar.

The source originally lists many technical routes in the sidebar. `Pasted markdown(20261004-065148).md`

For the redesigned architecture, those technical pages should become **contextual session navigation**, while the permanent sidebar remains:

```text id="w5u2vh"
WORK
    Home
    Sessions
    Instruments

ASSURANCE
    Review
    Standards
    Audit

OUTPUT
    Reports

SYSTEM
    Settings
```

This is dramatically easier for a new user to understand.

---

# 15. Sidebar visual structure

```text id="nb4m4x"
┌──────────────────────────┐
│ METROLOGIX-76            │
│ Precision Verification   │
├──────────────────────────┤
│                          │
│ WORK                     │
│ ◉ Home                   │
│ ○ Sessions               │
│ ○ Instruments            │
│                          │
│ ASSURANCE                │
│ ○ Review                 │
│ ○ Standards              │
│ ○ Audit                  │
│                          │
│ OUTPUT                   │
│ ○ Reports                │
│                          │
│ SYSTEM                   │
│ ○ Settings               │
│                          │
│                          │
│ ──────────────────────── │
│ ● Online                 │
│ RRSL-BLR                 │
└──────────────────────────┘
```

Keep the section labels small and muted.

---

# 16. Active sidebar state

Don't use a huge filled rectangle.

Use:

```text id="ga8v2d"
▌ Home
```

with:

- subtle blue background
- navy text
- blue leading indicator

The active item should be obvious but restrained.

---

# 17. Collapsed sidebar

```text id="9ul5jv"
┌────┐
│ ◈  │
│    │
│ ⌂  │
│ ▣  │
│ ⚖  │
│    │
│ ✓  │
│ ◫  │
│ ◉  │
│    │
│ ⚙  │
└────┘
```

On hover:

```text id="r9m91u"
Sessions
```

through tooltip.

---

# 18. Session sidebar

When `/session/:id/*` is active, transform the sidebar:

```text id="ph5jcw"
SESSION

AV-2026-8812
CLASS III

────────────────

Overview
Readiness
Test Plan

TEST PROCEDURES

✓ Physical Inspection
● Weighing
○ Eccentricity
○ Repeatability
○ Environment

ASSURANCE

Review / Sign
Certificate
```

This is much better than exposing:

```text
Weighing
Eccentricity
Repeatability
Environmental
...
```

as unrelated global navigation.

---

# 19. Session navigation state

Each item gets a tiny state indicator:

```text id="ky8mkt"
✓ completed
● current
○ upcoming
! blocked
🔒 locked
```

Example:

```text id="x6mn5t"
TEST PROCEDURES

✓ Physical Inspection
● Weighing
○ Eccentricity
○ Repeatability
○ Environment
```

This makes the navigation itself part of the workflow.

---

# 20. Breadcrumbs

Use breadcrumbs above the page.

Normal:

```text id="t7yq9x"
Home / Sessions
```

Session:

```text id="0d0sjm"
Sessions / AV-2026-8812 / Weighing
```

Review:

```text id="q8gy0l"
Review / AV-2026-8812
```

Keep breadcrumbs small.

They are orientation, not page titles.

---

# 21. Main content container

Use:

```text id="lcgk5h"
width: 100%
max-width: 1440px
margin: auto
padding: 24px 32px
```

At smaller widths:

```text id="x6tya6"
padding: 16px
```

Avoid full-width content touching the sidebar and screen edges.

---

# 22. Content width by page type

Not every page should have the same maximum width.

Dashboard:

```text id="3cgs8n"
wide
```

Forms:

```text id="j5d0v4"
~1200px
```

Settings:

```text id="vg8crp"
~1200px
```

Dense observation grids:

```text id="1wbl2o"
maximum usable width
```

Certificate preview:

```text id="4qav3m"
controlled document width
```

The shell can therefore expose:

```tsx
<PageContainer variant="wide">
<PageContainer variant="form">
<PageContainer variant="document">
```

---

# 23. Session header

This is one of the strongest pieces of the product.

Example:

```text id="mcsw6x"
┌────────────────────────────────────────────────────────────────────┐
│ Avery Weigh-Tronix ZM201 Retail Platform                          │
│ AV-2026-8812                                  [ CLASS III ]        │
│                                                                    │
│ Max 30 kg   Min 0.1 kg   e 0.005 kg   d 0.005 kg                 │
│                                                                    │
│ ✓ Standard Weights Valid                                           │
├────────────────────────────────────────────────────────────────────┤
│ ✓        ✓        ●        ○        ○        ○        ○            │
│ Intake  Physical Weighing Eccentric Repeat Environment Review    │
└────────────────────────────────────────────────────────────────────┘
```

The source explicitly requires persistent instrument context plus the 7-step stepper. `Pasted markdown(20261004-065148).md`

---

# 24. Stepper interaction

Completed steps:

```text id="9f40kn"
click → open completed step
```

Current:

```text id="4n0e1a"
highlight
```

Future:

```text id="xj8a2b"
clickable only if prerequisites are met
```

Blocked:

```text id="2r9pbc"
click → explain why blocked
```

Do not let users jump freely past mandatory readiness gates.

---

# 25. Session header mobile

Desktop:

```text id="as4ih4"
Model + serial + specs + stepper
```

Mobile:

```text id="sz6d3u"
AV-2026-8812
CLASS III
✓ Valid

[ Step 03 / 07 ▾ ]
Weighing
```

Then allow the detailed session information to expand.

Do not squeeze the entire desktop header into a 390px screen.

---

# 26. Global lockout placement

The traceability lockout should sit **under the global/session context**, before page-specific content.

```text id="8xj1ft"
SESSION HEADER
       ↓
🔒 TRACEABILITY LOCKED
       ↓
PAGE CONTENT
```

So when a standards issue exists, the user sees it immediately.

---

# 27. Global toast positioning

Desktop:

```text id="jg4ew0"
                          ┌──────────────────────┐
                          │ ✓ Reading captured    │
                          └──────────────────────┘
```

Mobile:

```text id="4s4z1v"
┌──────────────────────────────┐
│ ✓ Reading captured           │
└──────────────────────────────┘
```

Do not let toasts cover essential primary actions.

---

# 28. Global Jury Assistant

The floating trigger should be subtle.

```text id="l1pq3o"
             ┌─────┐
             │ ▶ ? │
             └─────┘
```

When opened:

```text id="a8d5vi"
┌────────────────────────────────────────┐
│ JURY DEMO ASSISTANT               ×    │
│                                        │
│ 07:42 remaining                         │
│                                        │
│ ● Current step                          │
│   Demonstrate rounding trap             │
│                                        │
│ PRESENTER CUE                           │
│ "The legacy spreadsheet reports PASS,   │
│ but turning-point analysis identifies    │
│ the statutory failure."                 │
│                                        │
│ [ Previous ] [ Pause ] [ Next Step ]    │
└────────────────────────────────────────┘
```

The source specifies the 10-minute timeline, presenter cues, timer controls and tab synchronization. `Pasted markdown(20261004-065148).md`

---

# 29. Don't make the Jury Assistant a chatbot

This is important.

It should look like:

**Presentation control center**

not:

**AI assistant conversation**

No:

```text
Ask me anything...
```

Instead:

```text
Demo Timeline
Presenter Cue
What to Highlight
Next Step
```

---

# 30. Page transitions

Don't animate the entire shell.

Keep:

```text id="i0d4bx"
Header     fixed
Sidebar    fixed
Session    stable
Content    transitions softly
```

This creates continuity.

---

# 31. Shell-level permissions

The sidebar itself should adapt.

Example Metrologist:

```text id="e8z0tz"
Home
Sessions
Instruments
Review
Standards
Audit
Reports
Settings 🔒
```

But don't clutter the sidebar with inaccessible routes unless there's a strong reason to show them.

For most roles, Settings can simply be absent or clearly read-only according to your chosen permission UX.

---

# 32. Unsaved navigation guard

The shell should intercept:

```text
route change
```

when there are dirty changes.

Flow:

```text id="xgprc5"
User edits form
       ↓
dirty = true
       ↓
click another navigation item
       ↓
confirmation
       ↓
Stay / Discard
```

This needs to happen centrally instead of separately on every form.

---

# 33. Browser-level shell states

The shell should have:

### Normal

```text
● Online
```

### Syncing

```text
◌ Syncing
```

### Offline

```text
○ Offline
```

The source's laboratory context explicitly models online, syncing and offline states. `Pasted markdown(20261004-065148).md`

---

# 34. Offline state treatment

Do not make the whole screen red.

Use a calm banner:

```text id="9t4m66"
○ OFFLINE

Changes are being stored locally and will sync
when the connection is restored.
```

Only critical blocking conditions should use aggressive red.

---

# 35. Global shell component architecture

```text id="r1kz0u"
components/layout/

AppShell.tsx
Header.tsx
Sidebar.tsx
SessionSidebar.tsx
MainViewport.tsx
PageContainer.tsx
Breadcrumbs.tsx
GlobalOverlays.tsx
```

And:

```text id="j5r0p7"
components/session/

VerificationSessionHeader.tsx
SessionStepper.tsx
SessionIdentity.tsx
TraceabilityIndicator.tsx
SessionProgress.tsx
```

---

# 36. Navigation configuration

Don't hard-code JSX for navigation.

Use configuration:

```ts id="v8zi5l"
const globalNavigation = [
  {
    section: "WORK",
    items: [
      { key: "home", label: "Home", icon: LayoutDashboard },
      { key: "sessions", label: "Sessions", icon: ClipboardList },
      { key: "instruments", label: "Instruments", icon: Scale },
    ]
  },
  {
    section: "ASSURANCE",
    items: [
      { key: "review", label: "Review", icon: ClipboardCheck },
      { key: "standards", label: "Standards", icon: Weight },
      { key: "audit", label: "Audit", icon: ShieldCheck },
    ]
  },
  {
    section: "OUTPUT",
    items: [
      { key: "reports", label: "Reports", icon: FileText },
    ]
  },
  {
    section: "SYSTEM",
    items: [
      { key: "settings", label: "Settings", icon: Settings },
    ]
  }
];
```

Then render based on permissions.

---

# 37. Session navigation configuration

```ts id="ow4m7d"
const sessionNavigation = [
  { key: "overview", label: "Overview" },
  { key: "readiness", label: "Readiness" },
  { key: "plan", label: "Test Plan" },

  {
    group: "TEST PROCEDURES",
    items: [
      { key: "physical", label: "Physical Inspection" },
      { key: "weighing", label: "Weighing" },
      { key: "eccentricity", label: "Eccentricity" },
      { key: "repeatability", label: "Repeatability" },
      { key: "environment", label: "Environment" },
    ]
  },

  {
    group: "ASSURANCE",
    items: [
      { key: "review", label: "Review / Sign" },
      { key: "certificate", label: "Certificate" },
    ]
  }
];
```

---

# 38. The shell must remain boring

This is deliberate.

When someone sees:

```text
METROLOGIX-76
RRSL Bengaluru
CLASS III
AV-2026-8812
Step 3 / 7
```

they should immediately understand the context.

They should **not** be distracted by:

```text
glowing blue gradients
10 animated counters
floating particles
giant logos
decorative illustrations
```

The technical screens will carry the visual complexity where it actually adds value.

---

# 39. Phase 2 implementation prompt

Paste this into your AI coding IDE **after Phase 1 is complete**:

```text id="2j4jv9"
PHASE 2 - METROLOGIX-76 APPLICATION SHELL

The design system is now implemented.

Do not build feature pages yet.

Build the global application shell.

Create:

AppShell
Header
Sidebar
SessionSidebar
MainViewport
PageContainer
Breadcrumbs
VerificationSessionHeader
SessionStepper
TraceabilityIndicator
GlobalOverlayManager

GLOBAL HEADER:
- METROLOGIX-76 identity
- laboratory switcher
- role switcher
- live IoT status chip
- scenario launcher
- theme toggle
- Jury Demo Assistant trigger
- user/profile control

GLOBAL SIDEBAR:

WORK
Home
Sessions
Instruments

ASSURANCE
Review
Standards
Audit

OUTPUT
Reports

SYSTEM
Settings

Do not expose individual OIML tests as permanent global sidebar items.

When the user enters a verification session,
replace the global navigation context with SessionSidebar:

Overview
Readiness
Test Plan

TEST PROCEDURES
Physical Inspection
Weighing
Eccentricity
Repeatability
Environment

ASSURANCE
Review / Sign
Certificate

Implement:
- active navigation
- route-aware breadcrumbs
- sidebar collapse
- responsive mobile navigation
- role-aware navigation
- disabled/read-only behavior
- unsaved-change navigation guard
- online/sync/offline state
- global toast region
- modal/drawer layer
- scenario banner
- traceability lockout placement

VerificationSessionHeader must show:
- instrument model
- serial number
- accuracy class
- Max
- Min
- e
- d
- traceability status
- 7-step progress

Do not create a separate session header for each feature.

Create navigation from configuration objects,
not duplicated JSX.

Desktop:
64px header
240-260px sidebar
comfortable content margins

Collapsed sidebar:
icons with accessible tooltips

Mobile:
drawer navigation
compact session header
responsive breadcrumb
no desktop layout squashing

Do not build business feature content.

Use placeholder routes/components only to validate:
- Home
- Sessions
- Instruments
- Review
- Standards
- Audit
- Reports
- Settings
- Session Overview
- Session Readiness
- Weighing

The shell must be visually complete even though
the underlying pages are placeholders.

Then test:

1. switching laboratory
2. switching role
3. switching theme
4. opening scenario launcher
5. live IoT chip
6. entering session mode
7. leaving session mode
8. collapsed sidebar
9. mobile sidebar
10. offline indicator
11. traceability lockout
12. Jury Assistant drawer
13. unsaved navigation guard

Do not proceed to Phase 3 until the shell is visually stable.
```

---

# 40. Shell QA test

Before building Home, test exactly this flow:

```text id="a99r1k"
LOGIN
  ↓
HOME
  ↓
click SESSIONS
  ↓
open session
  ↓
SESSION SIDEBAR appears
  ↓
click WEIGHING
  ↓
persistent session header appears
  ↓
switch REVIEWER role
  ↓
observation controls later become read-only
  ↓
switch DIRECTOR
  ↓
same session identity remains
  ↓
switch lab
  ↓
confirmation appears
```

The shell is correct when the **navigation and context remain stable while the actual page changes**.

---

# 41. One critical architectural warning

Your original source's `Sidebar.tsx` defines a 14-item navigation structure. `Pasted markdown(20261004-065148).md`

I would **not blindly preserve that structure** in the new visual redesign.

The problem is not that those features are unnecessary-they are important.

The problem is:

```text
14 permanent navigation destinations
        ↓
cognitive overload
        ↓
user doesn't know where to start
```

The better model is:

```text
8 global destinations
        +
contextual session navigation
        ↓
much simpler mental model
```

All the underlying functionality remains; it is simply organized around the user's task.

---

# 42. Phase 2 success criterion

When a judge opens the app, before interacting with anything, they should be able to answer:

**What application is this?**

**Which laboratory am I in?**

**Who am I acting as?**

**Is the system connected?**

**Where am I?**

**What session am I working on?**

**What test step am I at?**

That is the shell's entire job.

Once this is working, the next phase should be **Phase 3 - Real Domain State + Mock Data + Session Lifecycle**, because that is what will allow every subsequent page to behave as one connected application instead of isolated UI mockups.

## Prompt:
10/4/2026, 6:53:58 PM

next

## Response:
10/4/2026, 6:54:07 PM · gpt-5-6-t-mini

> **Searched Phase 3 state models and continued detailed mock data implementation**
>
> 
>
> Worked for 11s

# PHASE 3 - DOMAIN STATE, MOCK DATA & SESSION LIFECYCLE

Now the shell exists. The next step is to make the application **behave like one real system**.

This is where METROLOGIX-76 stops being a collection of UI screens and becomes a connected verification application:

```text
Instrument
    ↓
Verification Session
    ↓
Test Plan
    ↓
Readiness
    ↓
Test Evidence
    ↓
Review
    ↓
Signature
    ↓
Certificate
```

The source already gives you the core TypeScript domain types, four instrument presets, five synthetic scenarios, and four React contexts (`LabContext`, `ScenarioContext`, `IoTContext`, `ThemeContext`). `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 1. The biggest architectural rule

Do **not** let each page own its own fake data.

Bad:

```text
WeighingPage
  └── local observations

EccentricityPage
  └── local corners

ReviewPage
  └── different fake session

CertificatePage
  └── another fake result
```

Good:

```text
                    VerificationSession
                            │
          ┌─────────────────┼──────────────────┐
          ↓                 ↓                  ↓
      Instrument          Tests              Review
                              │
                 ┌────────────┼────────────┐
                 ↓            ↓            ↓
             Weighing    Eccentricity  Repeatability
```

Every page reads the **same session object**.

---

# 2. Source-supported domain types

Preserve these types:

```ts
type AccuracyClass =
  | "CLASS_I"
  | "CLASS_II"
  | "CLASS_III"
  | "CLASS_IIII";

type VerificationStage =
  | "INITIAL_TYPE_APPROVAL"
  | "SUBSEQUENT_VERIFICATION"
  | "IN_SERVICE_INSPECTION";

type ReviewStatus =
  | "DRAFT"
  | "IN_TESTING"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REMANDED";

type ComplianceStatus =
  | "PASS"
  | "FAIL"
  | "MARGINAL"
  | "PENDING"
  | "LOCKED_OUT";

type UserRole =
  | "METROLOGIST"
  | "REVIEWER"
  | "DIRECTOR"
  | "AUDITOR"
  | "ADMIN";
```

These are explicitly present in the supplied specification. `Pasted markdown(20261004-065148).md`

---

# 3. Instrument model

Use the supplied model essentially as-is:

```ts
export interface Instrument {
  id: string;

  manufacturer: string;
  modelName: string;
  serialNumber: string;
  approvalNumber: string;

  accuracyClass: AccuracyClass;

  maxCapacity: number;
  minCapacity: number;

  e: number;
  d: number;
  unit: string;

  n: number;

  receptorType: string;
  numSupports: number;

  verificationStage: VerificationStage;

  firmwareVersion?: string;
  calibrationCounter?: number;

  status: ReviewStatus;
  complianceStatus: ComplianceStatus;
}
```

The supplied presets include exactly these kinds of instrument properties. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 4. Verification session aggregate

The source provides the underlying types and workflow, but it does **not** explicitly provide one complete `VerificationSession` interface.

So this is an architectural recommendation to connect the source-defined objects:

```ts
export interface VerificationSession {
  id: string;
  sessionNumber: string;

  instrumentId: string;

  verificationStage: VerificationStage;
  reviewStatus: ReviewStatus;
  complianceStatus: ComplianceStatus;

  readiness: TestReadiness;
  testPlan: TestPlan;

  physicalInspection: PhysicalInspection;
  weighing: WeighingTest;
  eccentricity: EccentricityTest;
  repeatability: RepeatabilityTest;
  environment: EnvironmentTest;

  reviewer?: ReviewRecord;
  directorSignature?: SignatureRecord;

  traceability: TraceabilityState;

  createdAt: string;
  updatedAt: string;
}
```

This aggregate is the piece that makes the rest of the UI coherent.

---

# 5. Session lifecycle

Implement one central state machine:

```text
DRAFT
  │
  │ Register / configure
  ▼
IN_TESTING
  │
  │ Complete required tests
  ▼
PENDING_REVIEW
  │
  ├───────────────┐
  │               │
  │ Approve       │ Remand
  ▼               ▼
DIRECTOR_REVIEW  REMANDED
  │               │
  │ Sign          │ Fix
  ▼               │
APPROVED ◄────────┘
  │
  ▼
IMMUTABLE
```

The source explicitly defines `DRAFT`, `IN_TESTING`, `PENDING_REVIEW`, `APPROVED`, and `REMANDED`. `Pasted markdown(20261004-065148).md`

For the UI, `APPROVED` should become permanently read-only, as already defined in the source's permission rules. `Pasted markdown(20261004-065148).md`

---

# 6. Do not allow arbitrary state mutation

Never let a component do:

```ts
session.reviewStatus = "APPROVED";
```

Instead:

```ts
transitionSession({
  sessionId,
  action: "SUBMIT_FOR_REVIEW"
});
```

Then centralize validation.

Example:

```ts
const allowedTransitions = {
  DRAFT: ["START_TESTING"],
  IN_TESTING: ["SUBMIT_FOR_REVIEW"],
  PENDING_REVIEW: ["APPROVE", "REMAND"],
  REMANDED: ["RESUME_TESTING"],
  APPROVED: []
};
```

This makes impossible states much harder to create.

---

# 7. Domain actions

Create a small session service:

```text
src/lib/session/

sessionStateMachine.ts
sessionActions.ts
sessionSelectors.ts
sessionGuards.ts
```

Actions:

```ts
startTesting()
completeReadiness()
submitForReview()
remandSession()
approveSession()
signCertificate()
lockSession()
```

Selectors:

```ts
getCurrentStep()
getOverallProgress()
getSessionVerdict()
getBlockingIssues()
getPendingActions()
getSessionLockState()
```

---

# 8. Example session actions

```ts
startTesting(session)

completeReadiness(session)

updateObservation(session, rowId, patch)

completeTest(session, "WEIGHING")

submitForReview(session)

addReviewComment(session, comment)

approveReview(session)

signCertificate(session, signature)

lockApprovedSession(session)
```

This is much safer than every page manipulating the session differently.

---

# 9. Readiness state

Create:

```ts
interface TestReadiness {
  overallStatus: "READY" | "ATTENTION" | "BLOCKED";

  checks: ReadinessCheck[];

  score: number;

  blockingIssues: string[];

  checkedAt: string;
}
```

And:

```ts
interface ReadinessCheck {
  id: string;
  label: string;
  category: "INSTRUMENT" | "TRACEABILITY" | "TEST_PLAN" | "ENVIRONMENT";

  required: boolean;

  status: "READY" | "ATTENTION" | "BLOCKED";

  message?: string;

  action?: {
    label: string;
    route: string;
  };
}
```

This connects directly to the Screen 19 readiness gate we designed.

---

# 10. Test Plan model

```ts
interface TestPlan {
  verificationStage: VerificationStage;

  procedures: TestProcedure[];

  allRequiredComplete: boolean;
}
```

```ts
interface TestProcedure {
  key:
    | "PHYSICAL"
    | "WEIGHING"
    | "ECCENTRICITY"
    | "REPEATABILITY"
    | "ENVIRONMENT";

  label: string;

  applicable: boolean;

  required: boolean;

  status: ComplianceStatus | "NOT_APPLICABLE";
}
```

The source describes a Test Scope Matrix that maps statutory tests against the instrument class and verification stage. `Pasted markdown(20261004-065148).md`

---

# 11. Observation model

The source gives the `ObservationRow` structure:

```ts
interface ObservationRow {
  stepIndex: number;
  nominalLoad: number;
  scaleReading: number;

  auxiliaryDeltaL?: number;

  turningPointP: number;

  errorE: number;

  correctedErrorEc: number;

  mpeLimit: number;

  status: ComplianceStatus;

  hasComment?: boolean;
}
```

This should become a central reusable structure rather than something created only inside `ObservationGrid`. `Pasted markdown(20261004-065148).md`

---

# 12. Weighing test state

Recommended:

```ts
interface WeighingTest {
  ascending: ObservationRow[];
  descending: ObservationRow[];

  completed: boolean;

  overallStatus: ComplianceStatus;

  maxObservedError?: number;
  minObservedError?: number;
}
```

Then:

```text
Weighing Page
      ↓
session.weighing.ascending
session.weighing.descending
```

The source explicitly defines separate ascending and descending series. `Pasted markdown(20261004-065148).md`

---

# 13. Eccentricity state

```ts
interface EccentricityTest {
  geometry:
    | "SQUARE"
    | "ROUND"
    | "ROLLING_LOAD";

  points: EccentricityPoint[];

  overallStatus: ComplianceStatus;

  completed: boolean;
}
```

```ts
interface EccentricityPoint {
  id: string;
  label: string;
  load: number;
  observedValue: number;
  deviation: number;
  mpeLimit: number;
  status: ComplianceStatus;
}
```

This supports the source's square, round and rolling-load platter modes. `Pasted markdown(20261004-065148).md`

---

# 14. Repeatability state

```ts
interface RepeatabilityTest {
  targetLoad: number;

  readings: RepeatabilityReading[];

  observedSpread: number;
  allowableLimit: number;

  status: ComplianceStatus;

  completed: boolean;
}
```

The source explicitly calls for a 10-reading sequence plus spread analysis. `Pasted markdown(20261004-065148).md`

---

# 15. Environment state

```ts
interface EnvironmentTest {
  baseline: {
    temperature: number;
    humidity: number;
    pressure: number;
  };

  tare: TareTest;

  temperatureDrift: TemperatureDriftTest;

  chamber: ChamberState;

  status: ComplianceStatus;

  completed: boolean;
}
```

The source defines these three environmental sub-areas: Tare Accuracy, Temperature Drift and Chamber HUD. `Pasted markdown(20261004-065148).md`

---

# 16. Traceability model

```ts
interface TraceabilityState {
  standardSetId: string;

  calibrationValid: boolean;

  calibrationDate: string;
  expiryDate: string;

  daysRemaining: number;

  lockoutReason?: string;
}
```

Then one selector:

```ts
getTraceabilityState(session)
```

determines:

```text
VALID
EXPIRING_SOON
EXPIRED
LOCKED
```

---

# 17. User data

Use the source-defined shape:

```ts
interface UserProfile {
  id: string;

  fullName: string;
  designation: string;
  email: string;

  role: UserRole;

  laboratoryId: string;
  laboratoryName: string;
}
```

`Pasted markdown(20261004-065148).md`

Mock users:

```text
Dr. A. Kumar
Laboratory Director
DIRECTOR

R. Singh
Technical Reviewer
REVIEWER

Shashi Shekhar
Verification Officer
METROLOGIST

P. Das
Audit Officer
AUDITOR

System Administrator
ADMIN
```

Keep these clearly marked as demo identities.

---

# 18. Laboratory data

Use the source model:

```ts
interface Laboratory {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  labType: "RRSL" | "GATC";
  nablAccreditationNo: string;
}
```

`Pasted markdown(20261004-065148).md`

Example:

```ts
export const LAB_RRSL_BENGALURU = {
  id: "lab-rrsl-blr",
  code: "RRSL-BLR",
  name: "Regional Reference Standards Laboratory",
  city: "Bengaluru",
  state: "Karnataka",
  labType: "RRSL",
  nablAccreditationNo: "DEMO-NABL-0001"
};
```

This is demo data, so do not present the accreditation number as a real credential.

---

# 19. Preserve the four supplied instruments

Do not replace these with generic “Scale A/B/C” data.

The source provides:

### Avery

```text
Avery Weigh-Tronix
ZM201 Retail Platform
AV-2026-8812
CLASS III
Max 30 kg
Min 0.100 kg
e 0.005 kg
d 0.005 kg
n 6000
INITIAL_TYPE_APPROVAL
```

`Pasted markdown(20261004-065148).md`

### Mettler

```text
Mettler-Toledo
XPR Analytical Micro-Balance
MT-2026-0049
CLASS I
Max 120 g
Min 0.010 g
e 0.001 g
d 0.0001 g
n 120000
```

`Pasted markdown(20261004-065148).md`

### Sansui

```text
Sansui Precision
GoldMaster-6K
SN-2026-3391
CLASS II
Max 6000 g
Min 5 g
e 0.1 g
d 0.1 g
n 60000
```

`Pasted markdown(20261004-065148).md`

### Essae

```text
Essae-Teraoka
DS-215 Heavy Platform
ET-2026-9041
CLASS IIII
Max 150 kg
Min 2 kg
e 0.05 kg
d 0.05 kg
n 3000
```

`Pasted markdown(20261004-065148).md`

---

# 20. Synthetic scenario architecture

Create:

```ts
interface SyntheticScenario {
  id: string;

  name: string;
  shortDescription: string;

  severity: "PASS" | "WARNING" | "FAIL";

  instrument: Instrument;

  session: VerificationSession;

  demoNarrative: {
    problem: string;
    discovery: string;
    conclusion: string;
  };
}
```

The exact full `SyntheticScenario` interface is not provided in the source, so this is an implementation recommendation built around its existing `ScenarioContext`. The source does explicitly require five synthetic scenarios and scenario loading. `Pasted markdown(20261004-065148).md`

---

# 21. The five scenarios

Use these exact IDs:

```text
standard_class_iii_retail
rounding_discrepancy_trap
temperature_span_drift_fail
eccentricity_cantilever_twist
high_interval_class_i_analytical
```

`Pasted markdown(20261004-065148).md`

---

# 22. Scenario 1 - clean baseline

```text id="zq4r8h"
STANDARD CLASS III RETAIL

Instrument:
Avery ZM201

Result:
PASS

Purpose:
normal successful verification
```

The source describes this as a standard 30 kg × 5 g counter-scale baseline with clean observations and PASS results. `Pasted markdown(20261004-065148).md`

This should power your **normal happy-path demo**.

---

# 23. Scenario 2 - the killer demo

```text id="2h8xq8"
ROUNDING DISCREPANCY TRAP
```

The source defines:

```text
capacity boundary:
2,000e

target:
10,000 g

legacy spreadsheet:
I - L = 0
PASS

turning-point analysis:
-5.3 g

legal limit:
±5.0 g

true result:
FAIL
```

`Pasted markdown(20261004-065148).md`

This scenario should be fully synchronized across:

```text
Scenario launcher
↓
Session
↓
Weighing
↓
Calculation proof
↓
Review
↓
Audit
↓
Certificate outcome
```

---

# 24. Scenario 3 - thermal failure

Use the source's narrative:

```text
reference:
+20°C
PASS

elevated:
+40°C
FAIL

reason:
thermal expansion / span shift
```

The source describes the case as an OIML Clause A.5.3 thermal non-compliance scenario. `Pasted markdown(20261004-065148).md`

Do not invent extra legal behavior around it.

---

# 25. Scenario 4 - eccentricity failure

Use:

```text
center:
PASS

Corner 4:
-6.2 g

load:
1/3 Max

final:
FAIL
```

The source explicitly defines the Corner 4 mechanical sag scenario. `Pasted markdown(20261004-065148).md`

On the Eccentricity screen:

```text
Corner 1  ✓
Corner 2  ✓
Corner 3  ✓
Corner 4  ✕
```

The platter should visually expose the failing location.

---

# 26. Scenario 5 - Class I precision

Use:

```text
120 g
e = 0.001 g
n = 120,000
PASS
```

The source describes this as a micro-precision/high-interval Class I analytical scenario intended to demonstrate precision without floating-point roundoff errors. `Pasted markdown(20261004-065148).md`

---

# 27. Scenario loading behavior

When the user clicks:

```text
Rounding Discrepancy Trap
```

perform:

```text
loadScenario()
     ↓
load associated instrument
     ↓
load associated session
     ↓
set active session
     ↓
navigate to relevant view
     ↓
show DEMO badge
```

The source already defines `loadScenario`, `activeScenario`, `loadedSessionId`, `loadedSessionNumber`, and the rounding-trap flag. `Pasted markdown(20261004-065148).md`

---

# 28. Don't reload each page separately

This is a common AI coding mistake.

Bad:

```ts
WeighingPage:
if (scenario === rounding) fakeRows()

ReviewPage:
if (scenario === rounding) fakeReview()

CertificatePage:
if (scenario === rounding) fakeCertificate()
```

Good:

```text id="gkmr4l"
Scenario
  ↓
VerificationSession
  ↓
all pages read same state
```

One source of truth.

---

# 29. Central selectors

Create:

```ts
getSessionVerdict()
getCurrentStep()
getCompletedStepCount()
getApplicableProcedureCount()
getBlockingIssues()
getReviewStatus()
getTraceabilityStatus()
getSessionProgress()
getPendingActions()
```

Example:

```ts
const progress =
  completedRequiredSteps / totalRequiredSteps;
```

Keep these calculations out of JSX.

---

# 30. Session progress

Calculate actual workflow state.

Example:

```text id="1kp8ua"
PHYSICAL        ✓
WEIGHING        ✓
ECCENTRICITY    ✓
REPEATABILITY   ●
ENVIRONMENT     ○

3 / 5 procedures complete
```

Do not fake:

```text
67%
```

unless the underlying session actually supports it.

---

# 31. "Next action" selector

This will make the application feel unusually intelligent without using AI.

Create:

```ts
getNextBestAction(session)
```

Examples:

```text
INSTRUMENT INCOMPLETE
→ Complete instrument details

READINESS BLOCKED
→ Resolve traceability issue

READINESS READY
→ Start testing

WEIGHING INCOMPLETE
→ Capture remaining readings

ALL TESTS COMPLETE
→ Submit for review

PENDING REVIEW
→ Review session

APPROVED
→ Download certificate
```

Then every page can show:

```text
NEXT ACTION
[ Continue Weighing → ]
```

---

# 32. Session overview should consume these selectors

Example:

```text id="v3f9zj"
SESSION STATUS

IN TESTING

4 / 5 procedures complete

Current step:
Repeatability

Result so far:
PASS

Next:
Complete repeatability sequence

[ Continue Testing → ]
```

This is far better than making the user interpret raw state.

---

# 33. Review state

Recommended:

```ts
interface ReviewRecord {
  reviewerId: string;
  reviewerName: string;

  recommendation:
    | "APPROVE"
    | "REMAND";

  comments: RowAuditComment[];

  reviewedAt?: string;
}
```

The source explicitly defines row-level audit comments and reviewer actions. `Pasted markdown(20261004-065148).md`

---

# 34. Director signature

```ts
interface SignatureRecord {
  directorId: string;
  directorName: string;

  signedAt: string;

  digest: string;

  declarationAccepted: boolean;

  sealApplied: boolean;

  certificateId?: string;
}
```

The source requires Director PIN signing, statutory declaration, SHA-256 preview, Green Guilloche seal and certificate verification QR behavior. `Pasted markdown(20261004-065148).md`

---

# 35. Immutability

When the session becomes approved:

```ts
session.reviewStatus = "APPROVED";
```

But more importantly:

```text
session.isImmutable = true
```

Then all editing actions pass through:

```ts
assertSessionEditable(session)
```

which throws/returns a controlled error:

```text
"This verification record is approved
and is permanently read-only."
```

Do not rely only on disabled HTML inputs.

The state layer itself must prevent mutation.

---

# 36. Mock repositories

Create adapters:

```text
src/data/
    repositories/

    instrumentRepository.ts
    sessionRepository.ts
    standardsRepository.ts
    userRepository.ts
```

Example:

```ts
export interface SessionRepository {
  list(): Promise<VerificationSession[]>;
  getById(id: string): Promise<VerificationSession | null>;
  create(session: VerificationSession): Promise<VerificationSession>;
  update(session: VerificationSession): Promise<VerificationSession>;
}
```

Then:

```text
MockSessionRepository
```

can later become:

```text
ApiSessionRepository
```

without rewriting React pages.

---

# 37. Local persistence

For your hackathon frontend:

```text
sessionStorage / localStorage
```

can persist demo state.

Example:

```text
metrologix:selectedSession
metrologix:activeScenario
metrologix:theme
metrologix:lab
metrologix:role
```

But clearly separate:

```text
DEMO LOCAL STATE
```

from production data architecture.

---

# 38. Scenario persistence

If a judge refreshes the page during a demo:

```text
Rounding Trap
```

should not mysteriously disappear.

Persist:

```ts
activeScenarioId
loadedSessionId
```

then restore it on startup.

The source explicitly models active scenario and loaded session identifiers in `ScenarioContext`. `Pasted markdown(20261004-065148).md`

---

# 39. IoT integration point

The session should never talk directly to WebSerial.

Instead:

```text
IoTContext
   ↓
captureCurrentReading()
   ↓
Observation action
   ↓
session.weighing.rows[rowId]
```

The source defines `captureCurrentReading()` specifically for this purpose. `Pasted markdown(20261004-065148).md`

That keeps hardware complexity isolated.

---

# 40. Example capture flow

User clicks:

```text
[ Capture Live Weight ]
```

System:

```text
IoTContext.currentWeight
        ↓
isStable?
        ↓
YES
        ↓
populate Observed Reading
        ↓
calculate derived values
        ↓
update row status
        ↓
toast:
✓ Stable reading captured
```

If unstable:

```text
⚠ Scale reading is not stable

Wait for the STABLE state or capture manually.
```

The action flow is consistent with the source's live-capture interaction. `Pasted markdown(20261004-065148).md`

---

# 41. Derived values

Keep derived calculation logic outside UI components.

Create:

```text
src/lib/metrology/
    calculateTurningPoint.ts
    calculateError.ts
    calculateCorrectedError.ts
    calculateCompliance.ts
    calculateSpread.ts
```

Then:

```ts
const result = calculateObservation({
  nominalLoad,
  scaleReading,
  e,
  deltaL,
  zeroError
});
```

The source itself defines the observation fields and the turning-point/error calculation structure. `Pasted markdown(20261004-065148).md`

---

# 42. Important: calculation logic must be deterministic

Don't let the AI component decide:

```ts
if (Math.abs(error) < someRandomValue)
```

Keep it in one place.

Example conceptual pipeline:

```text
raw observations
      ↓
derived calculation
      ↓
legal comparison
      ↓
status
```

The UI only renders the result.

---

# 43. Action handlers from the source

The source provides several explicit UI state transitions that should become application actions:

```text
Load preset
Switch role
Capture live weight
Flag row
Submit review
Director sign
Toggle report language
Download certificate
Jury Next Step
```

`Pasted markdown(20261004-065148).md`

Your implementation should centralize these.

---

# 44. Session action map

```ts
type SessionAction =
  | "LOAD_PRESET"
  | "START_TESTING"
  | "UPDATE_INSTRUMENT"
  | "COMPLETE_READINESS"
  | "UPDATE_TEST_PLAN"
  | "UPDATE_PHYSICAL"
  | "UPDATE_WEIGHING"
  | "UPDATE_ECCENTRICITY"
  | "UPDATE_REPEATABILITY"
  | "UPDATE_ENVIRONMENT"
  | "SUBMIT_FOR_REVIEW"
  | "ADD_REVIEW_COMMENT"
  | "REMAND_SESSION"
  | "APPROVE_REVIEW"
  | "SIGN_CERTIFICATE"
  | "LOCK_SESSION";
```

This gives the application a clean event-driven structure.

---

# 45. Audit events should be generated automatically

Every significant action should create an audit event.

Example:

```ts
interface AuditEvent {
  id: string;

  timestamp: string;

  actorId: string;
  actorName: string;
  actorRole: UserRole;

  action: string;

  sessionId?: string;

  metadata?: Record<string, unknown>;

  hash?: string;
}
```

Then:

```text
Load scenario
Create session
Edit reading
Capture IoT
Submit
Comment
Remand
Approve
Sign
Lock
Download
```

can all become timeline events.

This matches the source's immutable chronological audit-trail concept. `Pasted markdown(20261004-065148).md`

---

# 46. One unified demo

Once Phase 3 is complete, this should work:

```text
HOME
 ↓
Load Avery preset
 ↓
New session
 ↓
Readiness READY
 ↓
Test Plan
 ↓
Physical PASS
 ↓
Weighing PASS
 ↓
Eccentricity PASS
 ↓
Repeatability PASS
 ↓
Environment PASS
 ↓
Submit
 ↓
Role → REVIEWER
 ↓
Review
 ↓
Approve
 ↓
Role → DIRECTOR
 ↓
Sign
 ↓
APPROVED
 ↓
IMMUTABLE
 ↓
Certificate
 ↓
Audit trail
```

And the special demo:

```text
Scenario Launcher
 ↓
Rounding Trap
 ↓
Weighing
 ↓
Legacy PASS
 ↓
Turning Point FAIL
 ↓
Review
 ↓
Failure propagated
```

That is the point where your frontend becomes **convincing**.

---

# 47. Phase 3 folder structure

```text
src/
│
├── types/
│   ├── instrument.ts
│   ├── session.ts
│   ├── observation.ts
│   ├── review.ts
│   ├── standards.ts
│   ├── laboratory.ts
│   └── scenario.ts
│
├── data/
│   ├── instruments.ts
│   ├── sessions.ts
│   ├── users.ts
│   ├── laboratories.ts
│   ├── standards.ts
│   ├── observations.ts
│   └── scenarios.ts
│
├── repositories/
│   ├── instrumentRepository.ts
│   ├── sessionRepository.ts
│   ├── standardsRepository.ts
│   └── userRepository.ts
│
├── lib/
│   ├── session/
│   │   ├── sessionStateMachine.ts
│   │   ├── sessionActions.ts
│   │   ├── sessionGuards.ts
│   │   └── sessionSelectors.ts
│   │
│   ├── metrology/
│   │   ├── calculateTurningPoint.ts
│   │   ├── calculateError.ts
│   │   ├── calculateCompliance.ts
│   │   └── calculateSpread.ts
│   │
│   └── audit/
│       └── auditEvents.ts
│
└── contexts/
    ├── LabContext.tsx
    ├── ScenarioContext.tsx
    ├── IoTContext.tsx
    └── ThemeContext.tsx
```

---

# 48. Master implementation prompt for Phase 3

Give your coding IDE this **after Phase 2 is stable**:

```text id="6x8bn7"
PHASE 3 - DOMAIN STATE, MOCK DATA & SESSION LIFECYCLE

The application shell is complete.

Now implement the real frontend domain/state architecture.

DO NOT redesign the shell.

DO NOT build polished feature pages yet.

First build the data and state foundation that all feature pages will use.

==================================================
1. PRESERVE EXISTING DOMAIN TERMINOLOGY
==================================================

Preserve:

AccuracyClass
VerificationStage
ReviewStatus
ComplianceStatus
UserRole
Laboratory
UserProfile
ObservationRow
RowAuditComment

Do not rename these unnecessarily.

==================================================
2. CENTRAL VERIFICATION SESSION
==================================================

Create a central VerificationSession aggregate that connects:

Instrument
Readiness
Test Plan
Physical Inspection
Weighing
Eccentricity
Repeatability
Environment
Review
Signature
Traceability
Audit

Every feature page must eventually consume this shared session state.

Do NOT create isolated fake data per page.

==================================================
3. SESSION STATE MACHINE
==================================================

Implement:

DRAFT
→ IN_TESTING
→ PENDING_REVIEW
→ APPROVED

Alternative:

PENDING_REVIEW
→ REMANDED
→ IN_TESTING

APPROVED:
permanently read-only

Do not allow arbitrary state transitions.

Implement centralized actions:

startTesting()
submitForReview()
remandSession()
approveReview()
signCertificate()
lockSession()

==================================================
4. SESSION SELECTORS
==================================================

Create:

getCurrentStep()
getOverallProgress()
getSessionVerdict()
getBlockingIssues()
getNextBestAction()
getTraceabilityStatus()
getSessionLockState()
getPendingActions()

Keep derived logic outside React JSX.

==================================================
5. FOUR CONTEXTS
==================================================

Use:

LabContext
ScenarioContext
IoTContext
ThemeContext

Preserve the source-defined responsibilities.

ScenarioContext must support:
activeScenario
loading
error
allScenarios
loadScenario()
clearScenario()
isRoundingTrapActive
loadedSessionId
loadedSessionNumber

IoTContext must support:
connection
simulator
current weight
stability
unit
gross/net
serial logs
WELMEC audit
auto-capture
captureCurrentReading()

==================================================
6. INSTRUMENT DATA
==================================================

Preserve the four supplied instrument presets:

Avery Class III Retail
Mettler Class I Analytical
Sansui Class II Gold
Essae Class IIII Industrial

Do not replace them with generic mock names.

==================================================
7. SCENARIOS
==================================================

Preserve these exact IDs:

standard_class_iii_retail
rounding_discrepancy_trap
temperature_span_drift_fail
eccentricity_cantilever_twist
high_interval_class_i_analytical

Every scenario must provide coherent session state.

Scenario loading must update:
instrument
session
test results
review status
dashboard/session displays
and relevant technical views.

==================================================
8. ROUNDING TRAP
==================================================

Implement the provided scenario exactly as demo data:

Legacy:
I - L
0.0 g
PASS

METROLOGIX-76:
unrounded turning-point error
-5.3 g

legal tolerance:
±5.0 g

true verdict:
FAIL

Make the scenario synchronized across every affected screen.

==================================================
9. MOCK REPOSITORIES
==================================================

Create repository interfaces:

InstrumentRepository
SessionRepository
StandardsRepository
UserRepository

Provide mock implementations.

Do not place hard-coded datasets directly inside React components.

The repository layer must make later API integration possible.

==================================================
10. PERSISTENCE
==================================================

Persist demo state where useful:

active role
active laboratory
theme
active scenario
active session

Use local browser storage only for frontend demo persistence.

Clearly distinguish demo state from production backend state.

==================================================
11. DERIVED CALCULATIONS
==================================================

Create dedicated metrology functions:

calculateTurningPoint()
calculateError()
calculateCorrectedError()
calculateCompliance()
calculateSpread()

Do not implement these formulas independently in UI components.

Do not invent additional legal rules.

Use the provided application specification as the source of truth.

==================================================
12. REVIEW STATE
==================================================

Create review state supporting:

reviewer
recommendation
comments
review timestamp

Support:
Approve
Remand

Remand requires a reason.

==================================================
13. DIRECTOR SIGNATURE STATE
==================================================

Create signature state containing:

director
timestamp
digest
declaration
seal state
certificate ID

Signing must move the session into APPROVED/immutable state.

==================================================
14. IMMUTABILITY
==================================================

Once APPROVED:

all editing operations must be rejected at the state/action layer.

Do not rely only on disabled buttons.

Show:
APPROVED
IMMUTABLE
LOCKED

==================================================
15. AUDIT EVENTS
==================================================

Create a central audit-event model.

Automatically emit events for meaningful state changes:

session creation
instrument update
observation capture
review submission
review comment
remand
approval
signature
lock
certificate generation

Do not make the Audit page invent its own history.

==================================================
16. NEXT BEST ACTION
==================================================

Implement:

getNextBestAction(session)

Examples:

missing instrument:
Complete Instrument

readiness blocked:
Resolve Blocking Issue

readiness ready:
Start Testing

test incomplete:
Continue Current Test

tests complete:
Submit for Review

pending review:
Open Review

approved:
Open Certificate

This must be deterministic.

==================================================
17. TEST STATE
==================================================

Create connected state for:

Physical Inspection
Weighing
Eccentricity
Repeatability
Environment

Do not build the final visual UI yet.

Make sure mutations work correctly.

==================================================
18. VALIDATION
==================================================

Before moving to the next phase,
test these flows:

A. Happy path

register
→ readiness
→ tests
→ review
→ sign
→ immutable

B. Remand path

testing
→ submit
→ review
→ remand
→ testing again

C. Rounding trap

scenario
→ weighing
→ false legacy PASS
→ true FAIL

D. Traceability lockout

expired standard
→ LOCKED_OUT

E. Role switching

Metrologist
→ Reviewer
→ Director
→ Auditor

Verify the same session remains consistent.

F. Browser refresh

active scenario/session survives refresh.

==================================================
19. CRITICAL RULE
==================================================

Do not proceed to polished feature-page implementation
until the following is true:

One session can be created,
updated,
reviewed,
remanded,
approved,
signed,
locked,
and reflected consistently throughout the application.

The state architecture is more important than visual polish
at this phase.
```

---

# 49. The test that matters most

After Phase 3, do this:

```text
1. Load Avery Class III
2. Create session
3. Change one weighing reading
4. Navigate away
5. Return
6. Reading is still there
7. Go to Review
8. Same result is displayed
9. Go to Audit
10. Change appears in history
11. Sign as Director
12. Return to Weighing
13. Input is locked
14. Open Certificate
15. Certificate reflects same result
```

If that works, you have the **core product architecture**.

If it doesn't, don't spend time polishing gradients, animations or icons yet.

---

## What comes immediately after this

**PHASE 4 - HOME + SESSIONS + INSTRUMENT WORKSPACE**

That will be the first phase where we turn the architecture into the actual operational screens and connect the judge's first 30 seconds:

```text
Login
  ↓
Home
  ↓
Active Sessions
  ↓
Register Instrument
  ↓
Create Verification Session
  ↓
Readiness
```

That is the first part of the product the judges will actually experience.

## Prompt:
10/4/2026, 6:55:26 PM

next

## Response:
10/4/2026, 6:55:33 PM · gpt-5-6-t-mini

# PHASE 4 - HOME + SESSIONS + INSTRUMENT WORKSPACE

Now we move from architecture into the **first real operational experience**.

These are the screens that establish the user's mental model before they enter the technical OIML workflow:

```text
HOME
  ↓
SESSIONS
  ↓
INSTRUMENT
  ↓
CREATE VERIFICATION
  ↓
READINESS
```

The source already defines the Executive Dashboard, Active Tests Workspace, and Instrument Intake, including KPIs, recent sessions, four presets, OCR/nameplate input, metrological specifications, photo dossier and the action to register an instrument and begin testing. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 1. The three-screen relationship

Do not build these as unrelated pages.

```text
HOME
│
│ shows laboratory state
│
▼
SESSIONS
│
│ shows individual verification work
│
▼
INSTRUMENT
│
│ creates/edits instrument
│
▼
VERIFICATION SESSION
```

The distinction should be crystal clear:

### Home

> **What is happening in my laboratory?**

### Sessions

> **Which verification should I work on?**

### Instrument

> **What instrument am I registering?**

---

# 2. HOME - operational command center

The source calls for four clean KPI cards:

- Active Verifications
- Pending Director Sign-Off
- NABL 24h Pass Rate
- Traceability Status

followed by recent sessions, a compliance visualization and quick-start presets. `Pasted markdown(20261004-065148).md`

But visually, I would make it less "dashboard template" and more **laboratory operations center**.

---

# 3. Home screen structure

```text id="zn79x5"
┌───────────────────────────────────────────────────────────────────────┐
│ Home                                                                  │
│ Laboratory verification overview                                      │
│                                                                       │
│ RRSL Bengaluru                               ● System Operational     │
├──────────────┬───────────────┬───────────────┬───────────────────────┤
│ ACTIVE       │ PENDING       │ PASS RATE     │ TRACEABILITY          │
│ VERIFICATIONS│ DIRECTOR     │               │                       │
│              │ SIGN-OFF      │ 94.2%         │ ✓ 100% VALID          │
│ 12           │ 3             │ last 24h      │                       │
├───────────────────────────────────────────────┬───────────────────────┤
│                                               │ COMPLIANCE            │
│ RECENT VERIFICATION SESSIONS                  │                       │
│                                               │      ◔ PASS           │
│ Session  Instrument       Progress   Status   │      ◔ WARNING        │
│ AV-8812  ZM201            5/7        Testing  │      ◔ FAIL           │
│ MT-0049  XPR              7/7        Review   │                       │
│ SN-3391  GoldMaster       7/7        Approved │                       │
│                                               │                       │
├───────────────────────────────────────────────┴───────────────────────┤
│ QUICK START                                                            │
│                                                                       │
│ [ Avery Class III ] [ Mettler Class I ] [ Sansui Class II ]          │
│ [ Essae Class IIII ]                                                  │
└───────────────────────────────────────────────────────────────────────┘
```

---

# 4. Home header

Keep it extremely simple:

### **Laboratory Overview**

> See active verification work, pending approvals and current traceability status.

Right:

```text
● Operational
```

Not:

```text
Good morning, Shashi 👋
Here's what is happening...
```

That would make it feel like a consumer SaaS product rather than laboratory software.

---

# 5. KPI cards

Use four cards only.

### 01 Active Verifications

```text
ACTIVE VERIFICATIONS

12
sessions

+3 today
```

### 02 Pending Director Sign-Off

```text
PENDING DIRECTOR SIGN-OFF

3
sessions

2 ready today
```

### 03 Pass Rate

```text
24H PASS RATE

94.2%

last 24 hours
```

### 04 Traceability

```text
TRACEABILITY

100%

All standard sets valid
```

The source uses this exact high-level KPI concept. `Pasted markdown(20261004-065148).md`

---

# 6. Don't make KPI cards clickable by default

The entire card shouldn't behave like a giant button.

Instead:

```text
12 Sessions

[ View Active Sessions → ]
```

This preserves hierarchy.

---

# 7. Recent Sessions

This should be the **main content area**.

Columns:

```text id="lln9fh"
SESSION
INSTRUMENT
CLASS
PROGRESS
STATUS
NEXT ACTION
```

Example:

```text
AV-2026-8812
ZM201 Retail Platform
Class III
5 / 7
IN TESTING
Continue →

MT-2026-0049
XPR Analytical Micro-Balance
Class I
7 / 7
PENDING REVIEW
Review →

SN-2026-3391
GoldMaster-6K
Class II
7 / 7
APPROVED
View Certificate →
```

The source's Active Tests workspace explicitly centers cards around serial number, model, class, progress and resume action. `Pasted markdown(20261004-065148).md`

---

# 8. "Next Action" is more valuable than "Actions"

Don't make this:

```text
•••
```

or:

```text
View | Edit | Delete
```

Instead:

```text
Continue →
Review →
Resolve Issue →
View Certificate →
```

This reinforces the workflow mental model.

---

# 9. Compliance visualization

Keep the source's compliance donut, but make it secondary. `Pasted markdown(20261004-065148).md`

```text
COMPLIANCE OVERVIEW

       PASS
       18

    ╭────────╮
   ╱          ╲
  │            │
   ╲          ╱
    ╰────────╯

Warning   2
Fail      1
```

The center can show:

```text
94%
Overall Pass
```

But don't let the chart dominate the homepage.

---

# 10. Quick Start

This should be one of the strongest interactions on Home.

```text
QUICK START

Start a verification with a realistic instrument preset.

┌──────────────────┐
│ ⚖                │
│ Avery Class III  │
│ Retail Platform  │
│                  │
│ [ Start → ]      │
└──────────────────┘
```

Four supplied presets should be available. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 11. Preset card information

Don't put every technical property on the card.

Show:

```text
Avery Class III
ZM201 Retail Platform

30 kg Max
5 g e
Class III

[ Start Verification ]
```

When clicked:

```text
preset loaded
       ↓
instrument prefilled
       ↓
new session created
       ↓
session overview
```

The source explicitly calls for one-click preset loading and immediate form population. `Pasted markdown(20261004-065148).md`

---

# 12. SESSIONS PAGE

The Sessions page has one purpose:

> **Help the operator find the correct verification and continue it quickly.**

---

# 13. Sessions layout

```text id="l9j1lh"
SESSIONS

Verification work currently in progress
and recently completed.

[ Search serial / model... ] [ Status ▾ ] [ Class ▾ ] [ Stage ▾ ]

12 active sessions

┌───────────────────────────────────────────────────────────────────────────┐
│ INSTRUMENT       SESSION         PROGRESS       STATUS        NEXT         │
├───────────────────────────────────────────────────────────────────────────┤
│ ZM201             AV-2026-8812    5 / 7          Testing       Continue → │
│ XPR Balance       MT-2026-0049    7 / 7          Review        Review →   │
│ GoldMaster        SN-2026-3391    7 / 7          Approved      Certificate│
└───────────────────────────────────────────────────────────────────────────┘
```

---

# 14. Filter design

Don't create a giant filter panel.

Top row:

```text
Search
Status
Accuracy Class
Verification Stage
```

Everything else can be in:

```text
[ More Filters ]
```

---

# 15. Status filters

Use:

```text
All
In Testing
Pending Review
Remanded
Approved
```

These correspond to the defined review states. `Pasted markdown(20261004-065148).md`

---

# 16. Session status presentation

Use:

```text
● IN TESTING
● PENDING REVIEW
● REMANDED
✓ APPROVED
```

Don't write:

```text
status_code: IN_TESTING
```

User-facing labels should remain human-readable.

---

# 17. Session cards vs table

Desktop:

**Table**

because the user is comparing many sessions.

Tablet/mobile:

**Cards**

Example mobile:

```text
┌──────────────────────────────┐
│ ZM201 Retail Platform        │
│ AV-2026-8812                │
│                              │
│ CLASS III                    │
│                              │
│ 5 / 7 steps complete         │
│ ████████████░░░              │
│                              │
│ ● IN TESTING                 │
│                              │
│ [ Continue Testing → ]       │
└──────────────────────────────┘
```

---

# 18. Session row interaction

Clicking the row should open:

```text
/session/AV-2026-8812/overview
```

Not a random details modal.

A session is important enough to deserve its own workspace.

---

# 19. Session Overview

This becomes the bridge between Sessions and the testing workflow.

```text id="us3cvk"
AV-2026-8812

Avery Weigh-Tronix ZM201 Retail Platform

CLASS III
IN TESTING

┌──────────────────────────────────────────────────────────────┐
│ PROGRESS                                                     │
│                                                              │
│ ✓ Physical                                                   │
│ ✓ Weighing                                                   │
│ ● Eccentricity                                               │
│ ○ Repeatability                                              │
│ ○ Environment                                                │
└──────────────────────────────────────────────────────────────┘

RESULT SO FAR

PASS
No blocking compliance findings.

NEXT ACTION

Complete Eccentricity Test

[ Continue → ]
```

---

# 20. Session overview identity

Show:

```text
Manufacturer
Model
Serial
Accuracy Class
Max
Min
e
d
Verification Stage
```

But organize them.

Don't make this:

```text
30 tiny metadata chips
```

Better:

```text
INSTRUMENT
Avery Weigh-Tronix
ZM201 Retail Platform

METROLOGICAL PROFILE
Class III
Max 30 kg
Min 0.1 kg
e 0.005 kg
d 0.005 kg
```

---

# 21. Progress visualization

Use:

```text
5 / 7
```

plus the stepper.

Never use only a circular percentage.

The source emphasizes explicit step progress throughout the testing workflow. `Pasted markdown(20261004-065148).md`

---

# 22. Current-result summary

At the top right:

```text
CURRENT RESULT

PASS

5 / 5 completed procedures
within evaluated tolerance
```

or:

```text
CURRENT RESULT

PENDING

2 procedures remaining
```

or:

```text
CURRENT RESULT

FAIL

1 statutory test exceeds limit
```

The wording should depend on actual session state.

---

# 23. INSTRUMENTS PAGE

This is separate from Sessions.

Mental model:

```text
Sessions
= verification work

Instruments
= physical devices registered in laboratory
```

---

# 24. Instruments layout

```text id="kn5g6d"
INSTRUMENTS

Registered weighing instruments

[ Search model / serial... ]         [ + Register Instrument ]

──────────────────────────────────────────────────────────────

MODEL                     SERIAL         CLASS      STATUS
ZM201 Retail Platform     AV-2026-8812   III        In Testing
XPR Micro-Balance         MT-2026-0049   I          Review
GoldMaster-6K             SN-2026-3391   II         Approved
DS-215 Heavy Platform     ET-2026-9041   IIII       In Testing
```

---

# 25. Instrument detail drawer

Click an instrument:

```text
INSTRUMENT

Avery Weigh-Tronix
ZM201 Retail Platform

Serial
AV-2026-8812

Class
III

Max
30 kg

e
0.005 kg

Firmware
v2.4.1

Verification History
3 sessions

[ Open Current Session ]
[ Start New Verification ]
```

This avoids routing for every tiny inspection.

---

# 26. Register Instrument

Primary action:

```text
+ Register Instrument
```

Then enter the screen we already designed.

---

# 27. INSTRUMENT REGISTRATION - final architecture

The source explicitly recommends four modular cards:

```text id="s6vbpf"
01 Nameplate / OCR

02 Identification

03 Metrological Specifications

04 Statutory Photo Dossier
```

with four one-click presets. `Pasted markdown(20261004-065148).md`

So keep that structure.

---

# 28. Top of registration

```text
REGISTER INSTRUMENT

Enter the instrument details needed
to create a verification session.

QUICK START

[ Avery Class III ]
[ Mettler Class I ]
[ Sansui Class II ]
[ Essae Class IIII ]
```

---

# 29. OCR card

```text
NAMEPLATE / DOCUMENT

┌─────────────────────────────────────┐
│                                     │
│       Drop nameplate image          │
│                                     │
│      JPG, PNG up to 10 MB            │
│                                     │
│            [ Browse ]                │
│                                     │
└─────────────────────────────────────┘
```

After OCR:

```text
OCR COMPLETE
94.2% extraction confidence

Manufacturer
Avery Weigh-Tronix

Model
ZM201

Serial
AV-2026-8812

[ Review Extracted Data ]
```

The source specifically defines an OCR dropzone, confidence indicator and Apply OCR Data interaction. `Pasted markdown(20261004-065148).md`

---

# 30. Identification card

```text
IDENTIFICATION

Manufacturer
[ Avery Weigh-Tronix ]

Model Name
[ ZM201 Retail Platform ]

Serial Number
[ AV-2026-8812 ]

Approval Number
[ TAC-2026-III-0142 ]
```

Exactly four fields.

---

# 31. Metrological specifications

Use a clean layout:

```text
METROLOGICAL SPECIFICATIONS

Accuracy Class
[ Class I ] [ Class II ] [ Class III ] [ Class IIII ]

Maximum Capacity
[ 30.000 ] kg

Minimum Capacity
[ 0.100 ] kg

Verification Scale Interval
[ 0.005 ] kg

Actual Scale Interval
[ 0.005 ] kg
```

---

# 32. Validator

Under it:

```text
SPECIFICATION CHECK

n = 6,000
✓ Consistent with entered Max / e relationship

Class
CLASS III

Verification Stage
INITIAL TYPE APPROVAL

● Specification appears valid
```

The source specifically calls for a live validator around `n = Max/e` and related values. `Pasted markdown(20261004-065148).md`

---

# 33. Avoid exposing raw mathematical variables

Don't make the main UI say:

```text
n
e
d
nmin
nmax
```

Instead:

```text
Scale Divisions
6,000

Verification Interval
0.005 kg
```

Technical labels can appear in a small details area.

This follows the source's explicit "visual clarity over jargon" rule. `Pasted markdown(20261004-065148).md`

---

# 34. Photo dossier

Use five slots:

```text
NAMEPLATE
FRONT VIEW
SEALING POINT
LEVEL BUBBLE
DOC / SPECIFICATION
```

The five categories are explicitly defined in the source. `Pasted markdown(20261004-065148).md`

Visually:

```text
┌────────────┐ ┌────────────┐ ┌────────────┐
│            │ │            │ │            │
│ NAMEPLATE  │ │ FRONT VIEW │ │ SEAL POINT │
│     ✓      │ │     ✓      │ │     +      │
└────────────┘ └────────────┘ └────────────┘

┌────────────┐ ┌────────────┐
│            │ │            │
│LEVEL BUBBLE│ │ DOC / SPEC │
│     +      │ │     ✓      │
└────────────┘ └────────────┘
```

---

# 35. Registration footer

Don't make this a giant button.

Use sticky footer:

```text
────────────────────────────────────────────────────────────────

4 / 4 required sections complete

[ Save Draft ]          [ Register & Create Session → ]
```

When incomplete:

```text
[ Register & Create Session → ]
```

disabled with explanation:

```text
2 required items remaining
```

---

# 36. Important flow decision

The button should say:

**Register & Create Session →**

rather than:

**Register Instrument & Begin Testing →**

because **registration doesn't mean testing has started**.

The resulting flow should be:

```text
Register
   ↓
Session created
   ↓
Session Overview
   ↓
Readiness
   ↓
Test Plan
   ↓
Start Testing
```

This prevents the user from entering the OIML procedure sequence prematurely.

---

# 37. Instrument registration from Home preset

For a one-click demo:

```text
Home
 ↓
Avery Class III
 ↓
Create Session
 ↓
Session Overview
```

No typing.

This is the fastest judge demo path.

The source specifically requires one-click realistic presets so users can demonstrate the system without manual data entry. `Pasted markdown(20261004-065148).md`

---

# 38. New session creation modal

For manual registration, after pressing Create:

```text
CREATING VERIFICATION SESSION...

Instrument
Avery ZM201

Verification Stage
Initial Type Approval

Standard Set
F1-2026-018
✓ Valid

[ Create Session ]
```

Don't ask the user to fill another giant form.

---

# 39. Session creation result

Immediately navigate:

```text
/session/:id/overview
```

and show:

```text
✓ Verification session created

Session
VS-2026-00184

Next:
Complete precondition checks.
```

Toast + page context.

---

# 40. Realistic dummy session list

Seed enough sessions so the application doesn't look empty.

Example:

```text
VS-2026-00184  Avery ZM201       IN_TESTING
VS-2026-00183  Mettler XPR       PENDING_REVIEW
VS-2026-00182  Sansui GoldMaster APPROVED
VS-2026-00181  Essae DS-215      REMANDED
VS-2026-00180  Avery ZM201       APPROVED
VS-2026-00179  Mettler XPR       IN_TESTING
```

Use coherent underlying states.

Don't randomly assign statuses.

---

# 41. Session progress examples

```text
AV-00184
5 / 7
```

means:

```text
Physical       ✓
Weighing       ✓
Eccentricity   ✓
Repeatability  ✓
Environment    ●
Review         ○
Certificate    ○
```

The exact step semantics should remain consistent with the workflow.

---

# 42. Role-aware Home

For Metrologist:

```text
ACTIVE VERIFICATIONS
Continue testing
```

For Reviewer:

```text
PENDING REVIEW
3 sessions
```

For Director:

```text
AWAITING SIGN-OFF
3 sessions
```

For Auditor:

```text
AUDIT ACTIVITY
Recent immutable records
```

For Admin:

```text
LAB STATUS
Standards
Users
Configuration
```

This should be computed from role rather than making five different home pages.

The source explicitly defines role-specific capabilities. `Pasted markdown(20261004-065148).md`

---

# 43. Home should not expose technical metrology

Do not put:

```text
P = I + 0.5e - ΔL
```

on Home.

That's for Weighing.

Home answers:

```text
What is happening?
What needs attention?
What should I open?
```

---

# 44. Loading and empty states

### No sessions

```text
NO ACTIVE VERIFICATIONS

There are no verification sessions
currently in progress.

[ Register Instrument ]
```

### Loading sessions

Skeleton table.

### Search with no match

```text
NO MATCHING SESSIONS

Try another serial number,
model or status filter.

[ Clear Filters ]
```

---

# 45. Home notification strip

One small operational strip can be useful:

```text
⚠ 1 standard weight set expires in 6 days
   [ Review Standards ]
```

This is much better than another KPI card.

---

# 46. Instrument validation error

When entering:

```text
Max = 30 kg
e = 0.05 kg
```

show:

```text
✕ Specification check failed

The entered interval/capacity combination
requires review before this instrument can
be registered.

[ Inspect Specification ]
```

Don't merely show red input borders.

---

# 47. Phase 4 implementation structure

```text id="9r4g8o"
features/
│
├── dashboard/
│   ├── HomePage.tsx
│   ├── DashboardMetrics.tsx
│   ├── RecentSessions.tsx
│   ├── ComplianceOverview.tsx
│   └── QuickStartPresets.tsx
│
├── sessions/
│   ├── SessionsPage.tsx
│   ├── SessionFilters.tsx
│   ├── SessionsTable.tsx
│   └── SessionOverview.tsx
│
└── instruments/
    ├── InstrumentsPage.tsx
    ├── InstrumentTable.tsx
    ├── InstrumentDetailsDrawer.tsx
    ├── InstrumentIntakeForm.tsx
    ├── PresetSelector.tsx
    ├── NameplateUploader.tsx
    ├── SpecificationValidator.tsx
    └── PhotoDossier.tsx
```

---

# 48. Important shared dependencies

These pages should use:

```text
SessionRepository
InstrumentRepository
LabContext
ScenarioContext
Permission engine
Status engine
Next-action selector
```

They should **not** create their own data.

---

# 49. Phase 4 coding prompt

Paste this after Phase 3 is working:

```text id="qpnv0v"
PHASE 4 - HOME, SESSIONS AND INSTRUMENT WORKSPACE

The design system, application shell and domain/session state
architecture are complete.

Now implement the first real operational workflow.

Do not redesign the shell.

Do not create isolated mock data.

Use the existing repositories, session state,
permissions and shared UI components.

==================================================
1. HOME
==================================================

Create:

HomePage
DashboardMetrics
RecentSessions
ComplianceOverview
QuickStartPresets

Home must answer:

What is happening in the laboratory?
What needs attention?
What should I work on next?

Top KPIs:

Active Verifications
Pending Director Sign-Off
24h Pass Rate
Traceability Status

Then:

Recent Verification Sessions

Then:

Compliance Overview

Then:

Quick Start Instrument Presets

Keep the page calm and operational.

Do not turn every piece of information into a card.

==================================================
2. QUICK START
==================================================

Use the four supplied instruments:

Avery Class III Retail
Mettler Class I Analytical
Sansui Class II Gold
Essae Class IIII Industrial

Clicking a preset must:

load instrument
create coherent verification session
persist session
navigate to session overview

Do not require manual typing for the demo path.

==================================================
3. SESSIONS
==================================================

Create:

SessionsPage
SessionFilters
SessionsTable

Support:

search
status
accuracy class
verification stage

Statuses:

DRAFT
IN_TESTING
PENDING_REVIEW
REMANDED
APPROVED

Each row should show:

instrument
serial
class
progress
status
next action

Do not use generic "View/Edit/Delete"
actions unless genuinely necessary.

Prefer:

Continue
Review
Resolve Issue
Certificate

==================================================
4. SESSION OVERVIEW
==================================================

Build a coherent overview for:

/session/:sessionId/overview

Show:

instrument identity
metrological profile
verification stage
current session status
progress
test procedure states
current result
next action

The overview must consume the actual VerificationSession.

Do not create local fake progress.

==================================================
5. INSTRUMENTS
==================================================

Create:

InstrumentsPage
InstrumentTable
InstrumentDetailsDrawer

Show:

manufacturer
model
serial
accuracy class
current verification status

Clicking an instrument opens details.

Provide:

Open Current Session
Start New Verification

==================================================
6. REGISTRATION
==================================================

Build the Instrument Intake workflow.

Use four modular cards:

1. Nameplate / OCR
2. Identification
3. Metrological Specifications
4. Statutory Photo Dossier

Do not create a monolithic form.

==================================================
7. PRESETS
==================================================

Top of intake:

Avery Class III
Mettler Class I
Sansui Class II
Essae Class IIII

One click must populate all appropriate fields.

==================================================
8. OCR
==================================================

Implement a frontend demo OCR flow.

Show:

upload
processing
confidence
extracted fields
Apply OCR Data

If actual OCR backend is unavailable,
use deterministic demo extraction.

Clearly mark simulated OCR if necessary.

==================================================
9. SPECIFICATION VALIDATION
==================================================

Create SpecificationValidator.

Show a human-friendly result.

Example:

Scale Divisions
6,000

Verification Interval
0.005 kg

● Specification Check Passed

Technical values may be shown secondarily.

Do not expose raw variable names as primary labels.

==================================================
10. PHOTO DOSSIER
==================================================

Support the five categories:

NAMEPLATE
FRONT_VIEW
SEALING_POINT
LEVEL_BUBBLE
DOC_SPEC

Use thumbnails.

Click thumbnail:
open image viewer modal.

==================================================
11. CREATE SESSION
==================================================

After successful registration:

Register Instrument
    ↓
Create Verification Session
    ↓
Session Overview

Do NOT immediately start the OIML test procedure.

Session Overview should lead to:

Readiness

==================================================
12. FORM VALIDATION
==================================================

All forms require:

inline errors
clear messages
units
loading
success
disabled
read-only

No generic:
"Invalid input"

Instead explain:
what is wrong
what to fix

==================================================
13. ROLE AWARENESS
==================================================

Home and session actions must respect role.

METROLOGIST:
register and test

REVIEWER:
review pending sessions

DIRECTOR:
sign eligible sessions

AUDITOR:
read-only

ADMIN:
system configuration

Do not duplicate permission logic.

Use the centralized permission engine.

==================================================
14. REALISTIC DATA
==================================================

Seed enough sessions that the UI never feels empty.

Use coherent statuses and progress.

Avoid random fake values.

Instrument state and session state must agree.

==================================================
15. RESPONSIVE
==================================================

Desktop:
session table

Mobile:
session cards

Desktop:
registration two-column where useful

Mobile:
stack cards

Do not shrink dense layouts until unreadable.

==================================================
16. EMPTY STATES
==================================================

Provide useful empty states.

Examples:

No active sessions
No instruments
No search results

Each must explain:
what is missing
what the user can do

==================================================
17. FINAL USER FLOW
==================================================

Test this exact path:

HOME
↓
click Avery Class III preset
↓
create session
↓
SESSION OVERVIEW
↓
READINESS

Also test:

HOME
↓
SESSIONS
↓
search AV-2026-8812
↓
open session
↓
continue testing

Also test:

INSTRUMENTS
↓
open instrument
↓
view current session

==================================================
18. QUALITY RULE
==================================================

Do not allow:
generic SaaS wording
giant cards
random gradients
unnecessary charts
excessive badges
duplicated UI
fake buttons
unexplained disabled controls

The result should feel like one serious laboratory application.

Do not proceed to the OIML testing pages until:
Home
Sessions
Instruments
Registration
and Session Overview
are fully connected and stable.
```

---

# 50. Phase 4 success test

The application should now support this **entire chain without breaking context**:

```text
HOME
   ↓
Avery Class III preset
   ↓
CREATE SESSION
   ↓
SESSION OVERVIEW
   ↓
READINESS
```

And separately:

```text
HOME
   ↓
SESSIONS
   ↓
Search AV-2026-8812
   ↓
Open
   ↓
Same Session Overview
```

And:

```text
INSTRUMENTS
   ↓
Avery ZM201
   ↓
Current Session
   ↓
Same Session
```

That proves the three major domain objects are actually connected:

```text
LABORATORY
     │
     ▼
INSTRUMENT
     │
     ▼
VERIFICATION SESSION
```

Once this works, **Phase 5 is the real heart of the product: READINESS → TEST PLAN → PHYSICAL INSPECTION → WEIGHING → ECCENTRICITY → REPEATABILITY → ENVIRONMENT.** That is where METROLOGIX-76 visibly starts replacing the traditional spreadsheet workflow with the guided OIML process described in your specification. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:56:34 PM

next

## Response:
10/4/2026, 6:56:42 PM · gpt-5-6-t-mini

> **Developed Phase 5 blueprint and readiness plan**
>
> 
>
> Worked for 5s

# PHASE 5 - THE OIML TESTING WORKFLOW

Now we reach the **core of METROLOGIX-76**.

Everything built so far prepares the user to get here:

```text
Home
  ↓
Sessions
  ↓
Instrument
  ↓
Session Overview
  ↓
Readiness
  ↓
Test Plan
  ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      OIML TEST WORKFLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ↓
Physical Inspection
  ↓
Weighing
  ↓
Eccentricity
  ↓
Repeatability
  ↓
Environment / Tare
  ↓
Review
```

The source explicitly defines the seven-step workflow and the detailed visual requirements for the physical, weighing, eccentricity, repeatability and environmental screens. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

The most important thing in this phase:

> **The operator should never feel like they are filling forms. They should feel like they are performing a guided verification procedure.**

---

# 1. PHASE 5 ARCHITECTURE

Build these screens in this order:

```text id="2x7jba"
01 Test Readiness
        ↓
02 Test Plan
        ↓
03 Physical & Visual Inspection
        ↓
04 Weighing Error & Linearity
        ↓
05 Eccentricity
        ↓
06 Repeatability
        ↓
07 Environmental Drift & Tare
```

Do not build Review yet.

Review comes after these procedures are complete.

---

# 2. MASTER TEST-SCREEN LAYOUT

Every test page should use the same structure:

```text id="8brv4e"
┌───────────────────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER                                                              │
├───────────────┬───────────────────────────────────────────────────────────┤
│ SESSION        │ SESSION HEADER                                            │
│ SIDEBAR        │ Instrument + Class + Max/Min/e/d + Traceability          │
│               ├───────────────────────────────────────────────────────────┤
│ ✓ Overview    │                                                           │
│ ✓ Readiness   │ TEST HEADER                                               │
│ ✓ Test Plan   │ What are we testing?                                      │
│ ● Weighing    │ What is the current result?                               │
│ ○ Eccentricity│                                                           │
│ ○ Repeatability│ CONTENT                                                 │
│ ○ Environment │                                                           │
│               │                                                           │
│               ├───────────────────────────────────────────────────────────┤
│               │ Previous             Save            Next →               │
└───────────────┴───────────────────────────────────────────────────────────┘
```

The shell remains stable.

Only the test content changes.

---

# 3. TEST PAGE HEADER

Every procedure begins with:

### **What are we checking?**

Then one sentence.

Example:

> **Weighing Accuracy**  
> Evaluate the scale's indication against known test loads.

Then show:

```text id="ksw1i4"
STATUS
● IN PROGRESS

RESULT
PASS so far

PROGRESS
8 / 10 observations
```

Never start a page with a huge technical paragraph.

---

# 4. READINESS → TEST PLAN

Before testing starts:

```text id="0oj4qz"
READINESS
✓ Ready

TEST PLAN
5 procedures required

START TESTING →
```

The Test Scope Matrix is explicitly described as mapping statutory tests against instrument class and verification stage. `Pasted markdown(20261004-065148).md`

---

# 5. TEST PLAN SCREEN

This is the final planning screen before physical testing.

### Header

**Test Plan**

> Confirm which verification procedures apply to this instrument.

---

# 6. Test-plan layout

```text id="c2uif8"
TEST PLAN

Instrument
Avery ZM201 Retail Platform

Class
CLASS III

Verification Stage
INITIAL TYPE APPROVAL

REQUIRED PROCEDURES

┌──────────────────────────────────────────────────────────────┐
│ ✓  Physical & Visual Inspection             REQUIRED         │
│    Inspect construction, level and securing features        │
│                                                              │
│ ✓  Weighing Accuracy                          REQUIRED         │
│    Ascending + descending observations                     │
│                                                              │
│ ✓  Eccentricity                               REQUIRED         │
│    Corner / platform loading                               │
│                                                              │
│ ✓  Repeatability                              REQUIRED         │
│    Repeated observations                                    │
│                                                              │
│ ✓  Environmental / Tare                       REQUIRED         │
│    Environmental and tare checks                            │
└──────────────────────────────────────────────────────────────┘

5 required procedures
0 optional

[ Continue to Readiness → ]
```

Do not show an intimidating matrix with dozens of cells unless the user explicitly opens the technical view.

---

# 7. TEST-PLAN DETAIL DRAWER

For a technically trained reviewer:

```text id="o7jv6k"
ⓘ Procedure basis

Procedure:
Weighing Accuracy

Applicable because:
Class III
Initial Type Approval

Technical reference:
[ technical detail ]

[ Close ]
```

Progressive disclosure is one of the key source principles. `Pasted markdown(20261004-065148).md`

---

# 8. PHYSICAL & VISUAL INSPECTION

This is the first real procedure.

The source calls for:

- live optical camera/photo inspector
- spirit-level bubble
- seal integrity checklist
- physical/security inspection `Pasted markdown(20261004-065148).md`

---

# 9. Physical inspection screen

```text id="9sxzq2"
PHYSICAL & VISUAL INSPECTION

Confirm the instrument is physically fit for verification.

┌─────────────────────────────────────┬──────────────────────────────┐
│ INSPECTION EVIDENCE                 │ INSTRUMENT LEVEL              │
│                                     │                              │
│ [ large photo / camera area ]       │       ◯                     │
│                                     │      ●                      │
│                                     │                              │
│                                     │  Tilt: 0.18°                │
│                                     │  ✓ Within acceptable range   │
├─────────────────────────────────────┼──────────────────────────────┤
│ SECURITY / SEAL CHECK               │ INSPECTION SUMMARY            │
│                                     │                              │
│ ✓ Lead seal                         │ 6 / 6 checks complete        │
│ ✓ Holographic marking               │                              │
│ ✓ Calibration jumper                │ ● PASS                       │
│ ✓ Nameplate                          │                              │
└─────────────────────────────────────┴──────────────────────────────┘
```

---

# 10. Spirit-level visual

Make this one of the strongest visual moments.

```text id="kce23s"
          ┌──────────────┐
          │              │
          │      ●       │
          │              │
          └──────────────┘

              0.18°

        ✓ LEVEL ACCEPTABLE
```

When the bubble is centered:

```text id="d2y2bh"
● green
✓ PASS
```

When off-center:

```text id="r7e9ez"
● amber
⚠ ADJUST LEVEL
```

The source explicitly describes the centered bubble behavior and a tilt threshold of 0.5°. `Pasted markdown(20261004-065148).md`

---

# 11. Security checklist

Don't use 15 checkboxes.

Use grouped evidence:

```text id="1axkt6"
PHYSICAL INTEGRITY

Lead wire seal
✓ Intact

Tamper indicator
✓ Present

Calibration access
✓ Protected

Nameplate
✓ Legible
```

Each row can open details.

---

# 12. Physical inspection result

At bottom:

```text id="yq5g6a"
INSPECTION RESULT

✓ PASS

All required physical and visual checks completed.

[ Continue to Weighing → ]
```

If something fails:

```text id="o1hi3r"
✕ BLOCKED

Security seal inspection requires resolution
before weighing can begin.

[ Review Issue ]
```

---

# 13. WEIGHING - THE CENTERPIECE

This is one of the most important screens in the entire application.

The source calls for:

- verification-stage selector
- split/grid/chart layout
- ascending and descending series
- observation grid
- live capture
- calculation trace
- rounding-trap alert
- SVG Error Corridor chart `Pasted markdown(20261004-065148).md`

---

# 14. Weighing page hierarchy

Top:

```text id="kz5f5j"
WEIGHING ACCURACY

Current Result
PASS

12 / 16 observations recorded
```

Then:

```text id="q8v32w"
[ Split View ] [ Grid Only ] [ Chart Only ]

Verification Stage
[ Initial Type Approval ]
```

---

# 15. Ascending series

```text id="0j3nbe"
ASCENDING SERIES

Increasing test load

┌──────────────────────────────────────────────────────────────────────────┐
│ TARGET LOAD │ OBSERVED │ ERROR │ LIMIT       │ STATUS │ TRACE │         │
├──────────────────────────────────────────────────────────────────────────┤
│ 0.000 kg    │ 0.000     │ 0.0g  │ ±2.5g       │ ✓ PASS │ ⓘ     │         │
│ 5.000 kg    │ 5.002     │ +2.0g │ ±2.5g       │ ✓ PASS │ ⓘ     │         │
│ 10.000 kg   │ 10.004    │ +4.0g │ ±5.0g       │ ⚠ WARN │ ⓘ     │         │
└──────────────────────────────────────────────────────────────────────────┘
```

Use the source's human-friendly terminology: Target Load, Observed Reading, Calculated Error and Statutory Limit. `Pasted markdown(20261004-065148).md`

---

# 16. Live capture

Each row gets:

```text id="k5s3es"
[ Capture ]
```

When IoT is connected:

```text id="gr2rft"
⚖ 10.005 kg
● STABLE

[ Capture Live Weight ]
```

After capture:

```text id="x8r6mv"
✓ Captured
10.005 kg
```

The source explicitly defines a capture action where the active row receives the live weight. `Pasted markdown(20261004-065148).md`

---

# 17. Unstable scale behavior

If:

```text id="2f4wqs"
10.006 kg
● UNSTABLE
```

then:

```text id="rj4blb"
[ Capture Live Weight ]
```

must be disabled.

Tooltip:

> Reading is not stable. Wait for the scale to stabilize.

Do not allow accidental capture of unstable readings unless the domain/backend explicitly permits it.

---

# 18. Descending series

Keep it visually separate:

```text id="l4q8fj"
DESCENDING SERIES

Decreasing test load

Max → 0

[ observations ]
```

This helps the operator understand why there are two series.

The source explicitly requires separate ascending and descending series for the weighing workflow. `Pasted markdown(20261004-065148).md`

---

# 19. Calculation trace

Click:

```text id="x3w3n8"
ⓘ
```

Open:

```text id="t2z7ni"
CALCULATION TRACE

Target Load
10.000 kg

Observed Reading
10.005 kg

Verification interval
0.005 kg

Turning Point
P = I + 0.5e - ΔL

Calculated Error
P - L

Corrected Error
E - E₀

Legal Tolerance
±MPE

Final
✓ PASS
```

The source specifically requires this trace modal. `Pasted markdown(20261004-065148).md`

---

# 20. Error corridor visualization

This should be a signature visualization.

```text id="5cvcgy"
Calculated Error

 +MPE ─────────────────────────────

      •        •      •
        •  •
       •

  0   ─────────────────────────────

      •
         •      •

 -MPE ─────────────────────────────
```

The visualization should clearly communicate:

```text id="71bfsx"
inside corridor = okay
near boundary  = warning
outside        = fail
```

The source explicitly requires an interactive SVG Error Corridor chart. `Pasted markdown(20261004-065148).md`

---

# 21. Rounding Trap banner

Only when the scenario is active:

```text id="i0z1qt"
┌─────────────────────────────────────────────────────────────┐
│ ⚠ ROUNDING TRAP ACTIVE                                      │
│                                                             │
│ Legacy spreadsheet calculation:      PASS                   │
│ METROLOGIX-76 turning-point analysis: FAIL                  │
│                                                             │
│ Unrounded error: -5.3 g                                     │
│ Legal tolerance: ±5.0 g                                     │
│                                                             │
│ [ Inspect Why → ]                                           │
└─────────────────────────────────────────────────────────────┘
```

The source explicitly defines this as the core SIH demonstration. `Pasted markdown(20261004-065148).md`

This may be your **single strongest judge-facing interaction**.

---

# 22. Weighing completion footer

```text id="o9a9tf"
16 / 16 required observations

✓ All observations complete
✓ No unresolved flags

[ Continue to Eccentricity → ]
```

If incomplete:

```text id="fuxh5i"
12 / 16 observations

4 observations remaining

[ Continue Testing ]
```

---

# 23. ECCENTRICITY

The source calls for:

- 3-way platter geometry switch
- interactive SVG platter
- corner load points
- color transitions
- dynamic deflection vector
- summary with corner delta and verdict `Pasted markdown(20261004-065148).md`

---

# 24. Eccentricity layout

```text id="6hk2n1"
ECCENTRICITY

Corner loading and platform response

[ Square ] [ Round ] [ Rolling Load ]

┌───────────────────────────────────────┬───────────────────────────┐
│                                       │ TEST SUMMARY              │
│              ┌─────────┐              │                           │
│              │         │              │ Maximum deviation         │
│         ●────│         │────●         │ +4.2 g                    │
│              │    ●    │              │                           │
│         ●────│         │────●         │ Limit                     │
│              └─────────┘              │ ±5.0 g                    │
│                                       │                           │
│      interactive platter              │ ✓ PASS                   │
│                                       │                           │
└───────────────────────────────────────┴───────────────────────────┘
```

---

# 25. Color logic

Based on the source:

```text id="8ejt4s"
≤ 50% MPE
green

50-100% MPE
amber

> 100% MPE
crimson
```

`Pasted markdown(20261004-065148).md`

This makes the visual meaningful instead of decorative.

---

# 26. Corner interaction

Click Corner 4:

```text id="5xv8z5"
CORNER 4

Load
10.000 kg

Observed
9.9938 kg

Deviation
-6.2 g

Legal Limit
±5.0 g

✕ FAIL

[ Inspect Calculation ]
```

The source's synthetic eccentricity failure specifically uses Corner 4 with -6.2 g. `Pasted markdown(20261004-065148).md`

---

# 27. Deflection vector

Show:

```text id="6n9dr8"
        ↘
         ↘
          ↘

mechanical deflection
```

but don't make it giant.

Label:

> **Platform deflection**

The source explicitly specifies a 2D deflection vector arrow. `Pasted markdown(20261004-065148).md`

---

# 28. ECCENTRICITY result hierarchy

Top right:

```text id="75y4sa"
OVERALL RESULT

PASS

Maximum deviation
+4.2 g

Limit
±5.0 g

Margin
0.8 g
```

If failure:

```text id="8hs7f7"
FAIL

Corner 4 exceeds
the allowable limit.
```

The **reason** should be visible immediately.

---

# 29. REPEATABILITY

This screen should feel much simpler.

The source explicitly calls for the 10-reading sequence, scatter visualization and prominent spread summary. `Pasted markdown(20261004-065148).md`

---

# 30. Repeatability layout

```text id="6jkzcs"
REPEATABILITY

Confirm that repeated measurements remain
within the allowable spread.

LOAD

[ 0.5 Max ] [ 0.8 Max ] [ 1.0 Max ]

RESULT

┌─────────────────────────────────────┐
│ TOTAL OBSERVED SPREAD               │
│                                     │
│ 1.2 g                               │
│                                     │
│ Allowable limit                     │
│ 2.0 g                               │
│                                     │
│ ✓ PASS                              │
└─────────────────────────────────────┘
```

---

# 31. Ten readings

Below:

```text id="s0m1r7"
RUN    OBSERVED READING    STATUS
01     15.002 kg           ✓
02     15.001 kg           ✓
03     15.003 kg           ✓
...
10     15.002 kg           ✓
```

Don't make the operator visually parse ten rows to understand the outcome.

The summary is primary.

---

# 32. Scatter plot

```text id="n7j4mb"
Reading variation

      •    •
  •      •    •
       •
    •       •

───────────────
allowable band
```

Use a horizontal tolerance band.

---

# 33. Repeatability completion

```text id="jl8hge"
10 / 10 readings complete

Spread:
1.2 g

Limit:
2.0 g

✓ PASS

[ Continue to Environment → ]
```

---

# 34. ENVIRONMENT / TARE

The source defines three tabs:

```text id="5h4n0n"
Tare Accuracy
Temperature Drift
Chamber HUD
```

and the ambient environmental baseline:
temperature, humidity and atmospheric pressure. `Pasted markdown(20261004-065148).md`

---

# 35. Environment page

```text id="6jv55w"
ENVIRONMENT & TARE

Record environmental conditions and
evaluate tare / temperature response.

AMBIENT BASELINE

Temperature
20.4 °C

Relative Humidity
46 %

Pressure
1012 hPa
```

---

# 36. Tare Accuracy tab

```text id="m8x8l5"
TARE ACCURACY

Additive tare

Observed
...

Expected
...

Deviation
...

✓ PASS
```

Then:

```text
Subtractive tare
...
```

Keep the two procedures visually grouped.

---

# 37. Temperature Drift tab

Visual:

```text id="g5i7ff"
TEMPERATURE DRIFT

20°C ────── 40°C ────── -10°C ────── 20°C
 ●             ●             ●             ●
 PASS          PASS          WARN          PASS
```

The source defines the multi-temperature sequence `+20°C → +40°C → -10°C → +20°C`. `Pasted markdown(20261004-065148).md`

---

# 38. Thermal failure scenario

When active:

```text id="z6n6ul"
+20°C
✓ PASS

+40°C
✕ FAIL

Temperature-induced span shift
exceeds the configured acceptance criteria.
```

The source identifies this scenario as a thermal non-compliance case. `Pasted markdown(20261004-065148).md`

---

# 39. Chamber HUD

Make this look like laboratory monitoring software, not a gaming HUD.

```text id="j98wr0"
THERMAL CHAMBER

CURRENT
+39.8 °C

TARGET
+40.0 °C

SOAK
07:42

STATUS
● STABLE
```

Then:

```text id="2yj7ts"
Temperature
██████████████████░░
39.8 / 40.0 °C
```

The source specifically calls for a chamber HUD with live environmental monitoring and soak duration. `Pasted markdown(20261004-065148).md`

---

# 40. Environmental completion

```text id="9vv3nd"
ENVIRONMENTAL TEST RESULT

✓ PASS

Tare
PASS

Temperature Drift
PASS

Chamber Conditions
PASS

[ Complete Verification → ]
```

Or:

```text id="9zkqsa"
✕ FAIL

Temperature Drift
Exceeded allowed response.

[ Review Failure ]
```

---

# 41. Global test footer

Every testing page should have the same footer.

```text id="leofvg"
────────────────────────────────────────────────────────────────────

✓ Saved

[ ← Previous ]                       [ Next Test → ]
```

When blocked:

```text id="xhaxzn"
⚠ 2 required observations remaining

[ Continue Testing ]
```

Never make the operator guess what happens next.

---

# 42. Test completion behavior

When the last required procedure is complete:

```text id="xqj1r5"
ALL REQUIRED TESTS COMPLETE

5 / 5 procedures complete

Overall result
✓ PASS

Next:
Submit this verification for peer review.

[ Open Review Summary → ]
```

This is the transition point into Phase 6.

---

# 43. Important test-state rule

Never calculate overall result merely from:

```text id="tghf86"
number of green badges
```

Instead use the central session state.

Conceptually:

```text id="1l3g5h"
physical result
+
weighing result
+
eccentricity result
+
repeatability result
+
environment result
        ↓
session compliance
```

One failure should remain visible and traceable to the exact procedure.

---

# 44. Failure propagation

Example:

```text id="ykznly"
Eccentricity
✕ FAIL
```

Then overview:

```text id="0rx8fn"
OVERALL

✕ FAIL

1 procedure failed

Eccentricity
Corner 4 exceeds limit
```

Then Review:

```text
✕ FAIL
```

Then Certificate:

```text
NON-COMPLIANT
```

The failure must travel through the same session object.

---

# 45. Don't hide failures

Never show:

```text id="c4ifjy"
Overall:
PENDING
```

while one test clearly failed.

Instead:

```text id="9hr8y6"
FAIL

1 statutory test exceeded its configured limit.
```

The user should know immediately.

---

# 46. Cross-screen consistency

The same value:

```text id="du5quh"
Corner 4 = -6.2 g
```

must appear identically in:

```text
Eccentricity
Session Overview
Review
Audit
Certificate
```

Likewise:

```text id="kpe8v0"
Weighing:
-5.3 g
```

must remain:

```text
-5.3 g
```

everywhere.

No duplicate formatting logic.

---

# 47. Test components

Recommended structure:

```text id="2gucm1"
features/testing/

TestReadiness/
    TestReadinessView.tsx
    ReadinessChecklist.tsx

TestPlan/
    TestPlanView.tsx
    ProcedureMatrix.tsx

Physical/
    PhysicalInspectionView.tsx
    SpiritLevel.tsx
    SecurityChecklist.tsx
    InspectionEvidence.tsx

Weighing/
    WeighingView.tsx
    VerificationStageSelector.tsx
    ObservationGrid.tsx
    ObservationRow.tsx
    CalculationTraceModal.tsx
    ErrorCorridorChart.tsx
    RoundingTrapBanner.tsx

Eccentricity/
    EccentricityView.tsx
    GeometrySelector.tsx
    PlatterHeatmap.tsx
    EccentricitySummary.tsx

Repeatability/
    RepeatabilityView.tsx
    RepeatabilityTable.tsx
    RepeatabilityScatter.tsx
    SpreadSummary.tsx

Environment/
    EnvironmentView.tsx
    AmbientBaseline.tsx
    TareAccuracy.tsx
    TemperatureDrift.tsx
    ChamberHUD.tsx
```

---

# 48. Phase 5 implementation prompt

Paste this into your AI coding IDE:

```text id="kj5bmm"
PHASE 5 - OIML TESTING WORKFLOW

The global shell, design system, domain state,
repositories and Home/Sessions/Instrument workflow
are complete and stable.

Now implement the core guided verification workflow.

DO NOT redesign:
- AppShell
- Header
- Sidebar
- SessionSidebar
- design-system primitives
- domain/session architecture

Use the existing VerificationSession as the source of truth.

==================================================
1. TESTING WORKFLOW
==================================================

Implement in this order:

Test Readiness
↓
Test Plan
↓
Physical Inspection
↓
Weighing
↓
Eccentricity
↓
Repeatability
↓
Environment / Tare

Do not implement Review yet.

==================================================
2. TEST READINESS
==================================================

Show:
Instrument readiness
Traceability readiness
Test Plan readiness
Environment readiness

Overall:
READY
ATTENTION
BLOCKED

The screen must answer:
"Can testing start?"

Block testing when required prerequisites are not satisfied.

==================================================
3. TEST PLAN
==================================================

Show a clear list/matrix of applicable procedures based on
instrument class and verification stage.

Do not expose unnecessary technical complexity.

Make:
Applicable
Required
Not Applicable
Pending

visually distinct.

==================================================
4. PHYSICAL INSPECTION
==================================================

Implement:

photo/camera evidence
spirit-level indicator
security/seal checklist
inspection summary
PASS/BLOCKED result

Use the supplied design concept:
interactive spirit bubble
clear physical inspection evidence
progressive disclosure.

==================================================
5. WEIGHING
==================================================

Implement:

verification stage selector
ascending series
descending series
observation grid
live weight capture
calculation trace modal
Error Corridor SVG visualization
rounding trap banner

Columns:

Target Load
Observed Reading
Calculated Error
Legal Tolerance
Compliance
Inspect Trace

Use IBM Plex Mono for numerical readings.

Do not expose raw variable names as primary labels.

==================================================
6. LIVE SCALE
==================================================

Connect the existing IoTContext.

When:
currentWeight exists
AND
isStable === true

allow:
Capture Live Weight

Captured weight must update the actual
VerificationSession observation row.

Do not duplicate scale state inside WeighingView.

==================================================
7. CALCULATION TRACE
==================================================

Clicking Inspect Trace opens a modal/drawer.

Show:
input values
derived values
formula
final result
reference information already represented by the application

Do not make up statutory requirements.

==================================================
8. ROUNDING TRAP
==================================================

Only display when the active scenario is:

rounding_discrepancy_trap

Show clearly:

Legacy spreadsheet
PASS

METROLOGIX-76
FAIL

Unrounded error
-5.3 g

Tolerance
±5.0 g

Provide:
[ Inspect Why ]

==================================================
9. ECCENTRICITY
==================================================

Implement:

geometry selector:
Square
Round
Rolling Load

Interactive SVG platter

Load points

Deviation

Tolerance

Verdict

Use source-defined visualization states:
≤50% MPE
50-100% MPE
>100% MPE

Provide 2D deflection vector.

Support the supplied:
eccentricity_cantilever_twist

scenario.

Corner 4 should visibly show:
-6.2 g
FAIL

==================================================
10. REPEATABILITY
==================================================

Implement:

0.5 Max
0.8 Max
1.0 Max

10 sequential readings

Observed spread

Allowable limit

Overall verdict

Horizontal scatter visualization.

Make the spread summary the primary information.

==================================================
11. ENVIRONMENT
==================================================

Implement tabs:

Tare Accuracy
Temperature Drift
Chamber HUD

Ambient baseline:
temperature
humidity
pressure

Temperature sequence:

+20°C
+40°C
-10°C
+20°C

Connect the supplied:
temperature_span_drift_fail

scenario.

==================================================
12. PAGE STRUCTURE
==================================================

Every test page must use:

Page Header
Current Status
Primary Evidence
Supporting Data
Technical Detail
Persistent Test Footer

Every page must have:
- Save state
- Previous
- Next
- blocked state
- completed state
- failure state
- loading state
- empty state where relevant

==================================================
13. NEXT ACTION
==================================================

Every test screen must expose a clear next action.

Examples:

Complete inspection
Capture remaining observations
Review failing corner
Complete repeatability
Proceed to environment
Submit for review

Use centralized:
getNextBestAction(session)

==================================================
14. RESULT PROPAGATION
==================================================

All procedure results must update VerificationSession.

Example:

weighing FAIL
↓
session compliance reflects FAIL
↓
session overview reflects FAIL
↓
review reflects FAIL
↓
certificate reflects FAIL

No screen is allowed to invent a separate result.

==================================================
15. FAILURE VISIBILITY
==================================================

When a procedure fails:

Show:
overall result
failed procedure
reason
affected measurement
legal/configured limit
next action

Never hide a failure behind a tab.

==================================================
16. TRACEABILITY LOCK
==================================================

Use the central traceability state.

If standard weights are expired:
disable editable test inputs
show global lockout banner
allow navigation to Standards

Do not duplicate lockout logic.

==================================================
17. ROLE HANDLING
==================================================

METROLOGIST:
editable testing

REVIEWER:
read-only test values + comments later

DIRECTOR:
read-only test values + authorization later

AUDITOR:
read-only

ADMIN:
configuration

Do not remove important context merely because a user
cannot edit it.

==================================================
18. DEMO SCENARIOS
==================================================

The following scenarios must visibly affect the appropriate
screens:

standard_class_iii_retail
rounding_discrepancy_trap
temperature_span_drift_fail
eccentricity_cantilever_twist
high_interval_class_i_analytical

Use the same session state throughout the application.

==================================================
19. VISUAL DESIGN
==================================================

Testing pages should feel like:
precision engineering software

Not:
a form builder

Not:
a generic dashboard

Use:
large result hierarchy
clear visual evidence
technical detail on demand
restrained card usage
consistent spacing
consistent status language

==================================================
20. COMPLETE TESTING FLOW
==================================================

Verify:

Session Overview
↓
Readiness
↓
Test Plan
↓
Physical PASS
↓
Weighing PASS
↓
Eccentricity PASS
↓
Repeatability PASS
↓
Environment PASS
↓
ALL TESTS COMPLETE
↓
Open Review Summary

Then verify failure scenarios:

Rounding Trap
↓
FAIL

Temperature Drift
↓
FAIL

Eccentricity Corner 4
↓
FAIL

The same failure must remain consistent throughout session state.

==================================================
21. CRITICAL STOP CONDITION
==================================================

Do not proceed to Review implementation until:

- all five testing domains work
- one session carries their state
- navigation is coherent
- live capture works
- scenario data is synchronized
- pass/fail propagation works
- traceability lockout works
- read-only roles work
- mobile behavior works
- there are no duplicated calculations
- there are no isolated mock datasets
```

---

# 49. The most important visual trick in this phase

Every test page should have the same three-level hierarchy:

```text id="h0d2ub"
LEVEL 1
WHAT IS THE RESULT?

        ↓

LEVEL 2
WHAT EVIDENCE PRODUCED IT?

        ↓

LEVEL 3
HOW WAS IT CALCULATED?
```

For example:

```text
✕ FAIL
Corner 4 exceeds legal tolerance.

       ↓

Observed:
-6.2 g

Limit:
±5.0 g

       ↓

Calculation Trace
P = ...
E = ...
Ec = ...
```

That single pattern will make the technical application understandable to judges who aren't metrology specialists.

The source itself emphasizes replacing dense scientific notation with human-readable labels and using progressive disclosure for technical calculations. `Pasted markdown(20261004-065148).md`

---

# 50. Phase 5 success criterion

At the end of this phase, you should be able to demonstrate:

```text id="4utwld"
REGISTER SCALE
      ↓
READY
      ↓
TEST PLAN
      ↓
PHYSICAL
      ↓
WEIGHING
      ↓
ECCENTRICITY
      ↓
REPEATABILITY
      ↓
ENVIRONMENT
      ↓
COMPLETE
```

and then deliberately switch to:

```text id="ecnr7x"
ROUNDING TRAP
      ↓
LEGACY = PASS
      ↓
METROLOGIX = FAIL
```

or:

```text id="b3f0p6"
ECCENTRICITY SCENARIO
      ↓
CORNER 4
-6.2 g
      ↓
FAIL
```

At that point, the application will finally have the **core technical story** of the SIH problem statement-not just a beautiful frontend.

**Next phase: Review Pipeline + Director Sign-Off + Immutable Record**, where all of these test results are turned into a controlled approval workflow with reviewer comments, remand, Director PIN signing, SHA-256 digest, green seal, lock state and audit events. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 6:58:17 PM

next

## Response:
10/4/2026, 6:58:37 PM · gpt-5-6-t-mini

> **Reviewed audit and certification details**
>
> 
>
> Worked for a few seconds

# PHASE 6 - REVIEW → APPROVAL → DIGITAL SIGNATURE → IMMUTABLE RECORD

Now we build the **assurance layer**.

This is the point where the measurements collected in Phase 5 become a controlled, reviewable legal-metrology record.

The source explicitly defines a Review Pipeline with a searchable session queue, audit panel, row-level comments, remand with mandatory justification, Director PIN signing, statutory declaration, SHA-256 digest preview, Green Guilloche seal, and eMaap QR verification. It also defines the Cryptographic Audit Trail and Certificate Repository. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

The mental model is:

```text
TESTS COMPLETE
      ↓
REVIEW
      ↓
APPROVE / REMAND
      ↓
DIRECTOR AUTHORITY
      ↓
SIGN & STAMP
      ↓
IMMUTABLE RECORD
      ↓
CERTIFICATE
```

---

# 1. Phase 6 structure

Build in this order:

```text
01 Review Queue
        ↓
02 Session Review Workspace
        ↓
03 Row-Level Audit Comments
        ↓
04 Remand Workflow
        ↓
05 Reviewer Approval
        ↓
06 Director Sign Modal
        ↓
07 Green Guilloche Seal
        ↓
08 Immutable State
        ↓
09 Cryptographic Audit
        ↓
10 Certificate Repository
```

Do not build Reports first. The certificate should be the **result** of the approval process.

---

# 2. REVIEW PAGE - main mental model

The reviewer should immediately understand:

> **Which sessions need my attention?**

not:

> "Here is a giant database table."

---

# 3. Review page layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ REVIEW                                                                      │
│ Verification sessions requiring assurance review                            │
│                                                                              │
│ [ Search serial / session... ] [ Pending Review ▾ ]                         │
├───────────────────────────────┬──────────────────────────────────────────────┤
│ REVIEW QUEUE                  │ SELECTED SESSION                             │
│                               │                                              │
│ ● AV-2026-8812               │ Avery ZM201                                  │
│   Class III                   │ AV-2026-8812                                │
│   PASS • 7/7                  │                                              │
│                               │ ✓ Physical                                   │
│ ● MT-2026-0049               │ ✓ Weighing                                   │
│   Class I                     │ ✓ Eccentricity                              │
│   PASS • 7/7                  │ ✓ Repeatability                              │
│                               │ ✓ Environment                                │
│ ○ ET-2026-9041               │                                              │
│   Class IIII                 │ FINAL RESULT                                  │
│   REMANDED                    │                                              │
│                               │ ✓ PASS                                       │
│                               │                                              │
│                               │ [ Approve & Forward ]                        │
│                               │ [ Remand ]                                   │
└───────────────────────────────┴──────────────────────────────────────────────┘
```

The source explicitly specifies the left reviewer queue and right audit panel. `Pasted markdown(20261004-065148).md`

---

# 4. Review queue

Filters:

```text
Pending Review
In Testing
Approved
Remanded
```

The source explicitly names these statuses for the review queue. `Pasted markdown(20261004-065148).md`

Each item:

```text
Serial
Instrument
Class
Progress
Overall result
Submitted time
```

Example:

```text
AV-2026-8812
ZM201 Retail Platform
CLASS III

7 / 7 complete
✓ PASS

Submitted
04 Oct • 16:22
```

---

# 5. Queue hierarchy

Use:

```text
Serial number
↓
Instrument model
↓
Result
↓
Progress
```

Not:

```text
UUID
database ID
internal record key
```

Those can stay in technical details.

---

# 6. Selected session - audit summary

Top:

```text
AV-2026-8812
Avery Weigh-Tronix ZM201 Retail Platform

CLASS III
INITIAL TYPE APPROVAL

✓ All required tests complete
```

Then:

```text
TEST RESULTS

Physical Inspection     ✓ PASS
Weighing Accuracy       ✓ PASS
Eccentricity            ✓ PASS
Repeatability           ✓ PASS
Environment / Tare      ✓ PASS
```

This is much easier to audit than opening five different pages.

---

# 7. Result summary

Make this visually dominant:

```text
┌────────────────────────────────────┐
│ FINAL VERIFICATION RESULT          │
│                                    │
│ ✓ PASS                             │
│                                    │
│ All required procedures passed.    │
└────────────────────────────────────┘
```

For a failed session:

```text
┌────────────────────────────────────┐
│ FINAL VERIFICATION RESULT          │
│                                    │
│ ✕ FAIL                             │
│                                    │
│ Eccentricity - Corner 4 exceeds    │
│ the allowable limit.               │
└────────────────────────────────────┘
```

Never make reviewers hunt for the conclusion.

---

# 8. Exceptions panel

For a clean session:

```text
EXCEPTIONS
None
```

For a problematic session:

```text
EXCEPTIONS

1 Failure
1 Near-limit observation
2 Reviewer comments
```

Clicking opens detail.

---

# 9. Row-level audit comments

The source explicitly requires a slide-over drawer for row-level comments and defines comment severities:

```text
NOTE
FLAG
REJECT_REASON
```

`Pasted markdown(20261004-065148).md`

Click:

```text
ⓘ / ⚑
```

from an observation.

Open from the right:

```text
┌─────────────────────────────────────────────┐
│ AUDIT COMMENT                         ×     │
├─────────────────────────────────────────────┤
│ Weighing • Observation #14                  │
│                                             │
│ Target Load        10.000 kg                │
│ Observed Reading   10.005 kg                │
│ Error              +5.0 g                   │
│ Limit              ±5.0 g                   │
│                                             │
│ Severity                                    │
│ [ NOTE ] [ FLAG ] [ REJECT REASON ]        │
│                                             │
│ Comment                                     │
│ ┌─────────────────────────────────────────┐ │
│ │ Near tolerance boundary. Verify trace. │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [ Add Comment ]                             │
└─────────────────────────────────────────────┘
```

---

# 10. Pre-canned reviewer remarks

The source mentions quick remarks such as:

```text
Low Margin Warning
Hysteresis Reversal
```

`Pasted markdown(20261004-065148).md`

Add:

```text
Low Margin Warning
Hysteresis Reversal
Check Calibration Evidence
Observation Requires Clarification
Physical Evidence Incomplete
```

These are UX accelerators, not statutory conclusions.

---

# 11. Comment lifecycle

```text
Add comment
     ↓
visible on row
     ↓
audit timeline entry
     ↓
comment can be resolved later
```

The source's comment model includes:

```text
author
role
severity
createdAt
resolved
```

`Pasted markdown(20261004-065148).md`

---

# 12. Comment indicator on table

Rows with comments:

```text
10.000 kg     +4.2 g     ✓ PASS      💬
```

No comment:

```text
10.000 kg     +1.1 g     ✓ PASS
```

Click bubble → drawer.

---

# 13. REMAND WORKFLOW

This must be deliberately controlled.

Button:

```text
[ Remand Session ]
```

Modal:

```text
REMAND SESSION

Why does this verification need correction?

Reason
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
└─────────────────────────────────────────────┘

This reason will become part of
the verification audit history.

[ Cancel ] [ Remand to Operator ]
```

The source explicitly requires mandatory statutory justification for remand. `Pasted markdown(20261004-065148).md`

---

# 14. Remand result

After confirmation:

```text
REMANDED

Session returned to operator.

Reason:
"Corner 4 observation requires review."

[ Open Session ]
```

And session status becomes:

```text
REMANDED
```

The source defines `REMANDED` as a review status. `Pasted markdown(20261004-065148).md`

---

# 15. What remand must NOT do

Do not:

```text
delete previous data
```

Do not:

```text
overwrite the reviewer's reason
```

Do not:

```text
reset everything to blank
```

Instead:

```text
existing evidence
+
review history
+
remand reason
=
new editable testing state
```

Preserve history.

---

# 16. Reviewer approval

Button:

```text
Approve & Forward to Director →
```

Before action:

```text
REVIEW COMPLETE?

✓ All required tests complete
✓ No unresolved reject reasons
✓ Traceability valid
✓ Evidence present

[ Cancel ] [ Approve & Forward ]
```

Then:

```text
PENDING DIRECTOR SIGN-OFF
```

The source's reviewer journey explicitly ends with approval/forwarding or remand. `Pasted markdown(20261004-065148).md`

---

# 17. Director view

Now change role:

```text
DIRECTOR
```

Open:

```text
Review → Pending Director Sign-Off
```

The Director should see a cleaner authorization-focused view.

```text
STATUTORY SIGN-OFF

Avery ZM201
AV-2026-8812

Reviewer Recommendation
✓ APPROVED

Verification Result
✓ PASS

Audit Integrity
✓ Complete

Traceability
✓ Valid

[ Sign & Stamp Certificate ]
```

---

# 18. Director should not edit test evidence

The source explicitly requires Reviewer/Director observation inputs to be disabled. `Pasted markdown(20261004-065148).md`

So:

```text
Observed Reading
10.005 kg
🔒 Read-only
```

not:

```text
<input enabled>
```

---

# 19. Sign & Stamp button

Only Director:

```text
[ Sign & Stamp Certificate ]
```

Metrologist:

```text
[ 🔒 Sign & Stamp Certificate ]
```

and clicking it should produce the access-denied behavior specified by the source. `Pasted markdown(20261004-065148).md`

---

# 20. Director signing modal

This should be a **high-trust modal**.

```text
┌───────────────────────────────────────────────────────────────┐
│ SIGN & STAMP CERTIFICATE                                 ×    │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ VERIFICATION RECORD                                           │
│ AV-2026-8812                                                  │
│ Avery ZM201 • Class III                                      │
│                                                               │
│ Final Result                                                  │
│ ✓ PASS                                                        │
│                                                               │
│ STATUTORY DECLARATION                                         │
│ □ I confirm that this verification record has been reviewed   │
│   and is ready for statutory certification.                   │
│                                                               │
│ DIRECTOR AUTHORIZATION                                        │
│                                                               │
│ Enter 4-digit PIN                                             │
│                                                               │
│  ○  ○  ○  ○                                                  │
│                                                               │
│ [ Load Demo PIN ]                                             │
│                                                               │
│ RECORD DIGEST                                                 │
│ SHA-256                                                       │
│ 7f92...9a10                                                   │
│                                                               │
│ [ Cancel ]                     [ Sign & Stamp ]                │
└───────────────────────────────────────────────────────────────┘
```

The source explicitly defines the 4-digit PIN, demo PIN accelerator, declaration checkbox and SHA-256 digest preview. `Pasted markdown(20261004-065148).md`

---

# 21. Demo PIN

The source provides:

```text
Load Demo PIN
7620
```

Use that only in demo mode.

Clearly show:

```text
DEMO
```

near the accelerator.

Do not imply that `7620` is a production credential.

---

# 22. PIN behavior

Four inputs:

```text
○ ○ ○ ○
```

As digits are entered:

```text
● ● ○ ○
```

Invalid:

```text
✕ Invalid PIN
```

Correct:

```text
✓ PIN accepted
```

Then enable signing.

---

# 23. Declaration checkbox

The button remains disabled until:

```text
☐ declaration
```

becomes:

```text
☑ declaration
```

Helper:

> Required before statutory signing.

This makes the authorization sequence understandable.

---

# 24. SHA-256 digest

Show a truncated digest in the main modal:

```text
7f92 4d8a 02b1 ... e10c 9a10
```

Then:

```text
[ Copy Digest ]
[ View Full Digest ]
```

Full digest drawer:

```text
SHA-256 DIGEST

7f924d8a02b1...
...
e10c9a10
```

Use IBM Plex Mono.

The source explicitly requires a canonical SHA-256 digest preview. `Pasted markdown(20261004-065148).md`

---

# 25. Signing transition

Click:

```text
Sign & Stamp
```

show:

```text
Verifying authorization...
Generating record digest...
Applying statutory seal...
Finalizing certificate...
```

Then:

```text
✓ CERTIFICATE SIGNED
```

Do not make this take artificially long.

A short state transition is enough.

---

# 26. Green Guilloche Seal

This should be the signature visual moment.

```text
┌──────────────────────────────────┐
│                                  │
│          ╭──────────╮            │
│       ╭──│  VERIFIED │──╮         │
│      │   │    ✓      │   │        │
│       ╰──│  SEALED  │──╯         │
│          ╰──────────╯            │
│                                  │
│ Director                          │
│ Laboratory                        │
│ 04 Oct 2026 • 18:52              │
└──────────────────────────────────┘
```

The source explicitly specifies the Green Guilloche stamped seal with animated rosette watermark, verified badge, Director, laboratory, timestamp and QR code. `Pasted markdown(20261004-065148).md`

---

# 27. Don't make the seal cheesy

Avoid:

```text
giant spinning stamp
explosive animation
glow explosion
confetti
```

Instead:

```text
fine-line guilloche animation
subtle drawing-in effect
soft verification tick
```

Think **official security document**, not gaming achievement.

---

# 28. Certificate identity

After signing:

```text
CERTIFICATE

Certificate ID
CERT-2026-000184

Verification ID
VS-2026-00184

Instrument
AV-2026-8812

Result
✓ VERIFIED
```

---

# 29. QR verification

Show:

```text
┌───────────────┐
│ ▣ ▣ ▢ ▣ ▢ ▣  │
│ ▢ ▣ ▣ ▢ ▣ ▢  │
│ ▣ ▢ ▣ ▣ ▢ ▣  │
└───────────────┘

Verify on eMaap
[ Copy Verification Link ]
```

The source explicitly requires the eMaap verification QR and copyable verification URL. `Pasted markdown(20261004-065148).md`

---

# 30. IMMUTABLE STATE

Immediately after signing:

```text
APPROVED
🔒 IMMUTABLE RECORD
```

Header:

```text
CLASS III
AV-2026-8812

✓ APPROVED
🔒 IMMUTABLE
```

All inputs:

```text
disabled
```

Actions become:

```text
View Evidence
View Audit
View Certificate
Download
```

rather than:

```text
Edit
Save
```

The source explicitly requires permanently read-only approved sessions with a golden padlock. `Pasted markdown(20261004-065148).md`

---

# 31. Immutable session banner

At top of every approved session page:

```text
🔒 IMMUTABLE VERIFICATION RECORD

This verification was digitally approved
and can no longer be edited.

Approved by
A. Kumar - Laboratory Director

04 Oct 2026 • 18:52
```

Use golden/neutral lock treatment.

Do not make it bright red-the record is not failing.

---

# 32. Audit trail

Now the Audit page becomes much more meaningful.

Timeline:

```text
04 Oct 18:52
DIRECTOR
Certificate Signed
✓ SHA-256 generated

04 Oct 18:50
REVIEWER
Review Approved
✓ Forwarded to Director

04 Oct 18:46
METROLOGIST
Environment Completed
✓ PASS

04 Oct 18:39
METROLOGIST
Repeatability Completed
✓ PASS

04 Oct 18:31
METROLOGIST
Eccentricity Completed
✓ PASS

...
```

The source explicitly specifies a chronological immutable timeline. `Pasted markdown(20261004-065148).md`

---

# 33. Audit event card

Each event:

```text
┌────────────────────────────────────────────┐
│ ✓ Certificate Signed                       │
│                                            │
│ A. Kumar • DIRECTOR                        │
│ 04 Oct 2026 • 18:52:14                     │
│                                            │
│ SHA-256                                    │
│ 7f924d8a...e10c9a10                        │
│                                            │
│ [ View Event Details ]                     │
└────────────────────────────────────────────┘
```

Hash must use monospace.

---

# 34. Audit event detail

Click event:

```text
EVENT DETAILS

Action
Certificate Signed

Actor
A. Kumar

Role
DIRECTOR

Session
VS-2026-00184

Previous State
PENDING_REVIEW

New State
APPROVED

Digest
SHA-256 ...

Timestamp
...
```

No need for an enormous technical panel by default.

---

# 35. Audit integrity visualization

At the top:

```text
AUDIT INTEGRITY

✓ Chain intact

12 events
12 verified
0 inconsistencies
```

This is a UX summary.

Do not claim external cryptographic assurance that the frontend cannot actually provide.

---

# 36. Certificate repository

After approval:

```text
REPORTS

Search certificates
[ certificate / serial / model ]

[ English ] [ Hindi ] [ Bilingual ]
```

Then cards.

The source explicitly requires a searchable bilingual repository and these three output-language options. `Pasted markdown(20261004-065148).md`

---

# 37. Certificate card

```text
┌──────────────────────────────────────────────┐
│ ✓ VERIFIED                                   │
│                                              │
│ CERT-2026-000184                             │
│                                              │
│ Avery ZM201 Retail Platform                  │
│ AV-2026-8812                                 │
│ CLASS III                                    │
│                                              │
│ Director: A. Kumar                           │
│ 04 Oct 2026                                  │
│                                              │
│ [ PDF/A ] [ DOCX ] [ Verify ]                │
└──────────────────────────────────────────────┘
```

---

# 38. Language selector

Keep it prominent but small:

```text
[ English ] [ हिन्दी ] [ Bilingual ]
```

Bilingual preview:

```text
┌───────────────────────┬───────────────────────┐
│ ENGLISH               │ हिन्दी                │
│                       │                       │
│ Certificate           │ प्रमाणपत्र            │
│ Instrument             │ उपकरण                │
│ PASS                   │ उत्तीर्ण              │
└───────────────────────┴───────────────────────┘
```

The source explicitly calls for parallel bilingual presentation. `Pasted markdown(20261004-065148).md`

---

# 39. Certificate actions

The source requires:

```text
Download PDF/A
Download Word (.docx)
Verify on eMaap Portal
```

`Pasted markdown(20261004-065148).md`

Make:

```text
[ Download PDF/A ]
[ Download DOCX ]
[ Verify ]
```

the only major actions on each certificate.

---

# 40. Certificate preview

Click a certificate:

```text
┌──────────────────────────────────────────┐
│ CERTIFICATE PREVIEW                      │
│                                          │
│ [ official document preview ]            │
│                                          │
│           VERIFIED                       │
│                                          │
│ Certificate ID                           │
│ CERT-2026-000184                         │
│                                          │
│ Instrument details                       │
│                                          │
│ Test results                             │
│                                          │
│ Director signature / seal                │
│ QR                                       │
│                                          │
└──────────────────────────────────────────┘
```

Don't put the document preview behind a separate route unless necessary.

---

# 41. Failure certificate

Very important:

If the session failed, don't pretend the certificate is certified/pass.

Show:

```text
VERIFICATION RESULT

✕ NON-COMPLIANT

Reason:
Eccentricity - Corner 4 exceeded allowable limit.

Certificate status:
Verification record
```

The exact legal wording of final certificate outcomes should remain aligned to your backend/specification; don't invent statutory terminology.

---

# 42. Remanded session

The review UI should clearly distinguish:

```text
REMANDED
```

from:

```text
FAIL
```

They mean different things.

```text
REMANDED
= workflow needs correction/review

FAIL
= technical compliance result is unsuccessful
```

This distinction is important to preserve in your UI state model.

---

# 43. Audit trail and remand

When remanded:

```text
18:26
REVIEWER
Session Remanded

Reason:
"Corner 4 evidence requires verification."
```

Then later:

```text
18:41
METROLOGIST
Session Returned to Review

```

Never delete the earlier event.

---

# 44. Role flow for judges

This phase should support an excellent hackathon demonstration:

```text
METROLOGIST
     ↓
Complete tests
     ↓
Submit
     ↓

REVIEWER
     ↓
Open session
     ↓
Inspect evidence
     ↓
Add row comment
     ↓
Approve
     ↓

DIRECTOR
     ↓
Sign
     ↓
Green Guilloche Seal
     ↓
APPROVED / IMMUTABLE
     ↓

AUDITOR
     ↓
Audit Trail
     ↓
Certificate
```

The source explicitly defines these user journeys and role-specific capabilities. `Pasted markdown(20261004-065148).md`

---

# 45. Phase 6 state transitions

```text
IN_TESTING
     ↓
SUBMIT_FOR_REVIEW
     ↓
PENDING_REVIEW

PENDING_REVIEW
     ├── REMAND
     │     ↓
     │  REMANDED
     │     ↓
     │  IN_TESTING
     │
     └── APPROVE
           ↓
    PENDING_DIRECTOR_SIGN_OFF
           ↓
       SIGN
           ↓
       APPROVED
           ↓
      IMMUTABLE
```

You can represent Director-pending state with your existing review/status architecture rather than necessarily inventing a new permanent enum value.

---

# 46. Certificate generation should happen after sign

The conceptual sequence should be:

```text
review approved
     ↓
director signs
     ↓
digest generated
     ↓
seal applied
     ↓
certificate record created
     ↓
repository
```

Don't make a downloadable final certificate appear before Director approval.

---

# 47. Hash consistency

The digest displayed in:

```text
Director Sign Modal
Green Seal
Audit Trail
Certificate
```

must be the same value.

Never generate four different fake hashes.

Use:

```text
session.certificate.digest
```

as the source.

---

# 48. Audit consistency

Likewise:

```text
Reviewer
Director
Timestamp
Certificate ID
Session ID
```

must remain consistent across:

```text
Review
Audit
Certificate
```

This makes the application feel genuinely integrated.

---

# 49. Phase 6 component architecture

```text
features/
│
├── review/
│   ├── ReviewPage.tsx
│   ├── ReviewerQueue.tsx
│   ├── ReviewWorkspace.tsx
│   ├── ReviewSummary.tsx
│   ├── TestResultSummary.tsx
│   ├── ExceptionsPanel.tsx
│   ├── RowLevelCommentDrawer.tsx
│   ├── RemandModal.tsx
│   ├── ApproveReviewDialog.tsx
│   ├── DirectorSignModal.tsx
│   └── GreenStampedSeal.tsx
│
├── audit/
│   ├── AuditTrailPage.tsx
│   ├── AuditTimeline.tsx
│   ├── AuditEventCard.tsx
│   ├── AuditEventDrawer.tsx
│   └── IntegritySummary.tsx
│
└── reports/
    ├── ReportRepositoryPage.tsx
    ├── CertificateCard.tsx
    ├── CertificatePreview.tsx
    ├── LanguageSelector.tsx
    └── ReportActions.tsx
```

The component names follow the source's required review/audit/report components closely. `Pasted markdown(20261004-065148).md`

---

# 50. Phase 6 implementation prompt

```text
PHASE 6 - REVIEW, DIRECTOR SIGN-OFF, IMMUTABLE RECORD,
AUDIT TRAIL AND CERTIFICATES

The testing workflow is complete.

Now implement the assurance and certification layer.

Do not redesign:
- AppShell
- Header
- Sidebar
- SessionSidebar
- VerificationSessionHeader
- design system
- domain/session architecture
- existing testing pages

All data must come from the central VerificationSession.

==================================================
1. REVIEW QUEUE
==================================================

Create:

ReviewPage
ReviewerQueue
ReviewWorkspace

Queue states:

PENDING_REVIEW
IN_TESTING
REMANDED
APPROVED

Support:
search
status filtering
session selection

Each queue row:
instrument
serial
class
progress
status
submitted time

==================================================
2. REVIEW WORKSPACE
==================================================

Selected session must show:

instrument identity
verification stage
overall result
all procedure results
exceptions
review comments
traceability
audit state

Primary reviewer actions:

Approve & Forward to Director
Remand to Operator

Do not use generic CRUD actions.

==================================================
3. ROW-LEVEL COMMENTS
==================================================

Implement:

RowLevelCommentDrawer

Severity options:

NOTE
FLAG
REJECT_REASON

Show:
selected observation
author
role
timestamp
comment
resolved state

Provide pre-canned reviewer remarks as shortcuts.

Adding a comment must:
update session state
mark affected row
create audit event

==================================================
4. REMAND
==================================================

Remand must require a mandatory reason.

Do not allow empty submission.

After remand:
session status becomes REMANDED
review reason is persisted
audit event is created

Do not delete prior observations or review history.

==================================================
5. REVIEW APPROVAL
==================================================

Before approval validate:

required tests complete
traceability valid
no blocking unresolved conditions

Then:
PENDING_REVIEW
→ approved/forwarded to Director

Create audit event.

==================================================
6. DIRECTOR
==================================================

Only DIRECTOR may sign.

Metrologist/Reviewer/Auditor must not be able to perform
the signing action.

Test-entry inputs remain read-only for:
Reviewer
Director
Auditor

==================================================
7. DIRECTOR SIGN MODAL
==================================================

Create:

DirectorSignModal

Show:

session identity
final result
reviewer recommendation
statutory declaration checkbox
4-digit PIN
demo PIN accelerator in demo mode
SHA-256 digest preview

Disable sign until:
PIN valid
declaration accepted
session eligible

==================================================
8. SIGNING
==================================================

On sign:

generate deterministic session digest
apply signature state
apply Green Guilloche seal state
create certificate identity
create audit events

Do not use random digest values that change
on every render.

Persist the digest.

==================================================
9. GREEN SEAL
==================================================

Create:

GreenStampedSeal

Show:
verified badge
guilloche animation
director
laboratory
timestamp
certificate ID
QR

Animation must be subtle and official-looking.

No dramatic gaming effects.

==================================================
10. IMMUTABILITY
==================================================

After successful signing:

session becomes APPROVED
session becomes permanently read-only

Every mutation path must enforce immutability.

Do not rely only on disabled form inputs.

Provide:
isSessionImmutable()

and guard all session mutations.

Header should show:
APPROVED
LOCKED / IMMUTABLE

Show:
" This verification record can no longer be edited."

==================================================
11. AUDIT TRAIL
==================================================

Create:

AuditTrailPage
AuditTimeline
AuditEventCard
AuditEventDrawer
IntegritySummary

Show chronological events.

Every meaningful state change must be represented.

Each event:
timestamp
actor
role
action
previous state
new state
optional metadata
digest/hash

Use monospace typography for hashes.

==================================================
12. AUDIT INTEGRITY
==================================================

Provide a visual summary:

Audit Chain
✓ Intact

Events
N

Verified
N

Inconsistencies
0

Do not claim external cryptographic guarantees
that are not actually implemented.

==================================================
13. CERTIFICATE REPOSITORY
==================================================

Create:

ReportRepositoryPage
CertificateCard
CertificatePreview

Support:

search
English
Hindi
Bilingual

Each certificate:
certificate ID
serial number
instrument
class
director
date
verification status
QR

Actions:
Download PDF/A
Download DOCX
Verify

==================================================
14. CERTIFICATE CONSISTENCY
==================================================

Certificate must consume the approved session.

Do not create independent fake certificate data.

The following must remain consistent:

instrument
serial
class
test results
director
timestamp
digest
certificate ID
QR verification identity

==================================================
15. FAILURE CERTIFICATES
==================================================

A failed verification must remain visibly failed.

Do not label an unsuccessful technical result
as certified/pass.

Use the actual session compliance state.

==================================================
16. REMAND HISTORY
==================================================

Remanded sessions must preserve:

original test evidence
reviewer
remand reason
timestamp
later resubmission

Audit must show the complete sequence.

==================================================
17. LANGUAGE
==================================================

Certificate UI selector:

English
Hindi
Bilingual

Bilingual preview should present parallel
language columns.

Do not build separate unrelated certificate datasets.

Use one certificate content model
with localized rendering.

==================================================
18. ROLE TEST
==================================================

Test:

METROLOGIST
→ cannot sign

REVIEWER
→ can comment/review, cannot sign

DIRECTOR
→ can sign

AUDITOR
→ read-only

After signing:
ALL roles see immutable record.

==================================================
19. COMPLETE DEMO
==================================================

Run:

tests complete
↓
submit for review
↓
switch Reviewer
↓
open session
↓
add comment
↓
approve
↓
switch Director
↓
sign
↓
seal appears
↓
session locks
↓
switch Auditor
↓
open Audit
↓
open Certificate

No state may diverge between these views.

==================================================
20. STOP CONDITION
==================================================

Do not proceed to later polish/special features
until:

review works
remand works
approval works
signing works
immutability works
audit works
certificate repository works
role restrictions work
session data remains consistent
```

---

# 51. The final Phase 6 experience

When everything is done, this should be the visual story:

```text
┌───────────────────────────────────────────────────────────────┐
│ REVIEW                                                       │
│                                                               │
│ Avery ZM201                         CLASS III                 │
│ AV-2026-8812                                                   │
│                                                               │
│ FINAL RESULT                                                  │
│                                                               │
│                         ✓ PASS                                │
│                                                               │
│ Physical                 ✓ PASS                               │
│ Weighing                 ✓ PASS                               │
│ Eccentricity             ✓ PASS                               │
│ Repeatability            ✓ PASS                               │
│ Environment              ✓ PASS                               │
│                                                               │
│ Reviewer: R. Singh                                           │
│ Recommendation: APPROVE                                      │
│                                                               │
│ [ Remand ]                 [ Approve & Forward ]              │
└───────────────────────────────────────────────────────────────┘
```

Then Director:

```text
┌────────────────────────────────────────┐
│ SIGN & STAMP                           │
│                                        │
│ ✓ Review approved                      │
│ ✓ Traceability valid                   │
│ ✓ All tests complete                   │
│                                        │
│ PIN    ● ● ● ●                         │
│                                        │
│ SHA-256                                │
│ 7f924d8a...e10c9a10                    │
│                                        │
│ ☑ Statutory declaration                │
│                                        │
│ [ Sign & Stamp Certificate ]            │
└────────────────────────────────────────┘
```

Then:

```text
                 ✓ VERIFIED
            ╭─────────────────╮
            │   GREEN SEAL     │
            │   CERTIFIED      │
            ╰─────────────────╯

CERT-2026-000184
AV-2026-8812

🔒 IMMUTABLE RECORD
```

And finally the Audit page proves **how that result came to exist**.

That is a very strong end-to-end product story.

---

# 52. Phase 6 success criterion

You should now have this complete chain:

```text
TESTING
   ↓
ALL TESTS COMPLETE
   ↓
SUBMIT
   ↓
REVIEWER
   ↓
COMMENT / APPROVE / REMAND
   ↓
DIRECTOR
   ↓
PIN + DECLARATION
   ↓
SHA-256
   ↓
GUILLoche SEAL
   ↓
APPROVED
   ↓
IMMUTABLE
   ↓
AUDIT TRAIL
   ↓
CERTIFICATE
```

At this point, METROLOGIX-76 has the complete **operational → technical → assurance → legal-output story**.

**Next phase: the three specialist differentiators - Live Scale Bridge, Excel Flaw Auditor, and Jury Demo Assistant.** Those are the features that can make your hackathon demo stand out beyond the core workflow.

## Prompt:
10/4/2026, 6:59:35 PM

next

## Response:
10/4/2026, 6:59:42 PM · gpt-5-6-t-mini

> **Interacted with Files**
>
> 
>
> Worked for 7s

# PHASE 7 - SPECIALIST DIFFERENTIATORS
## Live Scale Bridge + Excel Flaw Auditor + Jury Demo Assistant

Now we build the features that make the project feel like **more than a form-based OIML testing application**.

These three features serve three completely different purposes:

```text
LIVE SCALE BRIDGE
→ connects the digital workflow to the physical instrument

EXCEL FLAW AUDITOR
→ proves why the new system is safer than legacy spreadsheets

JURY DEMO ASSISTANT
→ makes the entire product dramatically easier to demonstrate
```

The source explicitly defines Screen 15 as the Live Hardware IoT Scale Bridge, Screen 16 as the Legacy Excel Ingestion & Flaw Auditor, and the Jury Assistant as a 10-minute guided walkthrough with synchronized navigation. `Pasted markdown(20261004-065148).md`

---

# 1. PHASE 7 PRODUCT MENTAL MODEL

Do **not** make these feel like random utilities.

They should fit into the product story:

```text
                    METROLOGIX-76
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       TESTING        ASSURANCE        DEMO
          │              │              │
     Scale Bridge     Excel Auditor   Jury Assistant
          │              │              │
     Real Hardware   Legacy Audit     Guided Story
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                  TRUST + AUTOMATION
```

---

# 2. SCREEN 15 - SCALE BRIDGE

The source specifies:

- serial connection status
- physical USB/RS-232 connection
- large 7-segment live weight
- STABLE indicator
- Gross / Net
- WELMEC 7.2 software examination
- virtual scale simulator
- CAS / Mettler SICS / Avery SMA protocol presets `Pasted markdown(20261004-065148).md`

The key UX principle:

> **The Bridge is a live instrumentation workspace, not another test form.**

---

# 3. SCALE BRIDGE PAGE

Use a three-zone layout:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ SCALE BRIDGE                                                        │
│ Physical instrument connection and live measurement telemetry      │
├─────────────────────────────────────────────────────────────────────┤
│ CONNECTION                                                          │
│ ● Simulator Connected        Protocol: CAS                         │
│ [ Connect Physical Scale ] [ Disconnect ]                          │
├───────────────────────────────┬─────────────────────────────────────┤
│ LIVE SCALE                    │ SOFTWARE EXAMINATION                │
│                               │                                     │
│        10.005                │ WELMEC 7.2                          │
│          kg                   │                                     │
│                               │ Calibration Counter                 │
│      ● STABLE                │ C = 42                              │
│                               │ P = 18                              │
│   [ GROSS ]   [ NET ]        │ Firmware Hash                       │
│                               │ 91a4...c820                         │
├───────────────────────────────┴─────────────────────────────────────┤
│ SERIAL TERMINAL                                                    │
│ RX  10:42:12  ST,GS,+10.005kg                                    │
│ TX  10:42:13  SI                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

# 4. Connection banner

At the very top:

```text
● CONNECTED
USB / RS-232
COM3
9600 baud
```

Disconnected:

```text
○ NOT CONNECTED

No physical scale connected.

[ Connect Physical Scale ]
[ Use Virtual Simulator ]
```

Don't make connection status ambiguous.

---

# 5. Physical connection CTA

Primary:

```text
Connect Physical Scale
```

Secondary:

```text
Use Virtual Simulator
```

The source explicitly specifies a W3C WebSerial physical connection button and a simulator toggle. `Pasted markdown(20261004-065148).md`

---

# 6. Live weight display

This is the visual centerpiece.

```text
┌───────────────────────────────────────────────┐
│ LIVE READING                                  │
│                                               │
│              10.005                           │
│                kg                             │
│                                               │
│          ● STABLE                             │
│                                               │
│   GROSS                           ZERO        │
└───────────────────────────────────────────────┘
```

Use:

- IBM Plex Mono
- large tabular numerals
- subtle digital-display character
- no neon cyberpunk styling

It should look like **professional instrumentation**.

---

# 7. Stable state

Connected + stable:

```text
● STABLE
```

Unstable:

```text
● UNSTABLE
```

Zero:

```text
● ZERO
```

The header can simultaneously show the compact global scale chip because the source defines a live IoT scale readout in the application shell. `Pasted markdown(20261004-065148).md`

---

# 8. Gross / Net controls

Use a compact segmented control:

```text
[ GROSS ] [ NET ]
```

Current:

```text
GROSS
10.005 kg
```

Do not give these oversized cards.

This is telemetry, not the primary workflow.

---

# 9. Stability history

Add a small strip:

```text
STABILITY

───────────────●──────────────
               NOW

Stable duration
2.4 s
```

This creates the feeling of a genuinely live measurement environment.

Keep it lightweight.

---

# 10. Auto-capture

The source's IoT context includes:

```text
autoCaptureToGrid
lastCapturedWeight
captureCurrentReading()
```

`Pasted markdown(20261004-065148).md`

Therefore add:

```text
AUTO CAPTURE TO TEST GRID     [ ON ]
```

Then:

```text
Current stable reading
10.005 kg

[ Capture Reading ]
```

When captured:

```text
✓ Added to Weighing Observation #14
```

That is a **killer demo interaction**.

---

# 11. Capture safety

Never capture an unstable value silently.

If:

```text
UNSTABLE
```

show:

```text
Capture unavailable

Wait for a stable reading before
adding this value to the observation grid.
```

Then disable the CTA.

---

# 12. WELMEC examination panel

Right side:

```text
WELMEC 7.2
SOFTWARE EXAMINATION

Calibration counter
C                     42

Parameter counter
P                     18

Firmware version
v2.4.1

Firmware hash
91a4d8...c820

Last interrogation
04 Oct 2026 • 18:07
```

The source specifically calls for calibration counters, firmware hash and WELMEC 7.2 examination. `Pasted markdown(20261004-065148).md`

---

# 13. WELMEC interrogation button

```text
[ Interrogate Instrument ]
```

Click:

```text
Interrogating...
Reading counters...
Checking firmware metadata...
```

Result:

```text
✓ Examination complete
```

---

# 14. Tamper simulation

Because the source's IoT context includes:

```text
interrogateWelmec(simulateTamper?)
```

support a demo-only control:

```text
Demo Controls

[ Simulate Counter Change ]
```

But make it unmistakably:

```text
DEMO ONLY
```

Then show:

```text
⚠ SOFTWARE STATE CHANGED

Calibration counter:
42 → 43

Firmware metadata remains unchanged.
```

This is useful for judges because it demonstrates that the interface can surface software examination evidence.

---

# 15. Virtual Scale Simulator

Simulator modal:

```text
VIRTUAL SCALE SIMULATOR

Select protocol

[ CAS ]
[ Mettler SICS ]
[ Avery SMA ]

Instrument
Avery ZM201

Weight
[ 10.005 ] kg

Stability
[ Stable ]

[ Start Simulator ]
```

These protocol presets are explicitly part of the source specification. `Pasted markdown(20261004-065148).md`

---

# 16. Simulator state

Once running:

```text
● SIMULATOR ACTIVE

Protocol
CAS

10.005 kg
STABLE

Packets received
248

Last packet
18:14:09
```

Add tiny telemetry metrics:

```text
Packets/sec
Latency
Last update
```

Do not overdo the dashboard.

---

# 17. Serial terminal

Bottom drawer:

```text
SERIAL TERMINAL
────────────────────────────────────────────

18:14:08 RX
ST,GS,+10.005kg

18:14:08 RX
ST,GS,+10.005kg

18:14:09 TX
SI

18:14:09 RX
ST,GS,+10.005kg

[ Clear ]                 [ Auto-scroll ✓ ]
```

Use monospace and subtle separators.

This gives technical judges something concrete to inspect.

---

# 18. Scale Bridge → Weighing integration

The most important connection:

```text
LIVE BRIDGE
     ↓
stable weight
     ↓
Capture
     ↓
active observation row
     ↓
calculate
     ↓
PASS / MARGINAL / FAIL
```

The user should not manually copy the reading.

---

# 19. Scale Bridge code structure

```text
features/
└── iot/
    ├── LiveBridge.tsx
    ├── ConnectionBanner.tsx
    ├── LiveWeightDisplay.tsx
    ├── StabilityBeacon.tsx
    ├── GrossNetToggle.tsx
    ├── SerialTerminal.tsx
    ├── VirtualScaleSimulator.tsx
    ├── ProtocolSelector.tsx
    ├── WelmecAuditPanel.tsx
    ├── WelmecMetrics.tsx
    └── SimulatorControls.tsx
```

---

# 20. SCREEN 16 - EXCEL FLAW AUDITOR

This is potentially one of the **strongest hackathon differentiators**.

The source defines an `.xlsx` drag-and-drop area, Instant Benchmark Demo, and four analysis tabs:

```text
Discrepancies
Weighing Recalculation
Eccentricity Comparison
Extracted Metadata
```

`Pasted markdown(20261004-065148).md`

The mental model should be:

> **Drop your old spreadsheet here. We show you what the new system catches.**

---

# 21. Excel page hero

```text
┌────────────────────────────────────────────────────────────────────┐
│ EXCEL FLAW AUDITOR                                                │
│ Compare legacy spreadsheet calculations against controlled        │
│ OIML-oriented recalculation.                                      │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │                     ↓                                       │   │
│ │              Drop .XLSX file here                           │   │
│ │                                                              │   │
│ │                    or                                        │   │
│ │                                                              │   │
│ │                 [ Browse Files ]                             │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ [ Run Instant Benchmark Demo ]                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

# 22. Benchmark demo

This is essential for the hackathon.

Click:

```text
Run Instant Benchmark Demo
```

Then:

```text
Analyzing workbook...
Reading metadata...
Recalculating observations...
Comparing formulas...
Checking eccentricity...
```

Then produce:

```text
AUDIT COMPLETE

31 observations analyzed

2 discrepancies found

1 potential false PASS
1 calculation mismatch
```

The interface should immediately tell the story.

---

# 23. Top-level audit summary

```text
┌──────────────┬──────────────┬──────────────┬───────────────┐
│ OBSERVATIONS │ DISCREPANCIES│ FALSE PASS   │ FALSE FAIL    │
│     31       │      2       │      1       │      0        │
└──────────────┴──────────────┴──────────────┴───────────────┘
```

Use strong semantics:

```text
FALSE PASS → crimson
FALSE FAIL → amber or appropriate warning
```

---

# 24. Tab 1 - Discrepancies

Table:

```text
┌────┬──────────────────┬─────────────┬──────────────┬─────────┐
│ #  │ Test             │ Legacy      │ Recalculated │ Result  │
├────┼──────────────────┼─────────────┼──────────────┼─────────┤
│ 14 │ 10 kg weighing   │ PASS        │ FAIL         │ ⚠       │
│ 22 │ Corner 4         │ PASS        │ FAIL         │ ✕       │
└────┴──────────────────┴─────────────┴──────────────┴─────────┘
```

Click row → detail drawer.

---

# 25. The killer discrepancy card

For the rounding trap scenario, visually emphasize:

```text
LEGACY SPREADSHEET

I - L
= 0.0 g

PASS
```

versus:

```text
CONTROLLED RECALCULATION

Turning Point
= -5.3 g

Limit
= ±5.0 g

FAIL
```

Then:

```text
⚠ ROUNDING DISCREPANCY DETECTED
```

The source contains the `rounding_discrepancy_trap` scenario specifically to demonstrate a spreadsheet false PASS caused by rounding, with the true unrounded result exceeding the limit. `Pasted markdown(20261004-065148).md`

This should be one of the biggest visuals in the entire application.

---

# 26. Don't just show "formula difference"

Explain it visually:

```text
LEGACY
Observed - Target
       ↓
   rounded value
       ↓
      PASS
```

versus:

```text
METROLOGIX
Observed
   ↓
Turning Point
   ↓
Corrected Error
   ↓
MPE comparison
   ↓
FAIL
```

This turns an abstract calculation issue into something a judge understands in seconds.

---

# 27. Tab 2 - Weighing Recalculation

Use side-by-side comparison:

```text
┌───────────────────────────┬────────────────────────────┐
│ LEGACY FORMULA            │ CONTROLLED RECALCULATION   │
├───────────────────────────┼────────────────────────────┤
│ I - L                     │ P = I + 0.5e - ΔL         │
│                           │                            │
│ Rounded intermediate      │ Unrounded calculation      │
│                           │                            │
│ Result: PASS              │ Result: FAIL               │
└───────────────────────────┴────────────────────────────┘
```

The source explicitly specifies this side-by-side comparison. `Pasted markdown(20261004-065148).md`

---

# 28. Technical proof drawer

Don't put all formulas on the main screen.

Click:

```text
View Calculation
```

Open:

```text
CALCULATION TRACE

Target Load
10.000 g

Observed Reading
10.000 g

Interval
5.0 g

Turning Point
...

Corrected Error
...

MPE
±5.0 g
```

This follows the project's core UX principle:

```text
human answer
↓
evidence
↓
technical proof
```

---

# 29. Tab 3 - Eccentricity Comparison

Show:

```text
LEGACY
Corner 1      PASS
Corner 2      PASS
Corner 3      PASS
Corner 4      PASS
```

against:

```text
RECALCULATED

Corner 1      +1.2 g
Corner 2      +0.8 g
Corner 3      -1.7 g
Corner 4      -6.2 g   ✕
```

Then provide the same heatmap visual used in the Eccentricity test.

This reuses an existing domain visualization instead of inventing a second visual language.

---

# 30. Tab 4 - Extracted Metadata

Show machine-readable information:

```text
INSTRUMENT METADATA

Manufacturer       Avery Weigh-Tronix
Model              ZM201
Serial             AV-2026-8812
Accuracy Class     III
Max                30.000 kg
Min                0.100 kg
e                  0.005 kg
d                  0.005 kg

WORKBOOK METADATA

File
legacy_verification.xlsx

Rows
31

Sheets
3

Imported
04 Oct 2026 • 18:19
```

The source explicitly calls for extracted instrument and verification metadata. `Pasted markdown(20261004-065148).md`

---

# 31. Excel auditor UX rule

The result must **never** feel like:

> "Excel parser utility."

It should feel like:

> **"Legacy verification assurance engine."**

That distinction matters for judging.

---

# 32. Excel import states

### Empty

```text
No workbook loaded

Drop a legacy verification workbook here.
```

### Processing

```text
Analyzing workbook
██████████████░░░░
```

### Success

```text
✓ Audit complete
31 observations analyzed
```

### Invalid file

```text
This file is not a supported Excel workbook.

Accepted format:
.xlsx
```

### No recognizable data

```text
Workbook loaded, but no recognizable
verification observation sheet was found.
```

The source requires actionable empty states and client-side feedback rather than blank screens. `Pasted markdown(20261004-065148).md`

---

# 33. Excel component architecture

```text
features/
└── ingestion/
    ├── ExcelIngestionView.tsx
    ├── ExcelDropzone.tsx
    ├── BenchmarkRunner.tsx
    ├── AuditSummary.tsx
    ├── DiscrepancyTable.tsx
    ├── DiscrepancyDrawer.tsx
    ├── WeighingRecalculation.tsx
    ├── EccentricityComparison.tsx
    ├── ExtractedMetadata.tsx
    └── CalculationTrace.tsx
```

---

# 34. JURY DEMO ASSISTANT

This is not a normal product page.

It is a **presentation control system**.

The source defines:

- floating drawer
- 1-10 minute timeline
- Play
- Pause
- Reset
- presenter cues
- statutory references
- highlights
- Next Step
- automatic sidebar/tab synchronization `Pasted markdown(20261004-065148).md`

---

# 35. The Jury button

Header:

```text
🎬 Jury Demo
```

or:

```text
Jury Assistant
```

Don't make it huge.

It is a global utility.

---

# 36. Drawer layout

Click it:

```text
                                         ┌──────────────────────────────┐
                                         │ JURY DEMO ASSISTANT         ×│
                                         ├──────────────────────────────┤
                                         │                              │
                                         │ 08:42                        │
                                         │ ● Playing                   │
                                         │                              │
                                         │ ──────────────────────────── │
                                         │ 01 Intake             ✓     │
                                         │ 02 Physical Audit     ✓     │
                                         │ 03 Weighing           →     │
                                         │ 04 Eccentricity             │
                                         │ 05 Repeatability            │
                                         │ 06 Environment               │
                                         │ 07 Review & Sign              │
                                         │ 08 Excel Auditor              │
                                         │ 09 Scale Bridge               │
                                         │ 10 Certificate                │
                                         │                              │
                                         │ PRESENTER CUE                │
                                         │ "This is where we replace    │
                                         │ manual spreadsheet errors..."│
                                         │                              │
                                         │ [ Pause ] [ Next Step → ]    │
                                         └──────────────────────────────┘
```

---

# 37. The timer

Top:

```text
08:42
```

Controls:

```text
[ ▶ Play ] [ ⏸ Pause ] [ ↻ Reset ]
```

The source explicitly specifies these controls. `Pasted markdown(20261004-065148).md`

---

# 38. Timeline

Don't make ten large cards.

Use a compact vertical progression:

```text
01 ─ Intake
02 ─ Physical
03 ─ Weighing       ← current
04 ─ Eccentricity
05 ─ Repeatability
06 ─ Environment
07 ─ Review
08 ─ Scale Bridge
09 ─ Excel Auditor
10 ─ Certificate
```

Current:

```text
03 ●
```

Completed:

```text
01 ✓
02 ✓
```

---

# 39. Presenter cue

Every step gets one short sentence.

Example:

```text
STEP 03 - WEIGHING

Presenter cue

"This observation grid calculates the
controlled error rather than trusting
a rounded spreadsheet value."

Highlight:
→ Observation Grid
→ Error Corridor
```

This makes your presentation much smoother.

---

# 40. Statutory reference area

Small expandable section:

```text
REFERENCE

OIML R 76
Relevant evaluation procedure

[ View Reference ]
```

Don't dump paragraphs into the drawer.

The source calls for statutory references as presenter cues. `Pasted markdown(20261004-065148).md`

---

# 41. Next Step behavior

This is one of the most important parts.

Click:

```text
Next Step →
```

must do:

```text
update demo step
+
navigate application
+
update sidebar active item
+
scroll/focus relevant feature
+
update presenter cue
```

The source specifically requires automatic sidebar synchronization. `Pasted markdown(20261004-065148).md`

---

# 42. Example

Current:

```text
Jury Assistant
03 - Weighing
```

Click next.

Automatically:

```text
route → eccentricity
sidebar → Eccentricity
session context → same session
drawer → 04
cue → eccentricity script
```

No manual clicking around.

This will make the application look extremely polished during judging.

---

# 43. Highlight mode

When the assistant changes pages, temporarily highlight the relevant UI:

```text
┌──────────────────────────────────────┐
│ Observation Grid                     │
│                                      │
│ 10kg      10.005kg      +5.0g       │
│                                      │
│        ↑ HIGHLIGHT                   │
└──────────────────────────────────────┘
```

Use a subtle outline/pulse for 1-2 seconds.

Never put a giant yellow arrow over the UI.

---

# 44. Demo scenario synchronization

Connect Jury Assistant with Scenario Launcher.

For example:

```text
Demo scenario:
Rounding Discrepancy Trap
```

Then when the assistant reaches the Excel stage, it loads the relevant benchmark state automatically.

This gives you a **story**, not a collection of disconnected screens.

---

# 45. Recommended hackathon story

For your demo, the strongest narrative is:

```text
1. Register Avery scale
        ↓
2. Complete verification
        ↓
3. Capture live reading
        ↓
4. Show rounding trap
        ↓
5. Show reviewer audit
        ↓
6. Director signs
        ↓
7. Record becomes immutable
        ↓
8. Show cryptographic audit
        ↓
9. Generate certificate
        ↓
10. Finish with legacy Excel comparison
```

Or, if time is tight:

```text
LIVE SCALE
      ↓
ROUNDING TRAP
      ↓
REVIEW
      ↓
SIGN
      ↓
CERTIFICATE
```

That is the shortest high-impact path.

---

# 46. Phase 7 state additions

Extend your central IoT state:

```typescript
interface IoTState {
  isConnected: boolean;
  isSimulatorActive: boolean;

  currentWeight: number;
  isStable: boolean;
  isZero: boolean;

  unit: string;
  mode: 'GROSS' | 'NET';

  protocol: 'CAS' | 'METTLER_SICS' | 'AVERY_SMA';

  autoCaptureToGrid: boolean;
  lastCapturedWeight: number | null;

  serialLogs: SerialLog[];
  welmecAudit: WelmecAuditTelemetry;
}
```

These capabilities are already described by the source's IoT context. `Pasted markdown(20261004-065148).md`

---

# 47. Excel audit state

```typescript
interface ExcelAuditState {
  fileName: string | null;
  isProcessing: boolean;

  observationsAnalyzed: number;
  discrepancyCount: number;
  falsePassCount: number;
  falseFailCount: number;

  discrepancies: Discrepancy[];
  weighingComparison: WeighingComparison[];
  eccentricityComparison: EccentricityComparison[];
  metadata: ExtractedMetadata | null;
}
```

---

# 48. Jury state

```typescript
interface JuryDemoState {
  isOpen: boolean;
  isPlaying: boolean;

  currentStep: number;

  elapsedSeconds: number;
  remainingSeconds: number;

  steps: JuryDemoStep[];
}
```

Each step:

```typescript
interface JuryDemoStep {
  id: number;
  title: string;
  route: string;
  presenterCue: string;
  reference?: string;
  highlightTarget?: string;
}
```

---

# 49. Critical architecture rule

These three features should **consume the same domain state**.

Never create a second fake session state.

```text
              VerificationSession
                     │
        ┌────────────┼──────────────┐
        │            │              │
   Scale Bridge   Excel Audit    Review
        │            │              │
        └────────────┼──────────────┘
                     ↓
              same observations
              same instrument
              same result
```

This is what makes the application feel like **one system**.

---

# 50. Phase 7 navigation

With the simplified shell architecture we've been using, I would place these like this:

```text
WORK
├── Home
├── Sessions
└── Instruments

ASSURANCE
├── Review
├── Standards
└── Audit

OUTPUT
└── Reports

TOOLS
├── Scale Bridge
└── Excel Auditor
```

And:

```text
Jury Assistant
```

remains a global floating/header utility rather than a normal navigation destination.

The original source lists these as separate sidebar targets, including Scale Bridge, Excel Migration, Review & Sign and Certificates. `Pasted markdown(20261004-065148).md`

---

# 51. Phase 7 coding prompt

```text
PHASE 7 - SPECIALIST DIFFERENTIATORS

Implement only:

1. Live Scale Bridge
2. Virtual Scale Simulator
3. WELMEC Audit Panel
4. Excel Legacy Flaw Auditor
5. Jury Demo Assistant

Do not modify existing:
- AppShell
- Header
- Sidebar architecture
- Session model
- Testing calculations
- Review/sign workflow
- Certificate workflow

==================================================
A. LIVE SCALE BRIDGE
==================================================

Create:

LiveBridge
ConnectionBanner
LiveWeightDisplay
StabilityBeacon
GrossNetToggle
SerialTerminal
VirtualScaleSimulator
WelmecAuditPanel

Support:

physical connection state
simulator connection state
CAS protocol
Mettler SICS protocol
Avery SMA protocol

Show:

live weight
unit
stable/unstable
zero
gross/net

Add:

Capture Reading
Auto Capture to Test Grid

Never capture unstable readings.

==================================================
B. WELMEC
==================================================

Display:

calibration counter
parameter counter
firmware version
firmware hash
last interrogation time

Add:

Interrogate Instrument

Support demo-only tamper simulation.

Clearly mark all simulation behavior as DEMO.

==================================================
C. TEST INTEGRATION
==================================================

CaptureCurrentReading must write into
the active observation row.

Use the same VerificationSession state.

Do not duplicate observation state.

After capture:

show success toast
update row
recalculate result
update compliance state

==================================================
D. EXCEL AUDITOR
==================================================

Create:

ExcelIngestionView
ExcelDropzone
BenchmarkRunner
AuditSummary
DiscrepancyTable
DiscrepancyDrawer
WeighingRecalculation
EccentricityComparison
ExtractedMetadata
CalculationTrace

Support:

.xlsx upload
instant benchmark demo
processing state
success state
invalid file state
empty-data state

Four tabs:

Discrepancies
Weighing Recalculation
Eccentricity Comparison
Extracted Metadata

==================================================
E. ROUNDING TRAP DEMO
==================================================

Create a highly visible discrepancy comparison:

Legacy result
versus
controlled recalculation

Show:

rounded result
unrounded result
MPE
final verdict

Reuse actual domain calculations.

Do not create fake unrelated numbers.

==================================================
F. JURY ASSISTANT
==================================================

Create:

JuryDemoAssistant

Features:

10-minute timer
Play
Pause
Reset
timeline
presenter cue
reference
highlight target
Next Step

Next Step must:

advance timer/state
navigate to target route
update sidebar active state
focus/highlight target component
update cue

==================================================
G. SHARED STATE
==================================================

Scale Bridge,
Excel Auditor,
Testing,
Review,
Audit,
and Certificates

must consume the same session/instrument model.

No duplicated business state.

==================================================
H. VISUAL QUALITY
==================================================

Use the existing design system.

Keep:

light-first precision UI
clean borders
restrained shadows
Inter
IBM Plex Mono
PASS emerald
FAIL crimson
WARNING amber
PENDING indigo

No:
neon
gaming UI
excessive gradients
giant cards
decorative clutter

==================================================
I. DEMO EXPERIENCE
==================================================

Ensure this flow works:

Load Avery preset
→ open Scale Bridge
→ start simulator
→ show stable live reading
→ capture reading
→ return to Weighing
→ observation updates

Then:

open Excel Auditor
→ Run Benchmark Demo
→ show Rounding Trap
→ open calculation trace

Then:

open Jury Assistant
→ click Next Step
→ application navigates automatically

==================================================
STOP CONDITION
==================================================

Do not proceed to visual polish,
microanimations, or deployment work yet.

First verify:

live telemetry works
capture works
Excel benchmark works
discrepancy drawer works
Jury navigation works
all three consume central state
```

---

# 52. What Phase 7 gives you

After Phase 7, your product is no longer simply:

```text
"an application that records OIML tests"
```

It becomes:

```text
A digital verification workstation
        +
real scale integration
        +
legacy spreadsheet assurance
        +
controlled review/signing
        +
immutable auditability
        +
certificate generation
        +
presentation automation
```

That is the point where the project starts feeling like a **complete product rather than a hackathon CRUD application**.

### PHASE 8 - FINAL POLISH & JUDGE-LEVEL UX

Next, I would do the **final visual/interaction pass across the entire application**: hierarchy, spacing, typography, responsive behavior, loading/empty/error states, transitions, accessibility, navigation consistency, and the exact **5-10 second comprehension test** for every screen.

## Prompt:
10/4/2026, 7:00:49 PM

next

## Response:
10/4/2026, 7:00:58 PM · gpt-5-6-t-mini

> **Inspected the implementation plan’s final sections**
>
> 
>
> Worked for 5s

# PHASE 8 - FINAL UX POLISH, RESPONSIVENESS & JUDGE-LEVEL FINISH

Now we stop adding major features.

The product already has the core workflow, testing, review/signing, hardware bridge, Excel auditor, audit trail, certificates, and jury assistant. The next job is to make **every existing screen feel like it belongs to one serious professional product**.

This is where a good hackathon project becomes a **convincing product**.

Your source's design direction is very clear about clean human-readable UI, chunked cards, progressive disclosure, restrained visual treatment, tabular alignment, Inter/IBM Plex Mono typography, and strong PASS/FAIL semantics. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 1. PHASE 8 GOAL

The entire application should pass this test:

```text
OPEN ANY SCREEN
      ↓
5 seconds
      ↓
What am I looking at?
      ↓
10 seconds
      ↓
What is the current result?
      ↓
15 seconds
      ↓
What should I do next?
```

The user should never need to decipher the interface first.

---

# 2. THE GLOBAL VISUAL HIERARCHY

Every page should follow:

```text
PAGE TITLE
↓
ONE-SENTENCE PURPOSE
↓
PRIMARY STATUS / ANSWER
↓
PRIMARY ACTION
↓
EVIDENCE
↓
TECHNICAL DETAILS
```

For example:

```text
WEIGHING ERROR

Verify indication accuracy across the required load sequence.

✓ PASS
Within legal tolerance at all required test loads.

[ Capture Stable Reading ]

────────────────────────────

Observation Grid

────────────────────────────

Calculation Details
```

Not:

```text
[ 19 cards ]
[ 14 pills ]
[ 7 metrics ]
[ 3 graphs ]
...
```

Your source explicitly prioritizes visual clarity over jargon and progressive disclosure. `Pasted markdown(20261004-065148).md`

---

# 3. PAGE HEADER SYSTEM

Every page gets the same structure.

```text
Breadcrumb
     ↓
H1 Page Title
     ↓
Short description
     ↓
Right-side page action
```

Example:

```text
Tests / Weighing

WEIGHING ERROR
Verify indication accuracy across the required load sequence.

                         [ Capture Live Reading ]
```

Consistency here is extremely important.

---

# 4. DON'T USE GIANT HERO SECTIONS

Avoid:

```text
┌──────────────────────────────────────┐
│                                      │
│         WEIGHING ERROR               │
│                                      │
│          HUGE EMPTY SPACE             │
│                                      │
└──────────────────────────────────────┘
```

Instead:

```text
WEIGHING ERROR
Verify indication accuracy...

✓ PASS                              31 observations
All required loads evaluated.
```

Your application is a **working laboratory system**, not a marketing website.

---

# 5. CARD HIERARCHY

Use only three card levels.

### Level 1 - Primary

The most important content.

```text
rounded-xl
white surface
1px border
subtle shadow
p-6
```

### Level 2 - Supporting

```text
white/slightly tinted surface
1px border
p-4
```

### Level 3 - Technical

```text
transparent / muted surface
thin border
p-3/p-4
```

This prevents every element from visually competing.

---

# 6. NO CARD GRID EXPLOSION

A common AI-generated UI problem:

```text
12 cards
inside
6 cards
inside
another card
```

Don't do this.

A page should normally have:

```text
1 primary panel
+
2-4 supporting sections
```

not fifteen equally important boxes.

---

# 7. TYPOGRAPHY SYSTEM

The source specifies Inter for UI and IBM Plex Mono for numerical/technical information. It also requires tabular numerals for metrics and tables. `Pasted markdown(20261004-065148).md`

Use:

```text
Inter
────────────────
Page title       28-32px / 700
Section title    18-20px / 650
Card title       15-16px / 600
Body             14px
Secondary        13px
Micro            12px
```

Technical:

```text
IBM Plex Mono
────────────────
weights
serial numbers
errors
measurements
timestamps
hashes
certificate IDs
```

---

# 8. NUMBER ALIGNMENT

This matters far more than people realize.

Bad:

```text
10 kg
9.5 kg
100.005 kg
7 kg
```

Good:

```text
 10.000 kg
  9.500 kg
100.005 kg
  7.000 kg
```

Use:

```css
font-variant-numeric: tabular-nums;
```

The source explicitly requires this for tables and metrics. `Pasted markdown(20261004-065148).md`

---

# 9. HUMAN-FRIENDLY LABELS

Never regress into technical shorthand on the main screen.

Use:

```text
Target Load
Observed Reading
Calculated Error
Statutory Limit
Compliance
```

Technical notation can appear beneath:

```text
Target Load
L (Nominal)
```

The source explicitly specifies this two-layer approach. `Pasted markdown(20261004-065148).md`

---

# 10. STATUS LANGUAGE

Standardize the entire application.

```text
✓ PASS
✕ FAIL
⚠ MARGINAL
◌ PENDING
🔒 IMMUTABLE
```

Avoid having:

```text
Completed
Success
Passed
Verified
Okay
Approved
```

all mean roughly the same thing.

Each state should have a precise meaning.

---

# 11. STATUS COLOR SYSTEM

Keep the source semantics everywhere:

```text
PASS       Emerald
FAIL       Crimson
MARGINAL   Amber
PENDING    Indigo / neutral
LOCKED     Gold / neutral
PRIMARY    Blue
```

The source explicitly defines these semantics. `Pasted markdown(20261004-065148).md`

---

# 12. NEVER USE COLOR ALONE

Bad:

```text
green dot = PASS
red dot = FAIL
```

Better:

```text
✓ PASS
✕ FAIL
```

Color reinforces meaning instead of being the only meaning.

This also improves accessibility.

---

# 13. GLOBAL SESSION HEADER

Every testing screen should inherit the same session context:

```text
┌────────────────────────────────────────────────────────────────┐
│ AV-2026-8812   Avery ZM201            CLASS III     ✓ PASS    │
│ Max 30 kg • Min 100 g • e 5 g • d 5 g                          │
│ Traceability ● VALID                                            │
│                                                                │
│ 01 ✓ → 02 ✓ → 03 ● → 04 ○ → 05 ○ → 06 ○ → 07 ○                │
└────────────────────────────────────────────────────────────────┘
```

The source explicitly calls for a persistent instrument context and interactive seven-step progress. `Pasted markdown(20261004-065148).md`

---

# 14. SESSION HEADER RESPONSIVE BEHAVIOR

Desktop:

```text
identity + specifications + status + stepper
```

Tablet:

```text
identity + result
stepper beneath
```

Mobile:

```text
AV-2026-8812
✓ PASS

03 / 07
WEIGHING

[ View Session Details ]
```

Don't squeeze seven steps into seven unreadable columns.

---

# 15. SIDEBAR RESPONSIVENESS

Desktop:

```text
240px
```

Collapsed:

```text
72px
```

Tablet:

```text
drawer
```

Mobile:

```text
bottom-sheet / hamburger drawer
```

The navigation must never reduce the working canvas so much that a metrology table becomes uncomfortable.

---

# 16. TABLE RESPONSIVENESS

Critical.

Don't just make wide tables horizontally scroll forever.

For desktop:

```text
Target | Observed | Error | Limit | Verdict
```

For smaller screens:

```text
10.000 kg
Observed  10.005 kg
Error     +5.0 g
Limit     ±5.0 g
✓ PASS
```

Use a responsive row/card transformation where appropriate.

---

# 17. TEST PAGE RESPONSIVE PATTERN

Desktop:

```text
┌──────────────────────┬──────────────────────┐
│ INPUT / OBSERVATION  │ VISUALIZATION        │
│                      │                      │
│                      │                      │
└──────────────────────┴──────────────────────┘
```

Tablet:

```text
INPUT / OBSERVATION
────────────────────
VISUALIZATION
```

Mobile:

```text
RESULT
INPUT
EVIDENCE
TECHNICAL DETAILS
```

This retains priority instead of merely shrinking everything.

---

# 18. PRIMARY ACTION STABILITY

Every page should have **one obvious main action**.

Examples:

```text
Intake
→ Register Instrument

Readiness
→ Start Testing

Weighing
→ Capture Stable Reading

Review
→ Approve & Forward

Director
→ Sign & Stamp

Certificate
→ Download PDF/A
```

Don't have five blue buttons.

---

# 19. STICKY ACTION FOOTER

For long workflows:

```text
─────────────────────────────────────────────────────────
3 of 7 complete

[ Back ]                  [ Save Draft ] [ Continue → ]
```

For review:

```text
─────────────────────────────────────────────────────────
1 unresolved flag

[ Remand Session ]       [ Approve & Forward ]
```

The footer should stay available without becoming visually dominant.

---

# 20. LOADING STATES

Never show a blank white page.

Every async operation gets an intentional skeleton.

Example:

```text
Instrument
██████████████

Specifications
██████ ██████

Test Status
████████████
```

For live hardware:

```text
CONNECTING TO SCALE...

●
Establishing serial connection
```

---

# 21. DON'T OVERUSE SPINNERS

Instead of:

```text
⟳ Loading...
```

prefer contextual progress:

```text
Reading instrument metadata...
Checking connection...
```

or:

```text
Analyzing workbook
Step 2 of 4
```

---

# 22. ERROR DESIGN

The source explicitly requires immediate inline validation, non-intrusive toasts, and actionable empty states. `Pasted markdown(20261004-065148).md`

Use three layers:

```text
FIELD ERROR
↓
PAGE WARNING
↓
SYSTEM TOAST
```

Example:

```text
Max Capacity
[ 5 kg ]

✕ Max capacity must be greater than Min capacity.
```

---

# 23. TOAST SYSTEM

Top-right:

```text
✓ Reading captured
```

or:

```text
✓ Review submitted
```

or:

```text
⚠ Standard weights expire in 3 days
```

Toast duration:

```text
success → 3 sec
warning → 5 sec
error → until acknowledged when important
```

---

# 24. EMPTY STATES

Every empty page needs a reason and action.

Bad:

```text
No data.
```

Good:

```text
No active verifications

There are no instruments currently in testing.

[ Register Instrument ]
```

The source explicitly requires informative empty states with actionable primary actions. `Pasted markdown(20261004-065148).md`

---

# 25. CONFIRMATION DIALOG RULE

Only use confirmation when something is:

```text
destructive
irreversible
legally meaningful
```

Examples:

```text
Remand
Sign & Stamp
Lock / Approve
Delete local draft
```

Don't ask:

```text
Are you sure?
```

for every normal navigation click.

---

# 26. MODAL SIZE DISCIPLINE

Use:

```text
small
→ confirmations

medium
→ forms

large
→ technical audit

full-height drawer
→ observation comments / evidence
```

The source explicitly prefers focused modals and slide-over drawers to keep primary screens uncluttered. `Pasted markdown(20261004-065148).md`

---

# 27. DRAWER ANIMATION

Use:

```text
180-220ms
ease-out
```

Drawer:

```text
translateX(100%)
→ translateX(0)
```

Don't use springy elastic animations.

This is laboratory software.

---

# 28. MOTION LANGUAGE

Use motion to communicate:

```text
opening
closing
progress
state change
attention
```

Not for decoration.

Good:

```text
PASS badge fades in
seal draws itself
captured reading briefly highlights
step transition moves forward
```

Bad:

```text
cards floating constantly
continuous background animation
gradient blobs
rotating icons
```

---

# 29. ERROR CORRIDOR POLISH

Your chart should immediately explain:

```text
allowed region
actual observations
worst observation
current margin
```

Make the legend human-readable:

```text
Legal tolerance
Observed error
Near-limit zone
```

Then allow technical details on hover/click.

---

# 30. ECCENTRICITY HEATMAP POLISH

Main interpretation:

```text
✓ Center
✓ Corner 1
✓ Corner 2
✓ Corner 3
✕ Corner 4
```

Technical layer:

```text
ΔE = -6.2 g
Limit = ±5.0 g
```

The judge should understand the failure before understanding the math.

---

# 31. REPEATABILITY POLISH

The big card should say:

```text
TOTAL OBSERVED SPREAD

1.2 g

Allowed
2.0 g

✓ PASS
```

The underlying scatter plot remains supporting evidence.

This follows the source's explicit repeatability presentation rule. `Pasted markdown(20261004-065148).md`

---

# 32. READINESS SCREEN

The readiness gate should feel like a **pre-flight checklist**, not a generic form.

```text
TEST READINESS

✓ Instrument
✓ Traceability
✓ Test Plan

Environment
✓ Baseline recorded

Required checks
8 / 8

READY TO TEST

[ Start Testing ]
```

For blocked:

```text
TESTING BLOCKED

1 required condition needs attention

✕ Standard weight calibration expired

[ Resolve Issue ]
```

---

# 33. REVIEW SCREEN

Make the reviewer answer three questions immediately:

```text
Is everything complete?
Is anything questionable?
What action can I take?
```

Top summary:

```text
7 / 7 procedures complete
✓ PASS
2 review notes
0 blocking flags
```

Then action.

---

# 34. DIRECTOR SCREEN

This should visually become **more formal** than the operator UI.

Reduce interactive clutter.

Use:

```text
Authorization
Evidence
Declaration
Digest
Sign
```

The source clearly defines the Director as the final statutory authority and specifies a Director PIN signing flow. `Pasted markdown(20261004-065148).md`

---

# 35. APPROVED STATE POLISH

Once approved:

```text
APPROVED
🔒 IMMUTABLE RECORD
```

Then slightly reduce contrast of disabled inputs.

Do not make the whole page gray and dead.

The record should still feel important.

---

# 36. GOLDEN LOCK BADGE

Header:

```text
🔒 IMMUTABLE
```

Tooltip:

```text
This verification record is permanently read-only
after Director approval.
```

The source explicitly requires a golden lock visual after approval. `Pasted markdown(20261004-065148).md`

---

# 37. CERTIFICATE SCREEN

Certificate page should visually resemble a document-management workspace rather than another dashboard.

```text
CERTIFICATES

Search...
[ English ] [ हिन्दी ] [ Bilingual ]

12 verified certificates

┌──────────┐ ┌──────────┐ ┌──────────┐
│ CERT ... │ │ CERT ... │ │ CERT ... │
└──────────┘ └──────────┘ └──────────┘
```

---

# 38. REPORT PREVIEW

Use a centered page metaphor:

```text
                 ┌───────────────────┐
                 │ OFFICIAL REPORT   │
                 │                   │
                 │ Certificate No.   │
                 │                   │
                 │ Instrument        │
                 │                   │
                 │ Test results      │
                 │                   │
                 │       QR          │
                 │                   │
                 └───────────────────┘
```

Outside the document:

```text
[ Download PDF/A ]
[ Download DOCX ]
```

---

# 39. EXCEL AUDITOR POLISH

Make the first screen answer:

```text
WHAT DID WE FIND?
```

not:

```text
UPLOAD FILE
```

After benchmark:

```text
31 observations
2 discrepancies
1 potential false PASS
```

Then evidence.

That is much stronger in a demo.

---

# 40. SCALE BRIDGE POLISH

The live weight is the hero.

Everything else supports it.

```text
10.005 kg
STABLE

Capture Reading
```

Then:

```text
connection
protocol
WELMEC
serial logs
```

Do not let the serial terminal become visually larger than the weight display.

---

# 41. JURY ASSISTANT POLISH

The assistant should feel like a **quiet presenter control**, not a second application.

Collapsed:

```text
🎬 Jury Demo
08:42
```

Expanded:

```text
STEP 04 / 10
Eccentricity

"Now we show how corner loading
is evaluated visually."

[ Previous ] [ Next Step → ]
```

That's enough.

---

# 42. ACCESSIBILITY PASS

Audit every interactive component.

Need:

```text
keyboard focus
visible focus ring
Enter activation
Escape modal close
label + input association
button name
tooltip not required for essential information
```

Important status should not exist only through color.

---

# 43. KEYBOARD FLOW

Especially test:

```text
Login
→ navigation
→ intake
→ form
→ testing table
→ comment drawer
→ review
→ sign modal
```

A keyboard user should never become trapped.

---

# 44. TOUCH TARGETS

Buttons should be comfortably tappable.

Avoid:

```text
tiny 20px icon buttons
```

For important actions:

```text
min-height ~40px
```

For observation-row controls, provide enough spacing to avoid accidental interaction.

---

# 45. MOBILE STRATEGY

Don't attempt to reproduce the desktop application exactly.

Mobile should prioritize:

```text
status
result
next action
```

and move:

```text
technical evidence
secondary metadata
audit details
```

into drawers/accordions.

---

# 46. URL / ROUTE CONSISTENCY

Make routes predictable:

```text
/
 /sessions
 /instruments
 /sessions/:sessionId
 /sessions/:sessionId/readiness
 /sessions/:sessionId/test-plan
 /sessions/:sessionId/physical
 /sessions/:sessionId/weighing
 /sessions/:sessionId/eccentricity
 /sessions/:sessionId/repeatability
 /sessions/:sessionId/environment
 /sessions/:sessionId/review
 /sessions/:sessionId/certificate

 /review
 /standards
 /audit
 /reports
 /scale-bridge
 /excel-auditor
```

The important rule:

> A browser refresh must preserve the user's current conceptual location.

---

# 47. BREADCRUMBS

Use:

```text
Sessions / AV-2026-8812 / Weighing
```

not:

```text
Home / Page 3 / Test / Form
```

The hierarchy should describe the actual task.

---

# 48. URL + SESSION STATE

If the user is on:

```text
/sessions/vs-00184/weighing
```

and refreshes:

```text
→ same session
→ same test
→ same selected observation
```

where appropriate.

Avoid returning them to Home.

---

# 49. DEMO RESET

Create a global safe reset:

```text
Scenario
→ Reset Demo
```

with:

```text
Reset current scenario?

This restores synthetic data to its
original demo state.

[ Cancel ] [ Reset Demo ]
```

Don't reset the whole application accidentally.

---

# 50. SCENARIO SWITCHER

Since the source specifies five synthetic stress cases and one-click scenario loading, the launcher should behave like a controlled demo laboratory. `Pasted markdown(20261004-065148).md`

```text
DEMO SCENARIOS

✓ Standard Class III Retail
○ Rounding Discrepancy Trap
○ Temperature Drift Failure
○ Eccentricity Corner Failure
○ Class I High Precision
```

Each with:

```text
Expected outcome
Primary lesson
```

Example:

```text
ROUNDING DISCREPANCY TRAP

Lesson
Legacy rounded calculation can conceal
a boundary failure.

Expected
✕ FAIL
```

---

# 51. ONE GLOBAL SEARCH PATTERN

Don't create five unrelated search UIs.

Use consistent:

```text
Search sessions...
Search instruments...
Search certificates...
```

with the same:

```text
icon
height
border
placeholder style
focus behavior
clear button
```

---

# 52. ONE FILTER PATTERN

Always:

```text
[ Filter ]
```

opens:

```text
Status
Class
Stage
Date
```

rather than different filter designs on every page.

---

# 53. TOOLTIP RULE

Tooltips should explain:

```text
technical abbreviation
icon with ambiguous meaning
advanced calculation
```

Not:

```text
Submit
Cancel
Home
```

Basic actions should already be obvious.

---

# 54. ADVANCED TECHNICAL DETAILS

Put this in drawers:

```text
OIML formula
raw values
turning point
hash
protocol packet
firmware metadata
calculation trace
```

This preserves the project's progressive-disclosure strategy. `Pasted markdown(20261004-065148).md`

---

# 55. DESIGN SYSTEM CLEANUP

Now audit every component for duplicate implementations.

You should have exactly one reusable:

```text
Button
Input
Select
Badge
StatusBadge
Card
Modal
Drawer
Tooltip
Toast
DataTable
EmptyState
LoadingState
```

Don't allow:

```text
ReviewButton
TestingButton
CertificateButton
CustomBlueButton
```

unless they genuinely have different semantics.

---

# 56. GLOBAL TOKEN FILE

Create one source of truth:

```text
src/styles/tokens.css
```

and map:

```text
--color-bg
--color-surface
--color-border
--color-text
--color-muted

--color-primary

--color-pass
--color-fail
--color-warning
--color-pending
--color-locked
```

All components consume tokens.

---

# 57. REMOVE VISUAL INCONSISTENCIES

Look specifically for:

```text
different blue buttons
different border radii
different green colors
different font sizes
different spacing
different table headers
different modal paddings
different empty states
```

These small inconsistencies make AI-built apps look obviously AI-built.

---

# 58. MICROCOPY PASS

Replace generic system language.

Bad:

```text
Submit
Process
Execute
Data
Record
```

Better:

```text
Submit for Review
Run Benchmark
Capture Reading
Verification Record
Test Evidence
```

Your product language should stay domain-specific without becoming technical jargon.

---

# 59. HOME PAGE FINAL POLISH

Top:

```text
Good morning

Verification laboratory overview

[ Register Instrument ]
```

Then:

```text
Active Verifications
Pending Review
Approved Today
Attention Required
```

Then:

```text
Recent Sessions
```

Then:

```text
Compliance Overview
```

Then:

```text
Quick Start Scenarios
```

The source defines KPI cards, recent sessions and compliance overview as the core dashboard structure. `Pasted markdown(20261004-065148).md`

---

# 60. SESSION LIST FINAL POLISH

Every session should have:

```text
instrument
serial
class
stage
status
progress
next action
```

The most important column:

```text
NEXT ACTION
```

Example:

```text
Continue Testing →
Review Session →
Sign Certificate →
View Certificate
```

That makes the system operational rather than merely informational.

---

# 61. INSTRUMENT LIST FINAL POLISH

Use:

```text
Manufacturer + Model
Serial
Class
Capacity
Current Session
Status
```

Click:

```text
→ detail drawer
```

Keep deep information inside the drawer.

---

# 62. STANDARDS PAGE FINAL POLISH

Make the user immediately see:

```text
✓ 8 standard sets valid
⚠ 1 expires soon
✕ 0 expired
```

Then registry table.

If expired:

```text
LOCKOUT
Testing unavailable until a valid
standard weight set is selected.
```

The source explicitly specifies the hard lockout behavior for expired standard weights. `Pasted markdown(20261004-065148).md`

---

# 63. FINAL PERFORMANCE PASS

The application should feel immediate.

Optimize:

```text
route-level lazy loading
large chart components
SVG rendering
table rendering
scenario data
memoized calculations
```

Do not load every specialist tool into the first bundle.

---

# 64. DON'T FAKE PERFORMANCE

Avoid:

```text
500ms "processing"
2-second "signing"
4-second "analysis"
```

unless the underlying work genuinely requires it.

A premium UI feels fast.

---

# 65. OFFLINE UX

The source targets both a modern web SPA and a Tauri desktop application capable of offline laboratory operation. `Pasted markdown(20261004-065148).md`

Therefore design the UI for:

```text
ONLINE
SYNCING
OFFLINE
```

Header:

```text
● Online
```

Syncing:

```text
↻ Syncing local changes...
```

Offline:

```text
○ Offline
Local work continues
```

Do not display a broken-looking cloud error.

---

# 66. OFFLINE SESSION WARNING

When offline:

```text
OFFLINE MODE

Changes are being stored locally.
They will synchronize when connectivity returns.

[ View Sync Status ]
```

Keep this informative, not alarming.

---

# 67. TAURI-READY FRONTEND RULE

Even if you are not packaging Tauri now, avoid browser-only assumptions outside the hardware integration boundary.

Keep:

```text
business logic
UI state
domain calculations
```

independent of:

```text
browser storage
WebSerial
Tauri APIs
```

The source explicitly targets both browser and Tauri runtimes. `Pasted markdown(20261004-065148).md`

---

# 68. FINAL JUDGE TEST - 10 SCREENS

Open these without explanation:

```text
01 Home
02 Sessions
03 Intake
04 Readiness
05 Weighing
06 Eccentricity
07 Review
08 Director Sign
09 Audit
10 Certificate
```

For each, write one sentence:

> "What does this screen tell me?"

If your answer takes more than one sentence, simplify the screen.

---

# 69. FINAL JUDGE TEST - VISUAL SCAN

At 100% zoom ask:

```text
Where does my eye go first?
```

It should be:

```text
Page purpose
→ result
→ action
```

not:

```text
logo
→ sidebar
→ decorative card
→ random metric
→ page title
```

---

# 70. FINAL JUDGE TEST - ROLE SWITCHING

Run:

```text
METROLOGIST
↓
REVIEWER
↓
DIRECTOR
↓
AUDITOR
```

Look for obvious UI changes.

Metrologist:

```text
editable
capture
submit
```

Reviewer:

```text
audit
comment
approve
remand
```

Director:

```text
authorize
sign
stamp
```

Auditor:

```text
read-only
audit
certificate
```

The source explicitly defines this role separation and permission behavior. `Pasted markdown(20261004-065148).md`

---

# 71. FINAL JUDGE TEST - IMMUTABILITY

Sign one session.

Then switch roles.

Try:

```text
edit observation
delete observation
change instrument
change result
change reviewer comment
```

Everything should remain read-only after approval.

The visual golden lock is not enough; the state guards must also prevent mutation.

---

# 72. FINAL JUDGE TEST - FAILURE PATH

Run:

```text
Rounding Trap
```

Expected UX:

```text
✕ FAIL
↓
show problematic observation
↓
show calculation proof
↓
reviewer flag
↓
director cannot sign invalid workflow
```

The project's synthetic rounding trap specifically exists to demonstrate a legacy spreadsheet false PASS versus controlled calculation. `Pasted markdown(20261004-065148).md`

---

# 73. FINAL JUDGE TEST - SUCCESS PATH

Run:

```text
Avery Class III Retail
```

Expected:

```text
Preset
↓
Readiness
↓
Testing
↓
Review
↓
Director
↓
Green Seal
↓
Immutable
↓
Certificate
```

You should be able to demo that without manually manipulating internal state.

---

# 74. FINAL JUDGE TEST - HARD LOCKOUT

Expire standard weights in the demo.

Expected:

```text
RED LOCKOUT
```

everywhere testing is blocked.

The source specifically requires the warning to be un-dismissible and input to be disabled across test screens. `Pasted markdown(20261004-065148).md`

---

# 75. FINAL JUDGE TEST - JURY MODE

Open:

```text
Jury Assistant
```

Then repeatedly:

```text
Next Step →
Next Step →
Next Step →
```

The application should navigate itself through the planned story.

The source explicitly defines this synchronized walkthrough behavior. `Pasted markdown(20261004-065148).md`

---

# 76. FINAL CODE CLEANUP

Before declaring the UI finished:

```text
remove console.logs
remove dead components
remove unused imports
remove duplicate CSS
remove fake placeholder buttons
remove lorem ipsum
remove "Coming Soon" where unnecessary
remove unfinished dialogs
```

Every visible button should do something meaningful.

---

# 77. FINAL COMPONENT TREE

At the end, your frontend should roughly look like:

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── components/
│   ├── layout/
│   └── ui/
│
├── context/
│   ├── LabContext.tsx
│   ├── ScenarioContext.tsx
│   ├── IoTContext.tsx
│   └── ThemeContext.tsx
│
├── domain/
│   ├── calculations/
│   ├── guards/
│   ├── selectors/
│   ├── state/
│   └── repositories/
│
├── features/
│   ├── dashboard/
│   ├── instruments/
│   ├── sessions/
│   ├── testing/
│   ├── review/
│   ├── audit/
│   ├── reports/
│   ├── iot/
│   └── ingestion/
│
├── demo/
│   └── JuryDemoAssistant.tsx
│
└── styles/
    ├── tokens.css
    └── globals.css
```

---

# 78. PHASE 8 MASTER CODING PROMPT

```text
PHASE 8 - FINAL UX POLISH AND PRODUCTION-QUALITY FRONTEND

The application is functionally complete.

Do NOT add new business functionality.

Your task is to make the entire frontend visually consistent,
responsive, accessible, fast, and judge-ready.

==================================================
1. GLOBAL VISUAL SYSTEM
==================================================

Enforce one design system across every route.

Use existing tokens for:

background
surface
border
text
muted text
primary
PASS
FAIL
WARNING
PENDING
LOCKED

Use:

Inter for UI
IBM Plex Mono for technical values

Use tabular numerals.

==================================================
2. PAGE HIERARCHY
==================================================

Every page must follow:

breadcrumb
page title
purpose sentence
primary status/result
primary action
supporting evidence
technical details

Remove unnecessary decorative sections.

==================================================
3. CARD HIERARCHY
==================================================

Limit each page to a small number of meaningful
primary/supporting cards.

Do not nest cards excessively.

==================================================
4. STATUS LANGUAGE
==================================================

Standardize:

PASS
FAIL
MARGINAL
PENDING
APPROVED
REMANDED
IMMUTABLE
LOCKED OUT

Avoid synonyms that create semantic ambiguity.

==================================================
5. NAVIGATION
==================================================

Make sidebar responsive.

Desktop:
expanded sidebar

Tablet:
collapsible sidebar

Mobile:
drawer

Preserve route/session context on refresh.

==================================================
6. SESSION HEADER
==================================================

Keep instrument identity and step progress
consistently visible during active verification.

Do not duplicate session context across pages.

==================================================
7. RESPONSIVE TABLES
==================================================

Desktop:
structured columns

Tablet:
compact columns

Mobile:
convert important rows into stacked information blocks.

Never force unusably wide tables.

==================================================
8. FORMS
==================================================

Maintain small logical cards.

Maximum approximately 4-6 primary fields per card.

Use immediate inline validation.

==================================================
9. BUTTON DISCIPLINE
==================================================

One visually dominant CTA per page.

Secondary actions should be visually weaker.

Dangerous/destructive actions use danger styling.

==================================================
10. LOADING
==================================================

Every async view needs contextual skeleton/loading state.

Do not show blank pages.

Avoid unnecessary artificial delays.

==================================================
11. ERROR STATES
==================================================

Provide:

field errors
page warnings
toasts
empty states

Errors must explain how to recover.

==================================================
12. MODALS / DRAWERS
==================================================

Use:

small modal → confirmation
medium modal → form
large modal → technical proof
drawer → audit/comments/details

Support:
Escape
focus management
keyboard navigation

==================================================
13. ACCESSIBILITY
==================================================

Audit:

labels
keyboard navigation
focus indicators
button names
modal traps
color-independent status
contrast
touch targets

==================================================
14. TESTING VISUALS
==================================================

Prioritize human interpretation:

result
evidence
technical proof

Preserve:

error corridor
eccentricity heatmap
repeatability scatter
spirit bubble
guilloche seal

Do not let technical graphics dominate the answer.

==================================================
15. REVIEW / SIGNING
==================================================

Reviewer:
comment
approve
remand

Director:
authorization
PIN
declaration
sign
stamp

Approved:
immutable
read-only
golden lock

==================================================
16. HARD LOCKOUT
==================================================

Expired standards must visibly block
test inputs and test actions.

==================================================
17. SCALE BRIDGE
==================================================

Keep:

live weight
stable state
capture
connection state

as the primary focus.

Keep serial logs and technical telemetry secondary.

==================================================
18. EXCEL AUDITOR
==================================================

Make the first result:

observations analyzed
discrepancies
false passes
false fails

not merely the uploaded file name.

==================================================
19. CERTIFICATES
==================================================

Make certificate cards and document previews
look formal and document-oriented.

Actions:

PDF/A
DOCX
Verify

==================================================
20. JURY ASSISTANT
==================================================

Keep the assistant visually subtle.

Ensure Next Step:

changes demo step
changes route
changes sidebar state
highlights target
updates presenter cue

==================================================
21. OFFLINE STATES
==================================================

Support UI states:

ONLINE
SYNCING
OFFLINE

Make offline mode informative,
not visually alarming.

==================================================
22. PERFORMANCE
==================================================

Lazy-load specialist screens.

Memoize expensive calculations.

Optimize large SVGs.

Avoid unnecessary rerenders.

==================================================
23. CLEANUP
==================================================

Remove:

unused imports
dead components
placeholder text
fake buttons
unfinished interactions
duplicate styles
console logs

==================================================
24. FINAL ACCEPTANCE TEST
==================================================

Test:

Home
Sessions
Instruments
Intake
Readiness
Test Plan
Physical
Weighing
Eccentricity
Repeatability
Environment
Review
Director Sign
Audit
Certificates
Scale Bridge
Excel Auditor
Jury Assistant

Then test all roles:

Metrologist
Reviewer
Director
Auditor
Admin

Then test:

PASS
FAIL
REMANDED
APPROVED
LOCKED OUT
OFFLINE

Nothing should visually break.

==================================================
STOP CONDITION
==================================================

Do not add another major feature.

The application should now feel like
one coherent professional laboratory system,
not a collection of independently generated pages.
```

---

# 79. FINAL QUALITY BAR

After Phase 8, your standard should be:

```text
NOT:
"Does the page work?"

BUT:
"Does the page communicate?"
```

And:

```text
NOT:
"Does it look impressive?"

BUT:
"Does it look trustworthy?"
```

And:

```text
NOT:
"Can the judge find the feature?"

BUT:
"Does the feature reveal itself naturally?"
```

That distinction is exactly what will help your frontend avoid the **messy AI-generated dashboard look** you were trying to get away from.

---

# PHASE 9 - RELEASE ENGINEERING

After this visual pass, the next stage should no longer be UI design. It should be the **release layer**: frontend build validation, route/state regression testing, demo-data integrity, offline behavior, browser/Tauri runtime separation, production build, and the final hackathon-demo setup. The source explicitly targets both a Vite SPA and a Tauri desktop runtime, including offline laboratory operation. `Pasted markdown(20261004-065148).md`

## Prompt:
10/4/2026, 7:02:24 PM

next

## Response:
10/4/2026, 7:02:36 PM · gpt-5-6-t-mini

> **Searched source-dependent Phase Nine materials**
>
> 
>
> Worked for 6s

# PHASE 9 - RELEASE ENGINEERING, REGRESSION TESTING & DEMO HARDENING

At this point, **stop adding UI features**.

Phase 9 is about making sure the complete METROLOGIX-76 experience behaves like **one reliable application under a live hackathon demo**.

Your source explicitly targets both a browser-based Vite SPA and a Tauri desktop application for offline laboratory work, while keeping the project frontend-only. `Pasted markdown(20261004-065148).md`

So the goal now is:

```text
BUILD
  ↓
VERIFY
  ↓
BREAK INTENTIONALLY
  ↓
FIX
  ↓
FREEZE DEMO STATE
  ↓
SHIP
```

---

# 1. THE PHASE 9 MENTAL MODEL

You should now treat the application as five layers:

```text id="c49j6a"
┌─────────────────────────────────────────────┐
│ 1. VISUAL LAYER                             │
│ pages / components / responsive UI           │
├─────────────────────────────────────────────┤
│ 2. WORKFLOW LAYER                           │
│ session state / transitions / permissions    │
├─────────────────────────────────────────────┤
│ 3. DOMAIN LAYER                             │
│ calculations / compliance / test results     │
├─────────────────────────────────────────────┤
│ 4. DEMO LAYER                               │
│ scenarios / simulator / jury walkthrough     │
├─────────────────────────────────────────────┤
│ 5. RUNTIME LAYER                            │
│ Vite browser / offline desktop              │
└─────────────────────────────────────────────┘
```

A bug in one layer should not silently corrupt the others.

---

# 2. FREEZE THE DOMAIN CONTRACT

Before release, freeze the central TypeScript contracts.

Your source already defines the major domain enums and models such as:

```text id="6b1a2b"
AccuracyClass
VerificationStage
ReviewStatus
ComplianceStatus
UserRole
UserProfile
Laboratory
ObservationRow
RowAuditComment
```

`Pasted markdown(20261004-065148).md`

Do not keep inventing ad-hoc object shapes in individual pages.

Create:

```text id="q4otz5"
src/domain/types/
├── instrument.ts
├── session.ts
├── observation.ts
├── review.ts
├── audit.ts
├── certificate.ts
├── iot.ts
└── demo.ts
```

---

# 3. CENTRAL SESSION AGGREGATE

Everything must revolve around one session object.

```typescript id="z9ty2h"
interface VerificationSession {
  id: string;
  sessionNumber: string;

  instrumentId: string;

  verificationStage: VerificationStage;
  reviewStatus: ReviewStatus;
  complianceStatus: ComplianceStatus;

  readiness: TestReadiness;
  testPlan: TestPlan;

  physicalInspection: PhysicalInspectionResult;
  weighing: WeighingTestResult;
  eccentricity: EccentricityResult;
  repeatability: RepeatabilityResult;
  environment: EnvironmentResult;

  reviewer?: ReviewDecision;
  directorSignature?: DirectorSignature;
  certificate?: CertificateRecord;

  traceability: TraceabilityState;

  auditEvents: AuditEvent[];

  createdAt: string;
  updatedAt: string;
}
```

The exact implementation can evolve, but the architectural rule is:

> **One session, one source of truth.**

---

# 4. STATE MACHINE TEST

Don't test pages independently.

Test transitions.

```text id="un3qnv"
DRAFT
 ↓
IN_TESTING
 ↓
PENDING_REVIEW
 ↓
DIRECTOR_SIGN_OFF
 ↓
APPROVED
 ↓
IMMUTABLE
```

And:

```text id="7w8q7u"
PENDING_REVIEW
 ↓
REMANDED
 ↓
IN_TESTING
 ↓
PENDING_REVIEW
```

The source defines the principal review statuses including `DRAFT`, `IN_TESTING`, `PENDING_REVIEW`, `APPROVED`, and `REMANDED`. `Pasted markdown(20261004-065148).md`

---

# 5. GUARDS

Create central guards instead of hiding permission logic inside buttons.

```typescript id="kqf6g7"
canEditSession(session, user)
canSubmitForReview(session, user)
canReview(session, user)
canRemand(session, user)
canApprove(session, user)
canSignCertificate(session, user)
canModifyApprovedSession(session, user)
canAccessScaleBridge(user)
canRunExcelAudit(user)
```

Then:

```text id="4u3f1w"
Button visibility
        ↓
guard
        ↓
action handler
        ↓
state mutation
```

Do not depend only on disabled UI.

---

# 6. APPROVED = HARD IMMUTABILITY

This is one of your most important release tests.

The source explicitly states that once a session becomes `APPROVED`, its inputs are permanently disabled and a golden padlock appears. `Pasted markdown(20261004-065148).md`

Test all possible mutation paths:

```text id="fiyv9z"
Observation edit
Observation delete
Instrument edit
Test result edit
Comment edit
Review decision edit
Environment edit
Traceability edit
```

All must reject mutation.

---

# 7. ROLE REGRESSION MATRIX

Create one test matrix.

| Feature | Metrologist | Reviewer | Director | Auditor | Admin |
|---|---|---|---|---|---|
| Register instrument | ✓ | - | - | - | ✓ |
| Enter observations | ✓ | Read-only | Read-only | Read-only | - |
| Add audit comment | - | ✓ | - | - | - |
| Remand | - | ✓ | - | - | - |
| Approve review | - | ✓ | - | - | - |
| Sign certificate | - | - | ✓ | - | - |
| View audit trail | ✓ | ✓ | ✓ | ✓ | ✓ |
| View certificates | ✓ | ✓ | ✓ | ✓ | ✓ |

The source's role model gives these permission boundaries, particularly Reviewer comments/approval, Director signing and permanent locking, and Auditor read-only inspection. `Pasted markdown(20261004-065148).md`

---

# 8. LOGIN / ROLE SWITCHER TEST

The source intentionally includes a live role switcher for demonstration. `Pasted markdown(20261004-065148).md`

So test:

```text id="q9ewq5"
Metrologist
   ↓
Reviewer
   ↓
Director
   ↓
Auditor
```

without losing:

```text id="l7sy4w"
active session
current route
scenario
selected observation
```

---

# 9. SCENARIO REGRESSION SUITE

You already have five synthetic scenarios.

Treat them as your built-in QA suite:

```text id="3r7qj2"
01 Standard Class III Retail
02 Rounding Discrepancy Trap
03 Temperature Span Drift Fail
04 Eccentricity Cantilever Twist
05 High-Interval Class I Analytical
```

The source explicitly defines five synthetic scenarios, including the rounding, thermal drift, eccentricity, and high-precision cases. `Pasted markdown(20261004-065148).md`

---

# 10. PASS SCENARIO

Run:

```text id="k8an5z"
Standard Class III Retail
```

Expected:

```text id="8r9hqr"
tests → PASS
review → approve
director → sign
certificate → generated
session → immutable
```

This becomes your **golden happy path**.

---

# 11. ROUNDING TRAP REGRESSION

Run:

```text id="xew4ar"
Rounding Discrepancy Trap
```

Expected:

```text id="6z5fyv"
Legacy:
PASS

Controlled:
FAIL
```

This specific scenario exists in the source to expose a rounded spreadsheet false PASS versus the unrounded controlled result. `Pasted markdown(20261004-065148).md`

This should never accidentally become PASS after a refactor.

---

# 12. TEMPERATURE FAILURE REGRESSION

Run:

```text id="1yfw5v"
Temperature Span Drift Fail
```

Expected:

```text id="3q2p0h"
+20°C → PASS
+40°C → FAIL
```

The source explicitly defines this as the thermal non-compliance scenario. `Pasted markdown(20261004-065148).md`

---

# 13. ECCENTRICITY FAILURE REGRESSION

Run:

```text id="ktgy85"
Eccentricity Cantilever Twist
```

Expected:

```text id="icrwv4"
Center        ✓
Corner 1      ✓
Corner 2      ✓
Corner 3      ✓
Corner 4      ✕
```

The source's scenario identifies Corner 4 at `-6.2 g` as the failing hotspot. `Pasted markdown(20261004-065148).md`

---

# 14. CLASS I PRECISION REGRESSION

Run:

```text id="xbo0bj"
High-Interval Class I Analytical
```

Expected:

```text id="ki1jor"
120 g capacity
0.001 g interval
high division count
PASS
```

This validates that your number formatting and calculations don't collapse under high precision.

---

# 15. CALCULATION GOLDEN TESTS

Do not only test the UI.

Test deterministic domain functions separately.

For example:

```typescript id="b8n36v"
calculateTurningPoint(...)
calculateError(...)
calculateCorrectedError(...)
calculateCompliance(...)
calculateSpread(...)
```

For every synthetic observation:

```text id="0wdnz5"
input
→ expected output
```

This is especially important because the source's observation model explicitly stores target load, scale reading, turning point, error, corrected error, MPE and status. `Pasted markdown(20261004-065148).md`

---

# 16. ROUNDING SAFETY

This needs a dedicated regression rule:

```text id="c4g4mj"
DISPLAY ROUNDING
≠
CALCULATION ROUNDING
```

For example:

```text id="5osz1p"
internal:
-5.3 g

display:
-5 g

decision:
FAIL because -5.3 exceeds -5.0
```

Don't allow presentation formatting to mutate the underlying numeric result.

---

# 17. UNITS TEST

Test:

```text id="xso9m6"
g
kg
```

and high-precision values.

Ensure:

```text id="yofcaz"
conversion
display precision
calculation precision
```

remain separate concerns.

---

# 18. TRACEABILITY LOCKOUT TEST

The source requires an explicit hard lockout when standard weights are expired. `Pasted markdown(20261004-065148).md`

Test:

```text id="t4c5gr"
valid standard
→ testing enabled
```

then:

```text id="d4z6kn"
expired standard
→ testing blocked
```

Verify:

```text id="8p2tlo"
input disabled
capture disabled
continue disabled
lockout visible
```

---

# 19. REVIEW REGRESSION

Test:

```text id="u06uwc"
Submit
↓
Reviewer opens queue
↓
Select session
↓
Open row
↓
Add FLAG
↓
Approve
```

Then verify the comment is visible in:

```text id="k7y3fr"
row
review summary
audit trail
```

The source explicitly defines row-level comments with severity, author, role, timestamp and resolved state. `Pasted markdown(20261004-065148).md`

---

# 20. REMAND REGRESSION

Try:

```text id="d43f3y"
Remand
```

with an empty reason.

Expected:

```text id="1cgn2t"
✕ Reason required
```

Then provide a reason.

Expected:

```text id="sggqvx"
REMANDED
```

and:

```text id="8rq5e9"
audit event created
history preserved
```

---

# 21. DIRECTOR SIGNING REGRESSION

Test invalid states:

```text id="bi1bbz"
no reviewer approval
no declaration
invalid PIN
wrong role
already approved
```

Each must be rejected appropriately.

Then successful path:

```text id="n5o4ej"
valid reviewer state
+
Director
+
valid PIN
+
declaration
=
SIGNED
```

---

# 22. SIGNING CONSISTENCY TEST

After signing, compare:

```text id="qt8u4f"
Director modal digest
        =
Green seal digest
        =
Audit event digest
        =
Certificate digest
```

One session should produce one persisted certificate identity and digest.

---

# 23. QR CONSISTENCY

The same certificate identity should power:

```text id="3xv7fe"
certificate ID
QR
verification URL
certificate preview
repository card
```

No page should generate its own unrelated QR payload.

---

# 24. CERTIFICATE DOWNLOAD TEST

For each language mode:

```text id="l9y7z2"
English
Hindi
Bilingual
```

verify:

```text id="g1y6w6"
preview
download action
language state
certificate identity
```

remain synchronized.

The source specifies those three language modes and PDF/A/DOCX outputs. `Pasted markdown(20261004-065148).md`

---

# 25. SCALE BRIDGE REGRESSION

Test simulator:

```text id="b3bl2e"
CAS
Mettler SICS
Avery SMA
```

For each:

```text id="l6qf0u"
connect
packet received
weight updates
stability updates
capture
observation updated
```

The source defines these protocols and the live IoT state/actions. `Pasted markdown(20261004-065148).md` `Pasted markdown(20261004-065148).md`

---

# 26. PHYSICAL HARDWARE FALLBACK

Don't let a missing physical scale break the app.

Expected:

```text id="w9h8cj"
Physical scale unavailable

Use Virtual Scale Simulator
```

This is particularly important during your hackathon presentation.

---

# 27. EXCEL AUDITOR REGRESSION

Run:

```text id="l5agw6"
benchmark demo
```

Expected:

```text id="n1l3s0"
observations analyzed
discrepancies
false pass
false fail
```

Then:

```text id="s1j1d1"
click discrepancy
→ calculation drawer
```

The source defines the benchmark workflow and four auditor tabs. `Pasted markdown(20261004-065148).md`

---

# 28. JURY ASSISTANT REGRESSION

This deserves its own test because it controls navigation.

```text id="c0gk49"
Open Jury
↓
Play
↓
Next
↓
Next
↓
Next
```

Verify all three update together:

```text id="v3c6s7"
Jury step
sidebar route
active page
```

The source explicitly requires `Next Step` to advance the timer and automatically switch the active sidebar tab. `Pasted markdown(20261004-065148).md`

---

# 29. DEMO RESET REGRESSION

After a dramatic demo:

```text id="7o9j4o"
FAIL scenario
→ Reset
```

Expected:

```text id="k0c3jc"
original scenario state restored
```

No stale:

```text id="w8fb0q"
comments
hashes
review state
certificate
```

should remain unless intentionally part of the scenario.

---

# 30. REFRESH TEST

For every important route:

```text id="s5tn4i"
open
→ refresh browser
```

Verify the application doesn't lose the meaningful session context.

Especially:

```text id="pqn36l"
active session
selected test
scenario
role
```

---

# 31. NETWORK INTERRUPTION TEST

Because the source specifies ONLINE / local-syncing / OFFLINE states, test transition behavior. `Pasted markdown(20261004-065148).md`

```text id="r3n9iq"
ONLINE
 ↓
OFFLINE
 ↓
work continues locally
 ↓
SYNCING
 ↓
ONLINE
```

The interface should communicate the current state without making the application appear broken.

---

# 32. BROWSER RUNTIME

The source targets a Vite SPA and identifies browser-native WebSerial for direct scale streaming. `Pasted markdown(20261004-065148).md`

Your runtime split should therefore be:

```text id="kjde4d"
Core application
→ browser-safe

WebSerial
→ capability adapter

Tauri APIs
→ capability adapter
```

Do not let core domain calculations depend directly on browser APIs.

---

# 33. Tauri BOUNDARY

Keep Tauri-specific logic isolated:

```text id="4s8tdd"
src/
└── platform/
    ├── browser/
    └── tauri/
```

For example:

```typescript id="k8u7ts"
interface ScaleTransport {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  send(command: string): Promise<boolean>;
  onPacket(handler: (packet: string) => void): () => void;
}
```

Then:

```text id="qb5lx4"
WebSerialScaleTransport
TauriScaleTransport
```

can implement it independently.

This keeps the frontend architecture aligned with the source's two-runtime target. `Pasted markdown(20261004-065148).md`

---

# 34. BUILD VALIDATION

Before demo day:

```text id="a8l3me"
npm install
npm run lint
npm run typecheck
npm run build
```

Then actually test the generated production build.

Don't assume development mode means production mode works.

---

# 35. NO BUILD WARNINGS THAT MATTER

Fix:

```text id="r6flq6"
TypeScript errors
missing imports
invalid routes
broken dynamic imports
unhandled promise rejections
```

Warnings that are genuinely irrelevant can remain, but don't ship with a console full of red errors.

---

# 36. CONSOLE CLEANLINESS

Open DevTools.

Target:

```text id="c8weq9"
0 uncaught exceptions
0 repeated error spam
0 failed route requests
0 broken asset paths
```

Especially during the full demo journey.

---

# 37. ERROR BOUNDARY

Add a global React error boundary.

Instead of a completely broken screen:

```text id="v7ll2y"
Something went wrong

The current workspace could not be rendered.

[ Return to Home ]
[ Reload Workspace ]
```

Keep the error boundary visually consistent with the product.

---

# 38. ROUTE FALLBACK

Unknown route:

```text id="99s7kg"
Page not found

The requested workspace doesn't exist.

[ Go to Home ]
```

Never leave a blank viewport.

---

# 39. PRODUCTION DATA POLICY

Before demo:

```text id="2dx3un"
remove accidental real-looking personal information
remove real credentials
remove real PINs
remove real API keys
remove private files
```

Your source uses synthetic/demo datasets for demonstrations, so keep the demo environment synthetic. `Pasted markdown(20261004-065148).md`

---

# 40. DEMO PIN SAFETY

The source explicitly includes a demo PIN of `7620` for the signing flow. `Pasted markdown(20261004-065148).md`

Keep:

```text id="2m8goo"
DEMO MODE
Load Demo PIN
```

visibly separated from a production authorization mechanism.

Do not present the demo credential as a real institutional security credential.

---

# 41. "DEMO MODE" INDICATOR

Since the application includes synthetic scenarios and a simulator, make demo mode obvious:

```text id="n7csx0"
DEMO MODE
```

Use a restrained badge in the header.

When enabled:

```text id="7c2t6h"
Scenario
Virtual Scale
Demo PIN
```

are clearly marked.

---

# 42. HACKATHON SAFE MODE

Create a presentation-safe configuration:

```text id="f9qj7e"
DEMO_MODE=true
DEFAULT_SCENARIO=standard_class_iii_retail
SIMULATOR_ENABLED=true
JURY_ASSISTANT_ENABLED=true
```

Then have:

```text id="jmv7nt"
Reset Demo
```

restore the known baseline.

---

# 43. THE GOLDEN DEMO SESSION

Create one immutable demo path that is always reproducible.

```text id="l5ar2l"
Session:
VS-DEMO-001

Instrument:
Avery ZM201

Serial:
AV-2026-8812

Class:
III

Expected:
PASS
```

Then keep separate scenario sessions for:

```text id="5il7y4"
rounding failure
temperature failure
eccentricity failure
class I precision
```

---

# 44. JUDGE DEMO CHECKPOINTS

Your presentation should have intentional checkpoints:

```text id="z1g8on"
CHECKPOINT 1
"Instrument registered"

CHECKPOINT 2
"Live weight captured"

CHECKPOINT 3
"Controlled calculation"

CHECKPOINT 4
"Reviewer assurance"

CHECKPOINT 5
"Director authorization"

CHECKPOINT 6
"Immutable record"

CHECKPOINT 7
"Certificate"
```

These can also map directly to Jury Assistant cues.

---

# 45. 3-MINUTE DEMO MODE

Create an abbreviated path:

```text id="u1m3k9"
00:00  Dashboard
00:20  Register preset
00:40  Live scale
01:00  Weighing
01:25  Rounding trap
01:55  Review
02:15  Director sign
02:35  Immutable audit
02:50  Certificate
03:00  Finish
```

This is a **presentation plan**, not a new product workflow.

---

# 46. 7-MINUTE DEMO MODE

Extended:

```text id="j4q9s1"
01 Intake
02 Readiness
03 Physical
04 Weighing
05 Eccentricity
06 Repeatability
07 Environment
08 Review
09 Scale Bridge
10 Excel Auditor
11 Sign
12 Audit
13 Certificate
```

The Jury Assistant can choose which subset to present.

---

# 47. WHAT NOT TO DEMONSTRATE

Don't waste judging time opening:

```text id="d1wc5s"
settings
raw metadata
empty pages
long forms
serial logs for 2 minutes
every field of every test
```

Use the interface to **tell the story**.

---

# 48. PRESENTATION ORDER

The strongest live narrative is:

```text id="h3g4e8"
PROBLEM
Manual / spreadsheet-heavy workflow
        ↓
SOLUTION
Guided verification system
        ↓
PROOF
Live scale
        ↓
INTELLIGENCE
Controlled recalculation
        ↓
ASSURANCE
Peer review
        ↓
AUTHORITY
Director signing
        ↓
TRUST
Immutable audit
        ↓
OUTPUT
Certificate
```

Your source itself positions the system as replacing error-prone manual Excel workflows with a guided digital process. `Pasted markdown(20261004-065148).md`

---

# 49. FINAL SCREEN FREEZE

Once the demo is stable:

```text id="d7i0x2"
NO MORE UI CHANGES
```

Create a tag/version:

```text id="1avt1f"
metrologix-demo-final
```

Then only accept:

```text id="qfk0gq"
critical bug fixes
```

during the final period.

This prevents last-minute AI-generated UI regressions.

---

# 50. RELEASE CHECKLIST

Before submission:

```text id="9vhrr9"
□ npm build succeeds
□ TypeScript clean
□ routes verified
□ role permissions verified
□ PASS scenario verified
□ FAIL scenarios verified
□ remand verified
□ signing verified
□ immutable lock verified
□ audit verified
□ certificate verified
□ scale simulator verified
□ Excel benchmark verified
□ Jury Assistant verified
□ demo reset verified
□ offline state verified
□ production assets verified
□ no broken buttons
□ no placeholder text
□ no accidental secrets
```

---

# 51. FINAL ARCHITECTURE

At this point your complete frontend architecture should be:

```text id="0x6lhj"
METROLOGIX-76
│
├── APP SHELL
│   ├── Header
│   ├── Sidebar
│   ├── Session Header
│   └── Global Overlays
│
├── CORE WORKFLOW
│   ├── Home
│   ├── Sessions
│   ├── Instruments
│   ├── Intake
│   ├── Readiness
│   ├── Test Plan
│   └── OIML Tests
│
├── ASSURANCE
│   ├── Review
│   ├── Director Sign
│   ├── Audit Trail
│   └── Immutable Record
│
├── OUTPUT
│   └── Certificates
│
├── DIFFERENTIATORS
│   ├── Scale Bridge
│   ├── Excel Flaw Auditor
│   └── Jury Assistant
│
├── DOMAIN
│   ├── calculations
│   ├── guards
│   ├── selectors
│   └── state machine
│
├── DEMO
│   ├── scenarios
│   ├── virtual scale
│   └── reset
│
└── RUNTIME
    ├── Browser / Vite
    └── Tauri
```

---

# 52. THE MOST IMPORTANT RELEASE RULE

From this point onward, judge every implementation decision against:

```text id="8d2k5t"
Does this improve:

CLARITY?
TRUST?
TRACEABILITY?
DEMO RELIABILITY?
```

If not, don't add it.

Your source's original directive is already very strong here: the frontend should remain human-understandable, avoid intimidating forms, use clear labels and status semantics, and use progressive disclosure rather than clutter. `Pasted markdown(20261004-065148).md`

---

# 53. PHASE 9 MASTER CODING PROMPT

```text id="l4h7qn"
PHASE 9 - RELEASE ENGINEERING AND DEMO HARDENING

The METROLOGIX-76 frontend is functionally and visually complete.

Do NOT add major product features.

Your job is to make the existing application deterministic,
testable, resilient and presentation-ready.

==================================================
1. FREEZE DOMAIN CONTRACTS
==================================================

Use centralized TypeScript models.

No page-specific duplicate session objects.

All screens must consume the same VerificationSession.

==================================================
2. STATE MACHINE
==================================================

Verify:

DRAFT
→ IN_TESTING
→ PENDING_REVIEW
→ DIRECTOR SIGN-OFF
→ APPROVED
→ IMMUTABLE

And:

PENDING_REVIEW
→ REMANDED
→ IN_TESTING

No invalid transitions.

==================================================
3. CENTRAL GUARDS
==================================================

Implement centralized:

canEditSession
canSubmitForReview
canReview
canRemand
canApprove
canSignCertificate
canModifyApprovedSession

Use guards both:
UI
and
action handlers.

Never rely only on hidden/disabled buttons.

==================================================
4. ROLE REGRESSION
==================================================

Test:

METROLOGIST
REVIEWER
DIRECTOR
AUDITOR
ADMIN

Verify permissions are consistent.

==================================================
5. APPROVED IMMUTABILITY
==================================================

After approval:

all inputs read-only
all mutation handlers reject writes
golden lock visible
audit remains available
certificate remains available

==================================================
6. SCENARIO REGRESSION
==================================================

Verify all five synthetic scenarios.

Standard PASS
Rounding Trap
Temperature Drift FAIL
Eccentricity FAIL
Class I Precision

Expected results must remain deterministic.

==================================================
7. CALCULATION TESTS
==================================================

Test domain functions independently.

Do not round values before compliance decisions.

Keep calculation precision independent from display precision.

==================================================
8. TRACEABILITY LOCKOUT
==================================================

Expired standard weight set:

disable testing
show lockout
prevent capture
prevent progression

Valid set:

testing enabled.

==================================================
9. REVIEW REGRESSION
==================================================

Submit
→ queue
→ comment
→ approve

and:

Submit
→ queue
→ remand
→ operator correction
→ resubmit

Preserve complete history.

==================================================
10. SIGN REGRESSION
==================================================

Reject:

wrong role
invalid PIN
missing declaration
invalid workflow state
already approved session

Accept:

Director
valid state
valid PIN
declaration checked

==================================================
11. DIGEST CONSISTENCY
==================================================

Persist one digest.

Same digest everywhere:

sign modal
seal
audit
certificate

Never regenerate random values on render.

==================================================
12. CERTIFICATE CONSISTENCY
==================================================

Certificate must consume the approved session.

Keep:
certificate ID
serial
instrument
class
result
director
timestamp
digest
QR

consistent everywhere.

==================================================
13. SCALE BRIDGE
==================================================

Test all simulator protocols.

Verify:

connection
packet stream
stable state
weight display
capture
observation update

Physical hardware absence must not break the app.

==================================================
14. EXCEL AUDITOR
==================================================

Test:

benchmark
discrepancy detection
false PASS scenario
calculation drawer
metadata extraction
invalid workbook state

==================================================
15. JURY ASSISTANT
==================================================

Test:

open
play
pause
reset
next step

Next Step must synchronize:

demo state
route
sidebar
highlight
presenter cue

==================================================
16. REFRESH / ROUTING
==================================================

Refresh every major route.

Preserve session context.

Unknown route:
show useful fallback.

==================================================
17. OFFLINE
==================================================

Verify:

ONLINE
OFFLINE
SYNCING

states.

Offline UI must remain functional for
frontend/demo workflows supported by the app.

==================================================
18. ERROR BOUNDARY
==================================================

Add a global React error boundary.

Never display a blank broken viewport.

==================================================
19. BUILD
==================================================

Run:

lint
typecheck
production build

Fix all real errors.

Verify production build manually.

==================================================
20. DEMO MODE
==================================================

Create a deterministic demo environment.

Support:

default scenario
virtual simulator
demo PIN accelerator
reset demo

Clearly label demo-only functionality.

==================================================
21. GOLDEN DEMO PATH
==================================================

Make this reproducible:

Avery preset
→ readiness
→ testing
→ live capture
→ review
→ Director sign
→ immutable record
→ audit
→ certificate

==================================================
22. FAILURE DEMO
==================================================

Make the rounding discrepancy scenario reproducible.

Show:

legacy result
controlled result
reason
final verdict

==================================================
23. FINAL CLEANUP
==================================================

Remove:

console errors
dead code
fake buttons
placeholder text
broken links
duplicate components
unfinished screens
debug labels

==================================================
24. FREEZE
==================================================

Once the full regression suite passes:

do not redesign the UI.

Only critical bug fixes are allowed.

==================================================
FINAL CONDITION
==================================================

The application must be stable enough to run a complete
live hackathon presentation without depending on
manual database edits, hidden state manipulation,
or unexplained recovery steps.
```

## PHASE 10

The next stage should be the **actual production implementation audit**: take your existing codebase file-by-file, compare it against this architecture, identify what is already implemented vs. missing vs. incorrectly implemented, and then produce a **precise coding task queue** in priority order. That is where we stop designing in the abstract and start closing the gap between your current frontend and the final METROLOGIX-76 system.

## Prompt:
10/4/2026, 7:03:40 PM

next

## Response:
10/4/2026, 7:03:49 PM · gpt-5-6-t-mini

# PHASE 10 - IMPLEMENTATION AUDIT & GAP-CLOSING PLAN

Now we move from **“what the product should be”** to:

> **“Is the codebase actually implementing that product correctly?”**

This phase is different from the previous ones.

We are no longer designing new screens. We are creating a **systematic inspection and repair process** for the existing frontend.

Your master specification is frontend-only React + TypeScript + Tailwind + Lucide, with a strong emphasis on human-readable workflows, progressive disclosure, role gates, realistic synthetic scenarios, and the OIML-oriented verification lifecycle. `Pasted markdown(20261004-065148).md`

---

# 1. THE AUDIT MENTAL MODEL

Do not inspect files randomly.

Audit in this order:

```text id="e1q7fa"
ARCHITECTURE
    ↓
DOMAIN STATE
    ↓
ROUTING
    ↓
GLOBAL SHELL
    ↓
WORKFLOW
    ↓
CALCULATIONS
    ↓
ROLE PERMISSIONS
    ↓
SPECIAL FEATURES
    ↓
VISUAL CONSISTENCY
    ↓
BUILD / RUNTIME
```

Why?

Because a beautiful page built on incorrect state architecture will still fail.

---

# 2. FIRST: CREATE AN IMPLEMENTATION SCOREBOARD

Create:

```text id="1h5m3a"
IMPLEMENTATION_STATUS.md
```

with:

```text
✅ IMPLEMENTED
🟡 PARTIALLY IMPLEMENTED
🔴 MISSING
⚠ INCORRECT
🔒 BLOCKED / DEPENDENCY
```

Then create one row for every major requirement.

Example:

| Area | Requirement | Status | File | Priority |
|---|---|---|---|---|
| Shell | Persistent session header | 🟡 | VerificationSessionHeader.tsx | P0 |
| State | Central VerificationSession | 🟡 | sessionStore.ts | P0 |
| Review | Reviewer queue | ✅ | ReviewerQueue.tsx | P1 |
| Sign | Director PIN | ✅ | DirectorSignModal.tsx | P1 |
| Audit | Immutable timeline | 🔴 | - | P1 |
| IoT | Simulator | ✅ | VirtualScaleSimulator.tsx | P1 |

This becomes your control document.

---

# 3. P0 / P1 / P2 PRIORITIES

Use only three priorities.

### P0 - System-breaking

```text
routing
state corruption
invalid calculations
permission bypass
approval/immutability
broken demo path
production build
```

### P1 - Major product behavior

```text
review
audit
certificates
IoT
Excel auditor
scenario engine
```

### P2 - Quality

```text
micro-interactions
responsive polish
visual refinements
animation
copy improvements
```

Do not spend three hours polishing button shadows while the session state can still be edited after approval.

---

# 4. AUDIT THE SOURCE TREE FIRST

Your first IDE operation should not be editing code.

Inspect:

```text id="u4seua"
src/
├── app
├── components
├── context
├── domain
├── features
├── hooks
├── lib
├── mocks
├── styles
└── types
```

Then answer:

```text id="2w91zv"
Where is global state?

Where are domain calculations?

Where are route definitions?

Where are permissions?

Where are demo scenarios?

Where are certificates generated?

Where is audit history stored?
```

If the same answer appears in five different places, you probably have architectural duplication.

---

# 5. FILE-BY-FILE AUDIT ORDER

Inspect files in this sequence.

```text id="tjztv9"
01 package.json
02 vite config
03 tsconfig
04 app entry
05 provider tree
06 router
07 global styles
08 design tokens
09 AppShell
10 Header
11 Sidebar
12 session header
13 domain models
14 contexts/stores
15 repositories
16 calculations
17 guards
18 scenario data
19 testing features
20 review features
21 audit
22 reports
23 IoT
24 Excel
25 Jury
26 runtime adapters
```

---

# 6. `package.json` AUDIT

Check:

```text id="x1apxv"
React 18+
TypeScript
Tailwind
Lucide React
Vite
testing framework if present
```

Then look for suspicious dependency inflation.

You do **not** need twenty UI libraries.

Ideal:

```text id="8kjkj1"
one UI strategy
one icon strategy
one chart strategy
one state strategy
```

Avoid having:

```text id="j2x8tn"
MUI
Chakra
Ant
shadcn
custom UI
```

all competing.

---

# 7. ENTRY POINT AUDIT

Inspect:

```text id="t2y0du"
main.tsx
App.tsx
```

The provider tree should be obvious.

Conceptually:

```tsx id="8h2y8y"
<ThemeProvider>
  <LabProvider>
    <ScenarioProvider>
      <IoTProvider>
        <Router>
          <App />
        </Router>
      </IoTProvider>
    </ScenarioProvider>
  </LabProvider>
</ThemeProvider>
```

The specification defines four major React context domains: Lab, Scenario, IoT and Theme. `Pasted markdown(20261004-065148).md`

---

# 8. ROUTER AUDIT

Make a route inventory.

You should be able to trace:

```text id="x9d2tl"
/sessions
/instruments
/sessions/:id
/sessions/:id/readiness
/sessions/:id/test-plan
/sessions/:id/physical
/sessions/:id/weighing
/sessions/:id/eccentricity
/sessions/:id/repeatability
/sessions/:id/environment
/sessions/:id/review
/sessions/:id/certificate
/review
/standards
/audit
/reports
/scale-bridge
/excel-auditor
```

Then verify:

```text id="0bm8ck"
every route renders
every route has a useful title
refresh works
unknown route works
session routes retain session identity
```

---

# 9. SHELL AUDIT

Inspect:

```text id="cf0sx8"
AppShell
Header
Sidebar
Breadcrumbs
MainViewport
SessionHeader
SessionStepper
```

The source defines the application shell with global lab/role/scenario controls and a persistent session context/stepper. `Pasted markdown(20261004-065148).md`

Check specifically:

```text id="f95zu0"
Does role switching work globally?

Does active lab persist?

Does scenario switching persist?

Does current session stay selected?

Does the stepper reflect actual state?
```

---

# 10. HEADER AUDIT

Header should contain only meaningful global controls:

```text id="g4c4td"
Lab
Role
Scenario
Live scale
Theme
Jury
User
```

The source explicitly defines these global header elements. `Pasted markdown(20261004-065148).md`

Check for header pollution:

```text id="kr66n5"
random statistics
duplicate navigation
duplicate page title
irrelevant action buttons
```

Remove them.

---

# 11. SIDEBAR AUDIT

Make sure the sidebar isn't trying to be the whole application.

Use the agreed architecture:

```text id="g9rj5w"
WORK
Home
Sessions
Instruments

ASSURANCE
Review
Standards
Audit

OUTPUT
Reports

TOOLS
Scale Bridge
Excel Auditor
```

Inside an active session:

```text id="s4th76"
Overview
Readiness
Test Plan
Physical
Weighing
Eccentricity
Repeatability
Environment
Review
Certificate
```

The source itself contains the individual domain screens and route targets. `Pasted markdown(20261004-065148).md`

---

# 12. DOMAIN TYPES AUDIT

Find every definition of:

```text id="22g0cv"
AccuracyClass
ReviewStatus
ComplianceStatus
UserRole
ObservationRow
RowAuditComment
```

There should not be conflicting versions.

The specification gives canonical definitions for these types. `Pasted markdown(20261004-065148).md`

Bad:

```typescript id="lrr4x8"
type Role = 'admin' | 'reviewer'
```

in one file, while another has:

```typescript id="nb3vqs"
type UserRole =
  | 'METROLOGIST'
  | 'REVIEWER'
  | 'DIRECTOR'
  | 'AUDITOR'
  | 'ADMIN'
```

Choose one domain contract.

---

# 13. STATE AUDIT

This is probably the most important technical inspection.

Search for:

```text id="plr8dk"
useState(...)
```

inside domain-heavy pages.

Red flag:

```typescript id="s1e8hr"
const [weighingRows, setWeighingRows] = useState(...)
```

inside the Weighing page **if the same data also lives in SessionContext**.

That creates synchronization bugs.

---

# 14. CENTRAL STATE RULE

Pages should ideally consume:

```text id="ldxx4e"
session
selectors
actions
```

rather than owning business state.

Example:

```typescript id="hbbd3d"
const session = useVerificationSession();
const rows = selectWeighingRows(session);
const updateObservation = useSessionActions().updateObservation;
```

---

# 15. CONTEXT AUDIT

For each provider ask:

```text id="x4n1y9"
What state does it own?
What actions does it expose?
Can another provider duplicate it?
Can a page bypass it?
```

The source's IoT context, for example, explicitly owns live connection, packet, weight, stability, mode, logs and simulator actions. `Pasted markdown(20261004-065148).md`

---

# 16. SELECTOR LAYER

If pages repeatedly calculate:

```text id="km9d1r"
overall status
progress
blocking issues
next step
traceability state
```

create selectors.

For example:

```typescript id="c5is4t"
selectOverallProgress(session)
selectSessionVerdict(session)
selectBlockingIssues(session)
selectCurrentStep(session)
selectNextBestAction(session)
selectTraceabilityStatus(session)
```

This prevents ten pages from implementing ten slightly different verdict algorithms.

---

# 17. CALCULATION LAYER

Find every occurrence of:

```text id="nwjg00"
nominalLoad
scaleReading
mpeLimit
turningPoint
correctedError
spread
```

inside React components.

Red flag:

```typescript id="e1j7fl"
const error = reading - target;
```

written directly in JSX/page code.

Move it to:

```text id="kbc1p9"
domain/calculations
```

The source defines an ObservationRow with explicit turning point, error, corrected error, MPE and compliance state. `Pasted markdown(20261004-065148).md`

---

# 18. DISPLAY ≠ CALCULATION

Search for:

```text id="uk9lyf"
toFixed()
round()
Math.round()
```

around compliance decisions.

This is a high-risk area.

The source intentionally includes the rounding discrepancy scenario to expose the difference between rounded legacy calculations and the controlled calculation. `Pasted markdown(20261004-065148).md`

Correct architecture:

```text id="f7e0t9"
raw numeric
  ↓
domain calculation
  ↓
compliance decision
  ↓
formatted display
```

Not:

```text id="6sm3av"
raw
↓
rounded
↓
calculate
```

---

# 19. PERMISSION AUDIT

Search:

```text id="j4jq63"
role ===
currentUser.role
isDirector
isReviewer
```

If permission logic is scattered everywhere:

```text id="xl1i7m"
ReviewPage
Header
Button
Modal
TestingPage
Certificate
```

centralize it.

The source explicitly specifies that Reviewers/Directors cannot enter observations, Metrologists cannot sign, and approved sessions become read-only. `Pasted markdown(20261004-065148).md`

---

# 20. LOOK FOR SECURITY-THEMED UI WITHOUT REAL STATE CONTROL

This is a major trap.

Bad:

```tsx id="08bfij"
<button disabled={role !== 'DIRECTOR'}>
```

but the action handler still works if called programmatically.

Better:

```typescript id="c0efgj"
assertCanSignCertificate(session, currentUser);

performSignCertificate(...);
```

The UI is the first gate.

The domain/action layer is the second.

---

# 21. APPROVED SESSION AUDIT

Search all mutation functions.

You want:

```typescript id="p9imqd"
if (session.reviewStatus === 'APPROVED') {
  throw new ImmutableSessionError();
}
```

or equivalent central guarding.

Then verify all paths use it.

---

# 22. SCENARIO AUDIT

Search:

```text id="70cr81"
loadScenario
activeScenario
scenarioId
```

Check whether the scenario actually changes:

```text id="41k2vy"
session
observations
expected results
dashboard
review
certificate
```

or merely swaps a label.

A scenario should modify the actual demonstration state.

---

# 23. PRESET AUDIT

The source provides realistic instrument presets for one-click demos. `Pasted markdown(20261004-065148).md`

For every preset:

```text id="h9yb81"
manufacturer
model
serial
approval
class
max
min
e
d
verification stage
firmware
calibration counter
status
```

must flow consistently through Intake → Session → Testing → Review.

---

# 24. INTAKE AUDIT

Check:

```text id="r8hz0p"
Preset click
→ form population
→ live validation
→ instrument registration
→ session creation
```

No manual second entry.

The source specifically calls for one-click presets and live specification validation. `Pasted markdown(20261004-065148).md`

---

# 25. READINESS AUDIT

Verify the page isn't just decorative.

It should actually inspect:

```text id="0k6q3d"
instrument readiness
traceability
test plan
environment baseline
blocking issues
```

Then:

```text id="i9j5ab"
Start Testing
```

must depend on the real checks.

---

# 26. TEST PLAN AUDIT

Ensure the applicability matrix isn't hardcoded visually while the session uses a different set of tests.

Correct:

```text id="5l47m2"
instrument
+
verification stage
+
class
↓
test plan
↓
required tests
↓
readiness
↓
testing
```

One source of truth.

---

# 27. PHYSICAL INSPECTION AUDIT

Check:

```text id="xv96cc"
photos
seal integrity
spirit bubble
visual observations
comments
status
```

Do not let the page save an overall PASS independently of the underlying checklist.

---

# 28. WEIGHING AUDIT

Verify the five-column human-readable structure from the source:

```text id="xmmcq4"
Target Load
Observed Reading
Calculated Error
Statutory Limit
Compliance
```

`Pasted markdown(20261004-065148).md`

Then technical proof should be secondary.

---

# 29. ECCENTRICITY AUDIT

Check that the visualization and table consume the same readings.

A common AI-generated bug is:

```text id="45ee4f"
table says FAIL
heatmap says PASS
```

They must derive from the same `EccentricityResult`.

---

# 30. REPEATABILITY AUDIT

Check:

```text id="x2y0h1"
10 readings
spread
limit
verdict
scatter plot
```

all derive from one data structure.

The source specifically calls for a prominently displayed total spread versus allowable limit. `Pasted markdown(20261004-065148).md`

---

# 31. ENVIRONMENT AUDIT

Ensure:

```text id="zqkk0s"
ambient baseline
tare
temperature sequence
chamber state
```

are connected.

Don't store:

```text id="k8qfy6"
temperature card state
```

separately from:

```text id="b3gwtt"
environment test state
```

---

# 32. REVIEW AUDIT

Check the complete source flow:

```text id="v3m51e"
Pending Review
↓
Reviewer Queue
↓
Audit summary
↓
Row comment
↓
Approve / Remand
```

The source explicitly defines this interaction. `Pasted markdown(20261004-065148).md`

---

# 33. REMAND AUDIT

Find the remand action.

Verify:

```text id="7g6c9q"
mandatory reason
state transition
history retention
audit event
operator return
```

A remand must not simply change a badge.

---

# 34. SIGN AUDIT

Inspect:

```text id="ad4z3s"
DirectorSignModal
PIN validation
declaration
digest
signature state
certificate
```

Everything should be tied to session state.

The source specifies all four pieces of the signing flow. `Pasted markdown(20261004-065148).md`

---

# 35. GREEN SEAL AUDIT

The seal is a **visual representation of the signed record**.

Therefore:

```text id="m4lgg3"
seal data
=
session director
+
lab
+
timestamp
+
certificate ID
+
digest
```

Do not hardcode:

```text id="xj7r8f"
"Director: John"
"Certificate: CERT-001"
```

inside the component.

---

# 36. AUDIT TRAIL AUDIT

Every meaningful state transition should add an event.

Minimum:

```text id="f0g8di"
session created
instrument registered
test started
observation captured
test completed
submitted
comment added
remanded
resubmitted
review approved
signed
approved / locked
certificate generated
```

Do not just create one fake timeline after signing.

---

# 37. CERTIFICATE AUDIT

Find certificate creation.

Check whether certificate information comes from:

```text id="qf52tr"
approved session
```

or from a separate manually maintained object.

It must come from the approved session.

---

# 38. REPORT LANGUAGE AUDIT

The source specifies:

```text id="2e8t4l"
English
Hindi
Bilingual
```

with certificate output options. `Pasted markdown(20261004-065148).md`

Search for hardcoded English labels scattered across certificate components.

Move them to:

```text id="b6u6el"
certificate localization model
```

---

# 39. IoT AUDIT

Look for:

```text id="m57j4r"
WebSerial
serial
simulator
packet
weight
stable
capture
```

Verify they are encapsulated in the IoT layer rather than spread across multiple test pages.

The source explicitly defines these capabilities in `IoTContext`. `Pasted markdown(20261004-065148).md`

---

# 40. EXCEL AUDIT

Verify the benchmark is actually deterministic.

A button:

```text id="x0w9v3"
Run Instant Benchmark Demo
```

should produce a meaningful repeatable result.

Not:

```text id="yku2u5"
randomly generate 2 errors
```

Every scenario needs known expected output.

---

# 41. JURY ASSISTANT AUDIT

Find:

```text id="1cq9lr"
JuryDemoAssistant
```

Verify it is coupled to routing.

Expected:

```text id="nn3b5s"
nextStep()
→ setDemoStep()
→ navigate()
→ setActiveNav()
→ highlightTarget()
```

Not just:

```text id="rx8x7k"
currentStep++
```

The source specifically requires tab synchronization. `Pasted markdown(20261004-065148).md`

---

# 42. DEAD FEATURE AUDIT

Look for buttons that do nothing:

```text id="u90t6c"
Download
Verify
Open
Interrogate
Capture
Next
Submit
Approve
Sign
```

Every visible primary action must either:

```text id="8d3x7t"
work
```

or:

```text id="kz68v0"
clearly be demo/mock functionality
```

Never leave fake controls.

---

# 43. DESIGN SYSTEM AUDIT

Search for repeated:

```text id="2z5x8r"
bg-blue-600
rounded-xl
text-sm
shadow
border
```

inside page components.

If the same visual pattern appears repeatedly, turn it into a token/component.

The source's design system is intended to use consistent surfaces, borders, spacing and typography. `Pasted markdown(20261004-065148).md`

---

# 44. DESIGN TOKEN AUDIT

Target:

```text id="3jr9v6"
styles/
  tokens.css
  globals.css
```

Then:

```text id="6t7w2r"
no random blue
no random gray
no random green
no random radius
```

Use the defined semantic colors:

```text id="qqb8to"
primary → blue
PASS → emerald
FAIL → crimson
WARNING → amber
PENDING → indigo
LOCKED → gold/neutral
```

---

# 45. RESPONSIVE AUDIT

Test at:

```text id="f0rpjm"
1440 × 900
1280 × 720
1024 × 768
768 × 1024
390 × 844
```

You don't need identical layouts.

You need identical **hierarchy**.

---

# 46. MOBILE AUDIT

Ask:

```text id="llp6ue"
Can I see the result?

Can I understand what happened?

Can I find the primary action?

Can I open technical evidence?
```

If yes, the responsive transformation is working.

---

# 47. FORM AUDIT

The source explicitly rejects monolithic forms and recommends chunked cards with roughly 4-6 fields. `Pasted markdown(20261004-065148).md`

Search for any form with:

```text id="af6n1j"
10+
fields
```

Break it.

---

# 48. MODAL AUDIT

Every modal should have:

```text id="6jgnq0"
title
purpose
content
primary action
cancel
Escape
focus
```

Avoid giant generic dialogs.

---

# 49. LOADING AUDIT

Search for:

```text id="pzkgc1"
Loading...
Please wait...
```

Replace vague states with contextual states:

```text id="bj8n4g"
Reading instrument...
Calculating compliance...
Generating digest...
Analyzing workbook...
```

The source explicitly calls for actionable feedback instead of blank/loading ambiguity. `Pasted markdown(20261004-065148).md`

---

# 50. ERROR AUDIT

Test all documented validation areas:

```text id="x6m4qk"
manufacturer
model
serial
max
min
e
PIN
```

The source provides concrete validation rules and error feedback patterns. `Pasted markdown(20261004-065148).md`

---

# 51. DATA INTEGRITY AUDIT

For one known session, compare:

```text id="i1znsc"
Home
Sessions
Session Overview
Testing
Review
Audit
Certificate
```

Verify:

```text id="yqs6z7"
same instrument
same serial
same class
same result
same progress
same status
```

If one page disagrees, fix the state architecture rather than patching that page.

---

# 52. THE "ONE SESSION" TEST

This is your strongest integration test.

Take:

```text id="1soj73"
VS-DEMO-001
```

and follow:

```text id="pln87k"
Home
↓
Sessions
↓
Overview
↓
Readiness
↓
Test Plan
↓
Physical
↓
Weighing
↓
Eccentricity
↓
Repeatability
↓
Environment
↓
Review
↓
Director
↓
Audit
↓
Certificate
```

If the same session survives this journey without duplicated or lost state:

**your architecture is probably healthy.**

---

# 53. THE "ROUNDING TRAP" TEST

Then run:

```text id="2pbz4u"
Rounding Trap
```

Check:

```text id="7x8jtu"
Weighing
=
Excel Auditor
=
Review
=
Audit
=
Certificate/result
```

The source intentionally makes the rounding-trap scenario a cross-feature demonstration. `Pasted markdown(20261004-065148).md`

---

# 54. THE "ROLE ATTACK" TEST

For every restricted operation:

```text id="t9m4fa"
try it as the wrong role
```

Examples:

```text id="w7k14z"
Metrologist → Sign
Reviewer → Edit observation
Auditor → Modify session
Director → Edit observation
```

Expected:

```text id="f7r9zq"
action denied
state unchanged
clear explanation
```

---

# 55. THE "LOCK ATTACK" TEST

After approval:

```text id="9r9cxf"
refresh
switch role
navigate
go backward
open old route
```

Then try editing.

Expected:

```text id="j8i1ps"
0 successful mutations
```

---

# 56. BUILD A GAP QUEUE

At the end of the audit, produce:

```text id="6f4a4r"
P0
────
12 issues

P1
────
17 issues

P2
────
26 issues
```

Then implement **P0 only first**.

After P0 passes, move to P1.

---

# 57. DO NOT FIX EVERYTHING AT ONCE

Use:

```text id="w5czm6"
AUDIT
↓
GROUP
↓
FIX
↓
REGRESSION
↓
RE-AUDIT
```

Not:

```text id="v4i4qk"
change 100 files
↓
hope
```

---

# 58. IDE IMPLEMENTATION PROMPT

This is the prompt I would now give your coding agent.

```text id="q0g8hz"
PHASE 10 - IMPLEMENTATION AUDIT AND GAP CLOSING

You are working on the existing METROLOGIX-76 frontend.

DO NOT redesign the product from scratch.

DO NOT add major new features.

Your job is to inspect the CURRENT codebase against the
METROLOGIX-76 Frontend UI/UX Master Specification and
identify/fix implementation gaps.

==================================================
RULE 1 - AUDIT BEFORE EDITING
==================================================

First inspect:

package.json
tsconfig
vite config
src/main
App
providers
routes
components
contexts
domain
mocks
features
styles

Do not begin by rewriting components.

Create:

IMPLEMENTATION_STATUS.md

Classify every major requirement as:

IMPLEMENTED
PARTIAL
MISSING
INCORRECT
BLOCKED

==================================================
RULE 2 - PRIORITY
==================================================

P0:
state corruption
invalid calculations
permissions
immutability
routing
broken demo flow
build errors

P1:
workflow
review
audit
certificate
IoT
Excel
scenario engine

P2:
visual polish
responsive details
microanimations
copy

Fix P0 before P1.
Fix P1 before P2.

==================================================
RULE 3 - ONE SOURCE OF TRUTH
==================================================

Find duplicated definitions of:

AccuracyClass
VerificationStage
ReviewStatus
ComplianceStatus
UserRole
ObservationRow
RowAuditComment
VerificationSession

Consolidate them.

All major UI features must consume the same
VerificationSession.

==================================================
RULE 4 - CENTRAL STATE
==================================================

Find page-local business state.

Refactor duplicated business state into the
central session/domain layer where appropriate.

Pages should primarily:

read selectors
dispatch domain actions
render UI

==================================================
RULE 5 - CENTRAL CALCULATIONS
==================================================

Find calculations inside React components.

Move deterministic calculations into:

domain/calculations

At minimum support:

calculateTurningPoint
calculateError
calculateCorrectedError
calculateCompliance
calculateSpread

Display rounding must NEVER affect compliance decisions.

==================================================
RULE 6 - CENTRAL PERMISSIONS
==================================================

Create/use guards for:

canEditSession
canSubmitForReview
canReview
canRemand
canApprove
canSignCertificate
canModifyApprovedSession

Use guards in both:

UI
AND
action handlers

==================================================
RULE 7 - IMMUTABILITY
==================================================

APPROVED sessions are permanently read-only.

All mutation paths must reject changes.

Do not rely solely on disabled inputs.

Show the immutable/golden-lock state in UI.

==================================================
RULE 8 - SESSION FLOW
==================================================

Verify:

DRAFT
→ IN_TESTING
→ PENDING_REVIEW
→ DIRECTOR SIGN-OFF
→ APPROVED

And:

PENDING_REVIEW
→ REMANDED
→ IN_TESTING
→ PENDING_REVIEW

No invalid transitions.

==================================================
RULE 9 - DEMO SCENARIOS
==================================================

Verify all five synthetic scenarios.

Do not randomize expected outcomes.

Expected outputs must be deterministic.

==================================================
RULE 10 - CROSS-PAGE CONSISTENCY
==================================================

Take one demo session and compare its:

instrument
serial
class
progress
test results
status
review
digest
certificate

across every page.

Fix inconsistent sources.

==================================================
RULE 11 - REVIEW
==================================================

Verify:

Reviewer Queue
selected session
audit summary
row comments
remand
approve
forward to Director

==================================================
RULE 12 - DIRECTOR
==================================================

Verify:

Director-only signing
4-digit PIN
demo PIN in demo mode
mandatory declaration
digest
seal
certificate

==================================================
RULE 13 - AUDIT
==================================================

Verify meaningful state changes create audit events.

Audit timeline must reflect the actual session history.

==================================================
RULE 14 - CERTIFICATE
==================================================

Certificate data must be generated from the approved session.

Do not duplicate final session data inside report components.

==================================================
RULE 15 - SCALE BRIDGE
==================================================

Verify:

simulator
protocols
stable state
weight
capture
test-grid integration
WebSerial adapter boundary

==================================================
RULE 16 - EXCEL
==================================================

Verify:

.xlsx handling
benchmark
discrepancy results
rounding trap
calculation trace
metadata

==================================================
RULE 17 - JURY
==================================================

Verify:

Play
Pause
Reset
Next Step

Next Step must synchronize:

demo step
route
sidebar
highlight
presenter cue

==================================================
RULE 18 - DESIGN SYSTEM
==================================================

Search for duplicated:

colors
radii
button styles
spacing
typography
badges

Use shared primitives/tokens.

Maintain:

Inter
IBM Plex Mono
blue primary
emerald PASS
crimson FAIL
amber WARNING
indigo PENDING

==================================================
RULE 19 - RESPONSIVE
==================================================

Test:

1440
1280
1024
768
390

Do not merely shrink desktop.

Preserve hierarchy.

==================================================
RULE 20 - ERROR / EMPTY / LOADING
==================================================

Every important async operation needs
contextual feedback.

Every important empty state needs an action.

Every input validation error must be clear.

==================================================
RULE 21 - BUILD
==================================================

Run:

lint
typecheck
build

Fix real errors.

Then test the production build.

==================================================
RULE 22 - DO NOT OVER-ENGINEER
==================================================

Do not introduce:

new backend
database migrations
SQL
server code
unnecessary UI frameworks
unnecessary state libraries

Keep the project frontend-only.

==================================================
DELIVERABLE
==================================================

Produce:

IMPLEMENTATION_STATUS.md

and then fix P0 issues.

After P0 fixes, run regression tests.

Only then continue to P1.

Do not claim a requirement is implemented
until it can be demonstrated from the UI and
the corresponding state/action path.
```

---

# 59. THE CRITICAL DIFFERENCE NOW

Until Phase 9, we were asking:

```text id="xjwntf"
"What should METROLOGIX-76 contain?"
```

Now the question becomes:

```text id="1l8x6s"
"Where exactly does the current code fail
to implement METROLOGIX-76?"
```

That's a much more powerful stage.

---

# 60. YOUR FINAL IMPLEMENTATION LOOP

Use this loop from here onward:

```text id="oc9zqn"
READ SPEC
   ↓
INSPECT CODE
   ↓
IDENTIFY GAP
   ↓
CLASSIFY P0/P1/P2
   ↓
FIX ONE AREA
   ↓
RUN REGRESSION
   ↓
VERIFY UI
   ↓
UPDATE STATUS
   ↓
NEXT GAP
```

Do **not** let the coding agent continuously redesign screens while doing this. The specification already establishes the intended UX principles: human-readable labels, chunked forms, progressive disclosure, status semantics and interactive evidence. `Pasted markdown(20261004-065148).md`

---

# PHASE 11 - FINAL DEMO ENGINEERING

After the implementation audit, the next stage is the **hackathon battle plan**: choose the exact demo scenario, create the 3-minute and 7-minute walkthroughs, define the judge click path, prepare fallback paths when hardware/network fails, map every major feature to the problem statement, and prepare the technical questions/answers judges are likely to challenge you with.



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)