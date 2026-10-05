# METROLOGIX-76 — Frontend UI/UX Master Specification
## OIML R 76 Digital Test Report System for Non-Automatic Weighing Instruments (NAWI)
### Ministry of Consumer Affairs, Food & Public Distribution | SIH Problem Statement 26035

---

> ### ⚡ MANDATORY DIRECTIVE FOR FRONTEND AI CODE GENERATORS:
> 
> 1. **Pure Frontend Scope:** You are generating a modern, ultra-clean React web application (React 18+, TypeScript, Tailwind CSS, Lucide React icons). **DO NOT write backend servers, database migrations, raw SQL queries, FastAPI routes, or Docker/Nginx configurations.**
> 2. **Clean, Human-Understandable Design:** The user interface must be intuitive, modern, and simple enough for **anyone (lab inspectors, testing officers, hackathon judges) to understand immediately without being a metrology scientist**.
> 3. **NO Intimidating "Wall-of-Text" Forms:** Never render monolithic 30-field forms. Divide all inputs into **chunked, clean visual cards** (maximum 4–6 fields per card).
> 4. **1-Click Synthetic Presets:** Provide **1-Click Auto-Fill Buttons** (e.g. `Avery Class III Retail`, `Mettler Class I Lab`, `Sansui Class II Gold`, `Essae Class IIII Industrial`) so anyone can load a complete, realistic instrument in one click without typing.
> 5. **Visual Clarity Over Jargon:** Replace dense scientific notation with friendly labels:
>    - Use `Target Test Load (kg)` instead of $L$
>    - Use `Observed Reading (kg)` instead of $I$
>    - Use `Calculated Error` instead of $E_c$
>    - Use `Legal Tolerance Limit` instead of $\pm\text{MPE}$
>    - Use clear, prominent **Emerald Green `PASS`** and **Bright Crimson `FAIL`** badges.
> 6. **Progressive Disclosure:** Keep primary screens clean. Use **slide-over drawers** (for audit comments) and **focused modals** (for Director PIN signing, photo zoom, calculation proofs) rather than cluttering the main screen.
> 7. **Rich Interactive Visuals:** Render interactive SVG charts (Error Corridor with tolerance bands, Platter Heatmap with deflection vector arrows, Spirit Level Bubble indicator, and the animated Guilloche security seal).

---

## SECTION 1 — PRODUCT OVERVIEW & STATUTORY WORKFLOW

### What This Application Does
METROLOGIX-76 is a modern digital operating system that automates the verification and certification of Non-Automatic Weighing Instruments (NAWIs — retail counter scales, jewelry balances, platform scales, weighbridges) under **OIML Recommendation R 76-1:2006** and the **Legal Metrology Act, 2009** of India.

It replaces error-prone, manual Excel spreadsheets with an intuitive, guided **7-Step Stepper**:

```
Scale Arrives at Laboratory
         ↓
Step 01: Intake & Specifications (1-Click Presets + Photo Dossier + Real-Time Spec Check)
         ↓
Step 02: Physical & Visual Audit (Digital Spirit Level Bubble Incline ≤ 0.5° + Sec. 24 Lead Seal)
         ↓
Step 03: Weighing Error & Linearity (Observation Grid + Interactive SVG Error Corridor Chart)
         ↓
Step 04: Corner Loading (Eccentricity Platter Heatmap with 2D Deflection Vector Arrows)
         ↓
Step 05: Repeatability (10-Reading Sequence + Spread Δ = E_max − E_min Scatter Plot)
         ↓
Step 06: Environmental Drift & Tare (Tare Setting Accuracy + Thermal Chamber Drift Loop)
         ↓
Step 07: Review, Digital Signature & Statutory Seal (Director PIN + Green Guilloche Stamp)
         ↓
Dual Statutory Report Export:
  • Official Printable PDF/A-1b with embedded eMaap verification QR code
  • Editable Word (.docx) compiling all 8 standardized OIML R 76-2 evaluation forms
  • Trilingual / Bilingual Support: English, Hindi Devanagari, and Parallel Bilingual
```

---

## SECTION 2 — USER ROLES & VISUAL PERMISSION GATES

The UI provides a **Live Role Switcher Pill** in the top navigation bar so judges and evaluators can switch roles in 1 click to test permissions on the fly.

| Role | Badge Color | Primary UI Capabilities & Visible Actions |
|------|-------------|-------------------------------------------|
| **METROLOGIST** | Emerald Pill | • Registers instruments & loads 1-click presets.<br>• Enters test readings in observation grids.<br>• Submits completed test sessions for peer review. |
| **REVIEWER** | Amber Pill | • Audits submitted sessions in the Reviewer Queue.<br>• Opens slide-over drawer to flag rows (`NOTE`, `FLAG`, `REJECT_REASON`).<br>• Approves or remands sessions with mandatory justification. |
| **DIRECTOR** | Purple Pill | • Final statutory authority.<br>• Opens Director PIN Signing modal.<br>• Applies the official Green Guilloche Stamped Seal.<br>• Permanently locks session into immutable read-only mode. |
| **AUDITOR** | Sky Pill | • Read-only inspector view.<br>• Inspects the immutable SHA-256 cryptographic audit trail.<br>• Views and downloads certificates from repository. |
| **ADMIN** | Slate Pill | • Laboratory system settings, weight set calibration dates. |

### Visual Role Enforcement Rules:
1. **Disabled Observation Inputs for Reviewers/Directors:** When logged in as Reviewer or Director, test entry fields are disabled; only audit comment buttons and approval actions are active.
2. **Director Sign Modal Lockout:** If a Metrologist clicks "Sign Certificate", an accessible error toast appears: *"Access Denied: Only a Lab Director is authorized to digitally sign."*
3. **Approved Session Read-Only Lock:** Once status is `APPROVED`, all inputs across all tabs are permanently disabled, and a golden padlock badge appears in the header.

---

## SECTION 3 — INTUITIVE USER JOURNEYS

### Journey A: Testing Officer (Metrologist)
1. **Open App**: Land on the Executive Dashboard.
2. **Start Intake**: Click `+ Register New Instrument` or click a **1-Click Preset** (e.g. `Avery Class III Retail Scale`).
3. **Instant Validation**: Notice real-time green chips confirming $n = \text{Max}/e$ satisfies OIML Table 3 limits.
4. **Follow 7-Step Stepper**:
   - *Step 2 (Vision)*: Inspect concentric level bubble (green circle).
   - *Step 3 (Weighing)*: Enter nominal test loads and scale readings (or click `Capture Live Scale Weight`).
   - *Step 4 (Eccentricity)*: Verify 4 corner loads on the SVG platter heatmap.
   - *Step 5 (Repeatability)*: Record 10 readings at half/full capacity; view spread $\Delta E$.
   - *Step 6 (Tare/Temp)*: Check tare setting accuracy ($\le \pm 0.25e$).
5. **Submit**: Click `Submit for Peer Review →`. Status transitions to `PENDING_REVIEW`.

### Journey B: Technical Reviewer (Peer Review)
1. Open **Review & Sign** tab from sidebar.
2. Select session from the **Reviewer Queue**.
3. Click any observation row to open the **Slide-Over Audit Comment Drawer**.
4. Select a pre-canned remark (e.g. *"Low Margin Warning"*, *"Hysteresis Reversal"*) and click `Add Comment`.
5. Click `Approve & Forward to Director →` or `Remand to Operator` (requires reason).

### Journey C: Laboratory Director (Digital Sign-Off)
1. Open session in `PENDING_REVIEW`.
2. Inspect the audit summary and reviewer recommendation.
3. Click `Sign & Stamp Certificate`.
4. Enter 4-digit PIN (with convenient `Load Demo PIN: 7620` button) and confirm statutory declaration.
5. System renders the **Animated Green Guilloche Stamped Seal** with QR code and SHA-256 digest.
6. Click `Download PDF/A Certificate` or `Download Word (.docx)`.

### Journey D: Hackathon Jury / Evaluator (Autopilot Walkthrough)
1. Click the floating **Jury Demo Assistant** button in the header.
2. The 10-minute autopilot walkthrough drawer expands with a countdown timer, spoken script cue cards, and highlight checklists.
3. Click `Next Step →`: **The app automatically switches sidebar tabs to match the presentation step!**

---

## SECTION 4 — INFORMATION ARCHITECTURE

```
METROLOGIX-76 Application Shell
├── Global Navigation Header
│   ├── Official National Emblem & DoCA Attribution
│   ├── National Laboratory Switcher (RRSL Bengaluru, Ahmedabad, Delhi, etc.)
│   ├── Live Role Switcher (Metrologist, Reviewer, Director, Auditor, Admin)
│   ├── 1-Click Scenario Launcher (5 synthetic stress cases)
│   ├── Live IoT Scale Readout Chip (weight, STABLE/UNSTABLE beacon)
│   ├── Dark / Light Mode Theme Toggle
│   └── 10-Minute Autopilot Jury Assistant Drawer
│
├── Persistent Session Header (Pinned across all testing views)
│   ├── Instrument Context: Serial Number, Model, Class I/II/III/IIII, Max, Min, e, d
│   ├── Standard Weights Traceability Status: Green Valid / Red Lockout Banner
│   └── Interactive 7-Step Stepper (Clickable progress nodes)
│
├── Main Viewport (Routed via Sidebar NavItems)
│   ├── Dashboard (`dashboard`) — KPI Metric Cards, Active Verifications, Donut Chart
│   ├── Instrument Intake (`intake`) — 4 Presets, OCR Dropzone, Modular Cards, 5-Photo Dossier
│   ├── Active Tests (`workspace`) — Card grid of in-progress verifications with progress rings
│   ├── Scale Bridge (`live_bridge`) — 7-Segment weight display, W3C WebSerial connect, WELMEC panel
│   ├── Test Scope Matrix (`tam`) — Matrix of 8 statutory tests mapped to active scale
│   ├── Visual Inspection (`vision_audit`) — Camera inspector, spirit bubble tilt indicator, seal check
│   ├── Weighing Error (`weighing`) — 3-way layout toggle, Observation Grid, SVG Error Corridor Chart
│   ├── Eccentricity (`eccentricity`) — 3-way platter layout, SVG Heatmap, 2D deflection vector arrows
│   ├── Repeatability (`repeatability`) — 10-run sequence, horizontal scatter chart, spread Δ card
│   ├── Environmental Drift (`tare_temp`) — Sub-tabs for Tare Accuracy, Temperature Drift, Chamber HUD
│   ├── Standard Weights (`traceability`) — Calibration countdown cards, Hard Lockout Banner
│   ├── Review & Sign (`review`) — Queue, Slide-over Comment Drawer, Director PIN Modal, Green Seal
│   ├── Excel Migration (`excel_migration`) — 4-sub-tab legacy spreadsheet flaw auditor
│   └── Certificates (`reports`) — Language toggle (EN/HI/Dual), 1-click PDF/A & DOCX downloads
```

---

## SECTION 5 — UI DATA CONTRACTS & REALISTIC MOCK DATASETS

The frontend application includes 4 complete, realistic instrument presets that any AI can directly embed into frontend state for 1-click demonstrations:

### Preset 1: Retail Counter Scale (`avery_class_iii_retail`)
```typescript
export const PRESET_AVERY_CLASS_III = {
  id: "inst-avery-01",
  manufacturer: "Avery Weigh-Tronix",
  modelName: "ZM201 Retail Platform",
  serialNumber: "AV-2026-8812",
  approvalNumber: "TAC-2026-III-0142",
  accuracyClass: "CLASS_III",
  maxCapacity: 30.000,
  minCapacity: 0.100,
  e: 0.005,
  d: 0.005,
  unit: "kg",
  n: 6000,                           // n = Max / e
  receptorType: "PLATFORM",
  numSupports: 4,
  verificationStage: "INITIAL_TYPE_APPROVAL",
  firmwareVersion: "v2.4.1",
  calibrationCounter: 42,
  status: "IN_TESTING",
  complianceStatus: "PASS"
};
```

### Preset 2: Analytical Laboratory Balance (`mettler_class_i_analytical`)
```typescript
export const PRESET_METTLER_CLASS_I = {
  id: "inst-mettler-02",
  manufacturer: "Mettler-Toledo",
  modelName: "XPR Analytical Micro-Balance",
  serialNumber: "MT-2026-0049",
  approvalNumber: "TAC-2026-I-0008",
  accuracyClass: "CLASS_I",
  maxCapacity: 120.000,
  minCapacity: 0.010,
  e: 0.001,
  d: 0.0001,
  unit: "g",
  n: 120000,
  receptorType: "PLATFORM",
  numSupports: 1,
  verificationStage: "INITIAL_TYPE_APPROVAL",
  firmwareVersion: "v4.1.0-WELMEC",
  calibrationCounter: 12,
  status: "PENDING_REVIEW",
  complianceStatus: "PASS"
};
```

### Preset 3: Precision Gold & Jewelry Scale (`sansui_class_ii_gold`)
```typescript
export const PRESET_SANSUI_CLASS_II = {
  id: "inst-sansui-03",
  manufacturer: "Sansui Precision",
  modelName: "GoldMaster-6K",
  serialNumber: "SN-2026-3391",
  approvalNumber: "TAC-2026-II-0077",
  accuracyClass: "CLASS_II",
  maxCapacity: 6000.0,
  minCapacity: 5.0,
  e: 0.1,
  d: 0.1,
  unit: "g",
  n: 60000,
  receptorType: "PLATFORM",
  numSupports: 4,
  verificationStage: "INITIAL_TYPE_APPROVAL",
  firmwareVersion: "v1.9.2",
  calibrationCounter: 8,
  status: "APPROVED",
  complianceStatus: "PASS"
};
```

### Preset 4: Heavy-Duty Industrial Platform (`essae_class_iiii_heavy`)
```typescript
export const PRESET_ESSAE_CLASS_IIII = {
  id: "inst-essae-04",
  manufacturer: "Essae-Teraoka",
  modelName: "DS-215 Heavy Platform",
  serialNumber: "ET-2026-9041",
  approvalNumber: "TAC-2026-IIII-0210",
  accuracyClass: "CLASS_IIII",
  maxCapacity: 150.0,
  minCapacity: 2.0,
  e: 0.05,
  d: 0.05,
  unit: "kg",
  n: 3000,
  receptorType: "PLATFORM",
  numSupports: 4,
  verificationStage: "SUBSEQUENT_VERIFICATION",
  firmwareVersion: "v3.0.1",
  calibrationCounter: 19,
  status: "IN_TESTING",
  complianceStatus: "WARNING"
};
```

### 5 Canonical Demonstration Stress Scenarios (Header Dropdown Launcher)
In addition to the 4 Instrument Presets above, the UI header provides a **Quick Scenario Launcher** dropdown that loads 5 canonical metrological stress cases to demonstrate compliance under SIH Problem Statement 26035:

1. **`standard_class_iii_retail` (Passing Baseline)**: Standard 30 kg × 5 g counter scale with 31 clean observations satisfying OIML Table 3 and Table 6 with green `PASS` badges.
2. **`rounding_discrepancy_trap` (The Core SIH Highlight)**: At 2,000e capacity boundary (10,000 g), naive spreadsheet rounding indicates a false pass ($I - L = 0$), but true turning point changeover analysis reveals an unrounded error of $-5.3\text{ g}$ violating the $\pm 5.0\text{ g}$ MPE (statutory `FAIL`). Highlighted with an amber "Rounding Trap Active" badge.
3. **`temperature_span_drift_fail` (Thermal Non-Compliance)**: Scale passes at $+20^\circ\text{C}$ reference temperature, but thermal expansion at $+40^\circ\text{C}$ shifts the span beyond statutory limits (OIML Clause A.5.3 `FAIL`).
4. **`eccentricity_cantilever_twist` (Mechanical Corner Sag)**: Center loading passes, but Corner 4 (Right-Rear) shows $-6.2\text{ g}$ deflection under $1/3\text{ Max}$ load, exceeding MPE and triggering the red hotspot on the SVG Platter Heatmap (`FAIL`).
5. **`high_interval_class_i_analytical` (Micro-Precision)**: 120 g × 0.001 g analytical balance with $n = 120,000$ divisions, proving high decimal precision without floating-point roundoff errors (`PASS`).

---

## SECTION 6 — USER INTERACTIONS & UI ACTION HANDLERS

Every interactive element in the UI is tied to clear client-side state transitions:

| User Action | Trigger UI Element | Immediate Client-Side Response |
|-------------|--------------------|--------------------------------|
| **Load Instrument Preset** | Click any of the 4 Preset Buttons | Form fields across all cards instantly populate; live Table 3 validator turns green. |
| **Switch Role** | Click Role Switcher in Header | Active persona updates immediately; UI controls enable/disable based on role. |
| **Capture Live Scale Weight** | Click `Capture IoT Weight` on a table row | Active row's scale reading field fills with the live weight from the header scale readout. |
| **Flag a Table Row** | Click flag/comment icon on any observation row | Slide-over drawer (`RowLevelCommentDrawer.tsx`) opens showing selected row details and quick-flags. |
| **Submit for Review** | Click `Submit for Review` button | Displays confirmation dialog; changes session badge to `PENDING_REVIEW`. |
| **Director Digital Sign** | Click `Sign & Stamp Certificate` button | Opens `DirectorSignModal.tsx`; upon entering valid PIN, applies animated Green Guilloche Seal. |
| **Toggle Report Language** | Click `English`, `Hindi`, or `Bilingual` toggle | Certificate preview instantly switches text between English, Hindi Devanagari, or parallel dual-column. |
| **Download Certificate** | Click `Download PDF/A` or `Download Word` | Generates file download with full OIML R 76-2 tables and eMaap QR code in under 500ms. |
| **Autopilot Demo Step** | Click `Next Step` in Jury Assistant | Timer advances; active sidebar navigation automatically jumps to the corresponding screen. |

---

## SECTION 7 — FRONTEND TYPESCRIPT DATA MODELS

Clean TypeScript models for managing UI state without backend dependencies:

```typescript
export type AccuracyClass = 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IIII';
export type VerificationStage = 'INITIAL_TYPE_APPROVAL' | 'SUBSEQUENT_VERIFICATION' | 'IN_SERVICE_INSPECTION';
export type ReviewStatus = 'DRAFT' | 'IN_TESTING' | 'PENDING_REVIEW' | 'APPROVED' | 'REMANDED';
export type ComplianceStatus = 'PASS' | 'FAIL' | 'MARGINAL' | 'PENDING' | 'LOCKED_OUT';
export type UserRole = 'METROLOGIST' | 'REVIEWER' | 'DIRECTOR' | 'AUDITOR' | 'ADMIN';

export interface UserProfile {
  id: string;
  fullName: string;
  designation: string;
  email: string;
  role: UserRole;
  laboratoryId: string;
  laboratoryName: string;
}

export interface Laboratory {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  labType: 'RRSL' | 'GATC';
  nablAccreditationNo: string;
}

export interface ObservationRow {
  stepIndex: number;
  nominalLoad: number;               // Target load (kg or g)
  scaleReading: number;              // Observed reading on scale indicator
  auxiliaryDeltaL?: number;          // Additional weights for turning point
  turningPointP: number;             // P = I + 0.5e - deltaL
  errorE: number;                    // E = P - L
  correctedErrorEc: number;          // Ec = E - E0
  mpeLimit: number;                  // Maximum Permissible Error tolerance (+/-)
  status: ComplianceStatus;          // PASS | FAIL | MARGINAL
  hasComment?: boolean;
}

export interface RowAuditComment {
  id: string;
  stepIndex: number;
  testType: string;
  authorName: string;
  authorRole: string;
  comment: string;
  severity: 'NOTE' | 'FLAG' | 'REJECT_REASON';
  createdAt: string;
  resolved: boolean;
}
```

---

## SECTION 8 — HUMAN-FRIENDLY METROLOGY DISPLAY RULES

To ensure the UI is **clean, simple, and understandable by anyone**, follow these presentation rules:

### 1. Simple 5-Column Observation Table Layout
The Observation Table must present clean, easily understandable columns:

| Column Header | Sub-Label | Example Display | Meaning |
|---------------|-----------|-----------------|---------|
| **Target Load** | `L (Nominal)` | `10.000 kg` | Known standard weight placed on platform |
| **Observed Reading** | `I (Indication)` | `10.005 kg` | What the scale digital screen displays |
| **Calculated Error** | `Ec (Corrected)` | `+0.5 e` | Scale deviation after zero-correction |
| **Statutory Limit** | `±MPE Tolerance` | `±1.0 e (±5g)` | Maximum legal allowable error |
| **Compliance** | `Verdict` | `🟢 PASS` | Instant status badge |

> **Calculation Proof Tooltip:** Users who want to see the underlying scientific formula can hover over the error cell to reveal:  
> *Formula: $P = I + 0.5e - \Delta L = 10.005 + 0.0025 - 0.0025 = 10.005\,\text{kg}$ (OIML R 76-1 Cl. A.4.4.3)*

### 2. Traffic Light Compliance Colors
- **Emerald Green (`bg-emerald-50 text-emerald-700 border-emerald-500/30`)**: Error is safely within 80% of legal limit.
- **Amber Warning (`bg-amber-50 text-amber-700 border-amber-500/30`)**: Error is between 80% and 100% of legal limit (near-limit marginal).
- **Bright Crimson (`bg-rose-50 text-rose-700 border-rose-500/30`)**: Error exceeds legal limit (automatic statutory failure).

### 3. Repeatability: Total Spread Display
Instead of showing confusing row-by-row verdicts for the 10 repeated readings, the UI prominently displays a large summary card:
- **Total Observed Spread**: $\Delta = E_{\max} - E_{\min} = 1.2\,\text{g}$
- **Allowable Statutory Limit**: $|\text{MPE}| = 2.0\,\text{g}$
- **Verdict**: `PASS — Spread within OIML Clause A.4.10 limit`

---

## SECTION 9 — REQUIRED SCREENS (Visual Layout & Wireframes)

### Screen 01 — Authentication Gateway (`LoginScreen.tsx`)
- **Layout**: Centered frosted glass card (`backdrop-blur-xl bg-slate-900/80 border border-slate-700/60 shadow-2xl`).
- **Identity**: Government of India National Emblem, DoCA attribution, Legal Metrology Act 2009 badge.
- **Inputs**: Username, password with toggleable eye icon.
- **1-Click Accelerators**: **4 Quick Role Switcher Buttons** (`Metrologist`, `Reviewer`, `Director`, `Admin`) at bottom of card that immediately pre-fill credentials in 1 click.

### Screen 02 — Executive Dashboard (`LabDashboard.tsx`)
- **Top Row**: 4 clean `MetricCard` components:
  1. *Active Verifications* (e.g. `12 Sessions`)
  2. *Pending Director Sign-Off* (e.g. `3 Sessions`)
  3. *NABL 24h Pass Rate* (e.g. `94.2%`)
  4. *Traceability Status* (e.g. `100% Valid`)
- **Middle Row**: 2-Column split:
  - *Left (60%)*: Recent Verification Sessions Table with status pills and 1-click review shortcut.
  - *Right (40%)*: SVG Compliance Donut Chart showing Pass / Fail / Warning breakdown.
- **Bottom Row**: 4 One-Click Synthetic Preset Cards allowing immediate test session creation.

### Screen 03 — Instrument Intake (`InstrumentIntakeForm.tsx`)
- **Top Preset Banner**: 4 pill buttons (`Avery Class III`, `Mettler Class I`, `Sansui Class II`, `Essae Class IIII`) for 1-click auto-fill.
- **Card 1: Optical Nameplate Scanner**: Drag-and-drop dropzone with OCR extraction confidence chip (`94.2%`) and 1-click "Apply OCR Data" confirmation.
- **Card 2: Identification**: Manufacturer, model name, serial number, approval number.
- **Card 3: Metrological Specifications**: Accuracy class segmented pills (Class I, II, III, IIII), Max, Min, e, d, and base unit.
  - **Live Table 3 Validator HUD**: Real-time chips calculating $n = \text{Max}/e$, $n_{\min}$, $n_{\max}$, and statutory status.
- **Card 4: 5-Category Statutory Photo Dossier**:
  - 5 upload slots with thumbnail preview and click-to-enlarge modal:
    1. `NAMEPLATE` (Rating plate photo)
    2. `FRONT_VIEW` (Full instrument frontal view)
    3. `SEALING_POINT` (Lead wire tamper seal hole per Sec. 24)
    4. `LEVEL_BUBBLE` (Spirit bubble concentricity)
    5. `DOC_SPEC` (Manufacturer type approval datasheet)
- **Action Footer**: Primary `Register Instrument & Begin Testing →` button.

### Screen 04 — Physical Vision & Security Audit (`PhysicalAuditorView.tsx`)
- **Left Column**: Live optical camera feed / photo inspector.
- **Right Column Card 1 (Spirit Level)**: Interactive circular spirit level bubble graphic. Centered bubble turns green when tilt $\le 0.5^\circ$; pulses amber if off-center.
- **Right Column Card 2 (Security Seal)**: Checklist verifying lead wire tamper seal, holographic sticker, and calibration jumper integrity.

### Screen 05 — Weighing Error Observation Grid (`ObservationGrid.tsx`)
- **Top Bar**: Session header with persistent 7-step stepper + live scale readout chip.
- **Verification Stage Pill Switcher**: Toggle between `Initial Type Approval (1× MPE)` and `Subsequent Verification (2× MPE)` per OIML Clause 3.5.2.
- **Layout Switcher**: Segmented toggle for `Split View (Grid + Chart)`, `Grid Only`, or `Chart Only`.
- **Two Metrological Test Series**: Cleanly organized into two distinct sections:
  1. `Ascending Series (Increasing Load)` — Linearity evaluation from $0 \to \text{Max}$.
  2. `Descending Series (Decreasing Load)` — Mechanical hysteresis evaluation from $\text{Max} \to 0$.
- **Observation Table Columns**: Target Load, Scale Reading, 1-Click `Capture Live Weight` button, Error, MPE tolerance, Pass/Fail badge, and an **"Inspect Trace" icon**.
- **Inspect Calculation Trace Modal**: Clicking the inspect icon on any row opens a clean popover modal showing the step-by-step arithmetic derivation proof ($P = I + 0.5e - \Delta L$, $E = P - L$, $E_c = E - E_0$, MPE).
- **Rounding Trap Callout**: Renders an amber alert banner when Scenario 2 is loaded, demonstrating the exact difference between naive spreadsheet calculation (false pass) and statutory turning-point evaluation (true fail).
- **Row Interaction**: Clicking any row flag opens the **Slide-Over Audit Comment Drawer** (`RowLevelCommentDrawer.tsx`).
- **Bottom**: Interactive **SVG Error Corridor Chart** (`ErrorCorridorChart.tsx`) plotting both ascending and descending error points within green $\pm\text{MPE}$ corridor lines.

### Screen 06 — Multi-Support Platter Eccentricity (`PlatterHeatmap.tsx`)
- **Top**: 3-Way Platter Geometry Switcher: `Square (4 Corners)`, `Round (3 Supports)`, `Rolling Load (>4 Supports)`.
- **Left (55%)**: **Interactive SVG Platter Visualizer**:
  - Displays platform with corner load points.
  - Corners transition dynamically from green ($\le 50\%\text{MPE}$) to amber ($50\text{--}100\%$) to crimson ($>100\%$).
  - **Dynamic 2D Deflection Vector Arrow**: Illustrates the mechanical canting angle and torque twist magnitude.
- **Right (45%)**: Eccentricity Test Summary Card with corner delta $\Delta E$, statutory limit, and verdict badge.

### Screen 07 — Repeatability Test (`RepeatabilityView.tsx`)
- **Top**: Load selector segmented control (`0.5 Max`, `0.8 Max`, `1.0 Max`).
- **Table**: 10 sequential readings with zero-return tracking ($I_0, I_L, P, E_c$).
- **Visual Scatter**: Horizontal SVG scatter plot showing the dispersion of all 10 readings relative to the allowable tolerance band.
- **Summary Card**: Prominent display of spread $\Delta = E_{\max} - E_{\min}$ vs. statutory limit.

### Screen 08 — Environmental Drift & Tare Testing (`TareTempView.tsx`)
- **Ambient Laboratory Conditions Card**: Pre-test recording of `Ambient Temperature (°C)`, `Relative Humidity (%)`, and `Atmospheric Pressure (hPa)` with automatic lab baseline population (SIH Requirement #2).
- **Sub-Tab Architecture**:
  - **Sub-Tab 1: `Tare Accuracy`** — Additive and subtractive tare verification ($\le \pm 0.25e$).
  - **Sub-Tab 2: `Temperature Drift`** — Multi-temperature test loop ($+20^\circ\text{C} \to +40^\circ\text{C} \to -10^\circ\text{C} \to +20^\circ\text{C}$).
  - **Sub-Tab 3: `Chamber HUD`** — Thermal chamber environmental monitor with live soak duration timer.

### Screen 09 — Standard Weights Traceability & Hard Gate Lockout
- **Registry View**: Clean list of laboratory standard weight sets (Class E1, E2, F1, M1) with NABL calibration validity countdowns.
- **Statutory Hard Lockout Banner (`LockoutBanner.tsx`)**: If standard weights are expired, an un-dismissible full-width red banner appears across all test screens, disabling input and citing OIML R 76-1 Cl. 3.7.1.

### Screen 10 — Active Tests Workspace (`ActiveTestsWorkspace.tsx`)
- **Layout**: Responsive grid of active session cards.
- **Card Anatomy**: Serial number, instrument model, accuracy class pill, circular test progress ring (e.g. 4/6 tests complete), and `Resume Testing →` button.

### Screen 11 — Test Applicability Matrix (`TestScopeMatrix.tsx`)
- **Layout**: High-readability checklist matrix mapping the 8 statutory OIML tests against the active scale's class and verification stage.

### Screen 12 — Statutory Review & Director Sign-Off (`ReviewPipeline.tsx`)
- **Queue Panel (Left)**: Searchable list of sessions filtered by status (`Pending Review`, `In Testing`, `Approved`, `Remanded`).
- **Audit Panel (Right)**: Summary of all test results, row comments, and action bar:
  - `Remand Session`: Opens modal requiring mandatory statutory justification.
  - `Sign & Stamp Certificate`: Opens `DirectorSignModal.tsx`.
- **Director Sign Modal (`DirectorSignModal.tsx`)**:
  - 4-digit PIN pad input with convenient `Load Demo PIN (7620)` button.
  - Mandatory statutory declaration checkbox.
  - Canonical SHA-256 digest preview.
- **Green Stamped Seal (`GreenStampedSeal.tsx`)**:
  - Official certificate seal featuring an **animated Guilloche rosette watermark**.
  - Verified badge, Director name, laboratory name, and timestamp.
  - eMaap verification QR code with copyable verification URL.

### Screen 13 — Cryptographic Audit Trail
- **Layout**: Chronological timeline of immutable verification events with monospace SHA-256 block hash cards.

### Screen 14 — Bilingual Certificate Repository (`ReportRepositoryView.tsx`)
- **Top Controls**: Search input + 3-way Language Selector segmented toggle (`English`, `Hindi`, `Bilingual Dual-Column`).
- **Certificate Grid**: Cards displaying Certificate ID, Serial Number, Accuracy Class, Director Signer, and QR thumbnail.
- **Actions**: 1-Click `Download PDF/A`, `Download Word (.docx)`, and `Verify on eMaap Portal`.

### Screen 15 — Live Hardware IoT Scale Bridge (`LiveBridge.tsx`)
- **Top**: Serial COM status banner + W3C WebSerial `Connect Physical Scale (USB/RS-232)` button.
- **Left**: Large 7-segment digital weight indicator with live green `STABLE` beacon and Gross/Net pills.
- **Right**: **WELMEC 7.2 Software Examination Card** (`WelmecAuditPanel.tsx`) showing calibration counters ($C, P$) and firmware hash.
- **1-Click Demo**: `Load Virtual Scale Simulator` toggle with protocol presets (CAS, Mettler SICS, Avery SMA).

### Screen 16 — Legacy Excel Ingestion & Flaw Auditor (`ExcelIngestionView.tsx`)
- **Top**: Drag-and-drop `.xlsx` upload card + `Run Instant Benchmark Demo` 1-click button.
- **4 Sub-Tabs**:
  - `Discrepancies`: Audited False Passes & False Fails with statutory citations.
  - `Weighing Recalculation`: Side-by-side comparison table (Legacy Formula vs. OIML Turning Point).
  - `Eccentricity Comparison`: Recalculated corner load deviations.
  - `Extracted Metadata`: Instrument parameters and verification metadata.

### Autopilot Jury Walkthrough Assistant (`JuryDemoAssistant.tsx`)
- **Floating Drawer**: Minute-by-minute timeline (Minutes 1 to 10) with countdown timer controls (`Play`, `Pause`, `Reset`).
- **Presenter Cues**: Script cue cards with statutory references and key highlights.
- **Tab Synchronization**: Clicking `Next Step` **automatically switches the active sidebar tab** to guide the evaluation sequence seamlessly.

---

## SECTION 10 — COMPONENT CATALOG

### 1. Layout Components (`frontend/src/components/layout/`)
- `Header.tsx`: Top bar with DoCA emblem, Lab switcher dropdown, Role switcher pills, theme toggle, and Jury Assistant toggle.
- `Sidebar.tsx`: Left navigation with 14 icons, section groupings, and collapse/expand support.
- `Breadcrumbs.tsx`: Hierarchical navigation trail.
- `VerificationSessionHeader.tsx`: Pinned header showing active instrument context and the **7-Step Stepper**.

### 2. UI Design Primitives (`frontend/src/components/ui/`)
- `Button.tsx`: Accessible button with variants (`primary`, `secondary`, `danger`, `ghost`), sizes (`sm`, `md`, `lg`), and loading spinner.
- `ComplianceBadge.tsx`: Pill badge for `PASS` (emerald), `FAIL` (rose), `MARGINAL` (amber), `PENDING` (slate).
- `StatusPill.tsx`: Micro-badge for Accuracy Class (`Class I` purple, `Class II` sky, `Class III` blue, `Class IIII` slate).
- `MetricCard.tsx`: Clean KPI card with title, large monospace tabular number, unit label, and hover highlight.
- `DataTable.tsx`: High-performance table with column alignment, custom cell renderers, and empty state graphics.
- `Modal.tsx`: Accessible dialog with backdrop blur, `Escape` key dismiss, and action footer.
- `LockoutBanner.tsx`: Full-width expandable warning banner for non-compliant standard weights.
- `JuryDemoAssistant.tsx`: Floating 10-minute autopilot walkthrough assistant with timer and tab sync.

### 3. Feature Components (`frontend/src/features/`)
- `auth/LoginScreen.tsx`: Login gateway with 4 quick role switcher buttons.
- `dashboard/LabDashboard.tsx`: Overview KPI cards, scenario selector carousel, active verifications table.
- `intake/InstrumentIntakeForm.tsx`: 4 modular cards, 1-click presets, OCR dropzone, 5-photo dossier.
- `vision/PhysicalAuditorView.tsx`: Camera feed, level bubble graphic, seal integrity checklist.
- `testing/ActiveTestsWorkspace.tsx`: Filterable card grid of in-progress sessions.
- `testing/TestScopeMatrix.tsx`: Test Applicability Matrix (TAM) mapped to OIML R 76-1.
- `testing/ObservationGrid.tsx`: Weighing test entry table, turning point calculations, Error Corridor Chart integration.
- `testing/ErrorCorridorChart.tsx`: SVG visualization of errors plotted between $\pm\text{MPE}$ boundaries.
- `testing/PlatterHeatmap.tsx`: SVG platform diagram with 2D deflection vector arrows.
- `testing/RepeatabilityView.tsx`: 10-run repeatability sequence, horizontal scatter chart, $\Delta$ span analysis.
- `testing/TareTempView.tsx`: 3 sub-tabs for tare accuracy and thermal drift evaluation.
- `review/ReviewPipeline.tsx`: Container linking queue, comment drawer, sign modal, and green seal.
- `review/ReviewerQueue.tsx`: Filterable list of sessions submitted for review.
- `review/RowLevelCommentDrawer.tsx`: Slide-over drawer for row-level audit comments with pre-canned flags.
- `review/DirectorSignModal.tsx`: Director PIN entry modal with statutory declaration and SHA-256 preview.
- `review/GreenStampedSeal.tsx`: Official certificate seal with Guilloche animated watermark, copyable digest, and eMaap QR.
- `reports/ReportRepositoryView.tsx`: Searchable grid of bilingual certificates with 1-click PDF/A & DOCX downloads.
- `iot/LiveBridge.tsx`: WebSerial connection manager, live scale readout, and terminal console.
- `iot/VirtualScaleSimulator.tsx`: Zero-hardware balance emulator generating CAS, Mettler, and Avery ASCII packets.
- `iot/WelmecAuditPanel.tsx`: WELMEC 7.2 software examination card with calibration counters and tamper simulation.
- `ingestion/ExcelIngestionView.tsx`: 4-sub-tab legacy Excel flaw auditor.

---

## SECTION 11 — DESIGN SYSTEM & VISUAL TOKENS

### Clean, Dark-First Precision Laboratory Aesthetics
- **Theme**: Dark-first (`#080c14` app background, `#0f1728` card background) with clean light mode (`#f8fafc` app background, `#ffffff` card surface).
- **Aesthetic**: Modern, high-precision engineering dashboard — crisp borders, subtle glassmorphism (`backdrop-blur-md`), zero decorative clutter, and tabular alignment.
- **Card Padding**: `p-4 sm:p-6` with rounded corners (`rounded-xl` / `rounded-2xl`).

### Color Tokens
```css
/* Primary Brand */
--brand-500: #3b82f6;   /* Blue — Primary interactive actions */
--brand-600: #2563eb;

/* Metrological Status Semantics */
--pass:      #10b981;   /* Emerald-500 — PASS / Certified / Compliant */
--fail:      #ef4444;   /* Red-500     — FAIL / Non-Compliant / Rejected */
--warn:      #f59e0b;   /* Amber-500   — Near-Limit / Marginal */
--pending:   #6366f1;   /* Indigo-500  — In Review / Pending */

/* Backgrounds & Borders */
--bg-dark:       #080c14;
--surface-dark:  #0f1728;
--border-dark:   rgba(255, 255, 255, 0.08);

--bg-light:      #f8fafc;
--surface-light: #ffffff;
--border-light:  rgba(0, 0, 0, 0.08);
```

### Typography Rules
```css
font-family: 'Inter', system-ui, sans-serif;         /* Body and UI labels */
font-family: 'IBM Plex Mono', monospace;             /* Numbers, readings, errors, serials, hashes */

/* Numbers in tables and metric cards must ALWAYS use tabular numbers */
font-variant-numeric: tabular-nums;
```

---

## SECTION 12 — FRONTEND REACT STATE ARCHITECTURE

The application manages frontend state using 4 modular React Context providers:

### 1. `LabContext` (`frontend/src/context/LabContext.tsx`)
Manages active laboratory node, user authentication, and multi-lab routing.
```typescript
interface LabContextType {
  activeLab: Laboratory;                                              // Current statutory lab (RRSL Bengaluru, Delhi, etc.)
  setActiveLab: (lab: Laboratory) => void;
  currentUser: UserProfile;                                           // Authenticated user profile
  setUserRole: (role: UserRole) => void;                              // 1-Click Role Switcher ('METROLOGIST' | 'REVIEWER' | 'DIRECTOR' | 'ADMIN')
  isAuthenticated: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
  activeTestCount: number;
  lockedSessionCount: number;
  syncStatus: 'ONLINE_POSTGRES' | 'LOCAL_SQLITE_SYNCING' | 'OFFLINE';
  isOnline: boolean;
}
```

### 2. `ScenarioContext` (`frontend/src/context/ScenarioContext.tsx`)
Manages 1-click synthetic edge-case scenario loading across the testing grids.
```typescript
interface ScenarioContextType {
  activeScenario: SyntheticScenario | null;                           // Active loaded scenario
  isLoadingScenario: boolean;
  scenarioError: string | null;
  allScenarios: SyntheticScenario[];                                  // Full list of 5 synthetic scenarios
  loadScenario: (scenarioId: string) => Promise<SyntheticScenario>;   // 1-Click loader (e.g. 'scenario-2')
  clearScenario: () => void;
  isRoundingTrapActive: boolean;                                      // Flags whether Scenario 2 rounding trap is active
  loadedSessionId: string | null;
  loadedSessionNumber: string | null;
}
```

### 3. `IoTContext` (`frontend/src/context/IoTContext.tsx`)
Manages live hardware RS-232 / USB scale connections and the virtual scale emulator.
```typescript
interface IoTContextType {
  isConnected: boolean;                                               // Hardware COM connection status
  isSimulatorActive: boolean;                                         // Virtual scale simulator active
  currentPacket: SerialTelemetryPacket | null;                        // Live ASCII packet
  currentWeight: number;                                              // Live indicator weight (grams)
  isStable: boolean;                                                  // Stability flag from scale
  unit: string;                                                       // 'g' | 'kg'
  isZero: boolean;
  mode: string;                                                       // 'GROSS' | 'NET'
  serialLogs: { id: string; time: string; text: string; dir: 'RX' | 'TX' }[];
  welmecAudit: WelmecAuditTelemetry;                                  // WELMEC 7.2 software audit telemetry
  autoCaptureToGrid: boolean;                                         // Auto-insert stable weight into active test row
  lastCapturedWeight: number | null;
  setIsSimulatorActive: (active: boolean) => void;
  setAutoCaptureToGrid: (enabled: boolean) => void;
  connectPhysicalSerial: (baudRate?: number) => Promise<boolean>;     // W3C WebSerial API connection
  disconnectPhysicalSerial: () => Promise<void>;
  sendSerialCommand: (cmd: string) => Promise<boolean>;
  interrogateWelmec: (simulateTamper?: boolean) => Promise<WelmecAuditTelemetry>;
  captureCurrentReading: () => { weight: number; isStable: boolean };
  clearLogs: () => void;
}
```

### 4. `ThemeContext` (`frontend/src/context/ThemeContext.tsx`)
Manages application-wide dark/light theme switching.
```typescript
interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}
```

---

## SECTION 13 — SIDEBAR NAVIGATION STRUCTURE

From `frontend/src/components/layout/Sidebar.tsx`:

| NavItemKey | Tab Label | Section | Icon Name | Target View |
|-----------|-----------|---------|-----------|-------------|
| `dashboard` | Dashboard | Main | `LayoutDashboard` | `LabDashboard.tsx` |
| `intake` | Instrument Intake | Main | `PackagePlus` | `InstrumentIntakeForm.tsx` |
| `workspace` | Active Tests | Tests | `ClipboardList` | `ActiveTestsWorkspace.tsx` |
| `live_bridge` | Scale Bridge | Tests | `Wifi` | `LiveBridge.tsx` |
| `tam` | Test Scope Matrix | Tests | `Grid3x3` | `TestScopeMatrix.tsx` |
| `vision_audit` | Visual Inspection | Tests | `Camera` | `PhysicalAuditorView.tsx` |
| `weighing` | Weighing Error | Tests | `Scale` | `ObservationGrid.tsx` |
| `eccentricity` | Eccentricity | Tests | `Crosshair` | `PlatterHeatmap.tsx` |
| `repeatability` | Repeatability | Tests | `RefreshCw` | `RepeatabilityView.tsx` |
| `tare_temp` | Environmental Drift | Tests | `Thermometer` | `TareTempView.tsx` |
| `traceability` | Standard Weights | Assurance | `Weight` | Standard Weights Traceability View |
| `review` | Review & Sign | Assurance | `ShieldCheck` | `ReviewPipeline.tsx` |
| `excel_migration` | Excel Migration | Assurance | `FileSpreadsheet` | `ExcelIngestionView.tsx` |
| `reports` | Certificates | Compliance | `FileText` | `ReportRepositoryView.tsx` |

---

## SECTION 14 — ERROR HANDLING & CLIENT-SIDE VALIDATION

### Clean UI Feedback Patterns
- **Immediate Inline Validation**: When an input violates a rule (e.g. Max capacity $\le$ Min capacity), the field receives a crisp red border and a small red helper text directly underneath.
- **Non-Intrusive Toast Alerts**: Async actions (saving observations, loading scenarios, copying digests) trigger subtle, auto-dismissing toast notifications in the top-right corner.
- **Empty States**: If a table has no data, render an informative graphic with an actionable primary button (e.g. `+ Register Instrument` or `Load Demo Scenario`) rather than a blank screen.

### Client-Side Form Validations

| Input Field | Client-Side Rule | Immediate UI Feedback |
|-------------|------------------|-----------------------|
| **Manufacturer & Model** | Minimum 2 alphanumeric characters | Red border + "Please provide a valid manufacturer name" |
| **Serial Number** | Minimum 2 characters | Red border + "Serial number required" |
| **Max Capacity** | Numeric, $> 0$, must be $> \text{Min}$ | Red border + "Max capacity must be greater than Min" |
| **Min Capacity** | Numeric, $> 0$, must be $\ge 20e$ (Class III) | Red border + "Min capacity cannot be less than statutory limit ($20e$)" |
| **Scale Interval $e$** | Numeric, $> 0$, must divide evenly into Max | Red border + "Verification interval $e$ must divide Max evenly" |
| **Director PIN** | Exactly 4 numeric digits | Red shake animation on PIN inputs |

---

## SECTION 15 — FRONTEND TARGET RUNTIMES

The frontend application is engineered to run seamlessly across two target environments:

1. **Modern Web Browser (Vite SPA)**: Runs in any modern Chromium/Firefox/Safari browser on `http://localhost:5173`. Uses browser-native W3C WebSerial API for direct zero-latency RS-232 balance streaming.
2. **Native Desktop Application via Tauri (`src-tauri/`)**: Compiles to a lightweight, offline `.exe` executable for air-gapped regional laboratory workstations with zero internet connectivity.

---

*Specification engineered for automated frontend code generation under Smart India Hackathon (SIH 2026).*  
*Problem Statement ID: 26035 | Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution, Government of India.*
