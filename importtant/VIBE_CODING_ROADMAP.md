# METROLOGIX-76 — 30-STEP VIBE CODING MASTER EXECUTION BLUEPRINT
## Zero-Bug, Production-Grade, Step-by-Step Implementation Guide for SIH Problem Statement 26035

> **How to Use This Blueprint:**
> Each step below is an atomic, self-contained coding unit. You can copy the **"Ready-to-Use Vibe Prompt"** directly into your AI assistant (Claude / Antigravity). Do NOT start Step $N+1$ until the **Verification Test Gate** for Step $N$ passes with 100% green tests.

---

### Master Architecture Overview
```
[Phase 1: Pure Metrological Math & Core Types] ----> Steps 01 to 08
[Phase 2: Database, Persistence & RBAC] -----------> Steps 09 to 12
[Phase 3: Extended OIML R 76 Tests & Traceability] -> Steps 13 to 16
[Phase 4: Frontend Workspace & Visualizations] -----> Steps 17 to 21
[Phase 5: Official R 76-2 Dual Reporting & Crypto] --> Steps 22 to 25
[Phase 6: Hardware IoT, Vision & Grand Finale] -----> Steps 26 to 30
```

---

## PHASE 1: PURE METROLOGICAL MATH & CORE TYPES (Steps 01–08)

### Step 01: Project Scaffolding, Monorepo Structure & Environment Setup
- **Goal:** Set up a clean, scalable monorepo with strict linting, type-checking, and isolated virtual environments.
- **Deliverables:**
  - Root directory with `backend/` (FastAPI + Poetry/pip-tools) and `frontend/` (Vite + React 18 + TypeScript).
  - Backend configuration: `pyproject.toml`, `.env.example`, `pytest.ini`.
  - Frontend configuration: `package.json`, `tsconfig.json`, `tailwind.config.js`.
  - Common schemas directory for shared JSON contracts.
- **Zero-Bug Rules:** No ad-hoc global packages; strict Python 3.11+ type hints (`mypy --strict`); strict TypeScript compiler options (`"strict": true`).
- **Verification Test Gate:** `pytest` runs and passes (empty test); `npm run build` in frontend succeeds.
- **Ready-to-Use Vibe Prompt:**
  > *"Scaffold a production-grade monorepo for METROLOGIX-76. The backend must be Python 3.11 FastAPI with `pytest`, `mypy`, `ruff`, and Pydantic v2. The frontend must be Vite + React 18 + TypeScript + Tailwind CSS with strict typing. Provide a root Makefile or npm run scripts to run linting, tests, and dev servers simultaneously. Include a clean folder structure separating `/core` (pure domain math), `/api` (REST routes), `/db` (persistence), and `/frontend/src`."*

---

### Step 02: Decimal Metrology Types & Pydantic Data Models
- **Goal:** Define lossless high-precision metrological data structures using `decimal.Decimal`.
- **Deliverables:** `backend/app/core/types.py` & `backend/app/core/schemas.py`:
  - `AccuracyClass`: Enum (`CLASS_I`, `CLASS_II`, `CLASS_III`, `CLASS_IIII`).
  - `VerificationStage`: Enum (`INITIAL_TYPE_APPROVAL`, `SUBSEQUENT_IN_SERVICE`).
  - `UnitOfMeasure`: Enum (`MILLIGRAM`, `GRAM`, `KILOGRAM`, `TONNE`).
  - `InstrumentSpecification`: Pydantic model (`max_capacity`, `min_capacity`, `e`, `d`, `accuracy_class`, `is_multi_interval`, `intervals_array`).
  - `ObservationPoint`: Pydantic model with strict Decimal parsing (no IEEE 754 floating-point inaccuracy).
- **Zero-Bug Rules:** Never use Python `float` for legal measurements. All load, indication, and error fields must be `Decimal`.
- **Verification Test Gate:** Run unit tests asserting `Decimal('0.1') + Decimal('0.2') == Decimal('0.3')` and verifying Pydantic serialization round-trips.
- **Ready-to-Use Vibe Prompt:**
  > *"Create `backend/app/core/types.py` and `backend/app/core/schemas.py`. Implement type-safe Pydantic v2 schemas for Non-Automatic Weighing Instruments as per OIML R 76-1. Use `decimal.Decimal` exclusively for all physical values (load, indication, e, d, errors). Include Enums for Accuracy Class (I, II, III, IIII) and Verification Stage (Initial vs In-Service). Add custom Pydantic validators ensuring Max > Min, e >= d, and positive intervals. Write comprehensive pytest unit tests for schema validation."*

---

### Step 03: Scale Interval Validator ($n = \text{Max}/e$ against OIML Table 3)
- **Goal:** Implement the physical and legal coherence validator for declared instrument parameters.
- **Deliverables:** `backend/app/core/scale_interval_validator.py`:
  - Computes $n = \frac{\text{Max}}{e}$.
  - Evaluates $n$ and $e$ bounds against OIML R 76-1:2006 Table 3 (e.g., Class III: $100 \le n \le 10,000$ for $0.1\text{g} \le e \le 2\text{g}$; $500 \le n \le 10,000$ for $5\text{g} \le e$).
  - Validates minimum capacity $\text{Min} = 20e$ (or $100e$ for Class I, $10e$ for Class IIII).
  - Returns a detailed validation result with error explanations if non-compliant.
- **Zero-Bug Rules:** Zero hardcoded magic numbers inside functions — all class limits must be referenced from a structured data table.
- **Verification Test Gate:** Pytest covering all 4 accuracy classes: 10 valid test cases and 10 invalid parameter combinations (e.g. $n = 60,000$ on Class III must fail).
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/scale_interval_validator.py` implementing OIML R 76-1 Table 3 scale interval verification. Given `InstrumentSpecification`, calculate $n = \text{Max}/e$, verify that $n$ falls within the legal range for the declared Accuracy Class, verify that $e$ meets minimum/maximum interval values, and confirm minimum load $\text{Min}$. Return a structured result object: `{is_valid: bool, n: Decimal, min_required: Decimal, violations: list[str]}`. Write 15+ pytest tests covering valid and edge-case invalid instruments."*

---

### Step 04: Digital Changeover Point & Error Correction Math Engine
- **Goal:** Implement the heart of OIML R 76-1 metrological calculation (Clause A.4.4.3).
- **Deliverables:** `backend/app/core/changeover_engine.py`:
  - Pure function: `calculate_changeover(I: Decimal, e: Decimal, delta_L: Decimal) -> Decimal` computing $P = I + 0.5e - \Delta L$.
  - Uncorrected error: $E = P - L$.
  - Corrected unrounded error: $E_c = E - E_0$, where $E_0$ is zero-load error calculated at test run start.
  - Return complete trace object containing $P, E, E_0, E_c$ and intermediate step formulas.
- **Zero-Bug Rules:** Must maintain full decimal precision without rounding until the final legal display step.
- **Verification Test Gate:** Pytest verifying textbook example: $L=10000.0, I=10000.0, e=5.0, \Delta L=1.5, E_0=+0.5 \implies P=10001.0, E=+1.0, E_c=+0.5$.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/changeover_engine.py` implementing OIML R 76-1 Clause A.4.4.3 changeover point mathematics. Implement `compute_changeover_point(load: Decimal, indication: Decimal, e: Decimal, delta_L: Decimal, zero_error: Decimal) -> ChangeoverResult`. The result must contain unrounded true indication $P = I + 0.5e - \Delta L$, uncorrected error $E = P - L$, and corrected error $E_c = E - E_0$. Include step-by-step mathematical explanation strings in the result object for UI inspection. Write comprehensive pytest unit tests."*

---

### Step 05: Stage-Aware Maximum Permissible Error (MPE) Resolver
- **Goal:** Implement Table 6 MPE step limits with dynamic Initial Verification vs In-Service doubling.
- **Deliverables:** `backend/app/core/mpe_resolver.py`:
  - Determines load interval $m = L / e$.
  - Evaluates step threshold brackets per accuracy class:
    - Class III: $0 \le m \le 500 \implies \pm 0.5e$; $500 < m \le 2000 \implies \pm 1.0e$; $2000 < m \le 10000 \implies \pm 1.5e$.
  - Applies Stage Multiplier: $\text{MPE}_{\text{in-service}} = 2 \times \text{MPE}_{\text{initial}}$ per Legal Metrology (General) Rules Schedule VII.
  - Returns: `mpe_value`, `mpe_in_units_of_e`, `margin = |mpe_value| - |E_c|`, `is_compliant = |E_c| <= |mpe_value|`.
- **Zero-Bug Rules:** Exact boundary equality checks ($m = 500.0e$ is strictly within the $\pm 0.5e$ tier; $m = 500.001e$ enters $\pm 1.0e$).
- **Verification Test Gate:** Pytest testing boundaries $499.99e, 500.00e, 500.01e, 1999.99e, 2000.00e, 2000.01e$ across all 4 classes in both initial and in-service modes.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/mpe_resolver.py` implementing OIML R 76-1 Table 6 Maximum Permissible Error step logic. Support all 4 accuracy classes (I, II, III, IIII) and stage awareness: Initial Verification ($\pm 0.5e, \pm 1.0e, \pm 1.5e$) vs In-Service Re-verification ($2\times$ doubling). Given load $L$, verification interval $e$, accuracy class, and stage, calculate the exact allowable MPE. Given corrected error $E_c$, evaluate pass/fail and calculate compliance margin. Write exhaustive boundary tests for loads at exact threshold boundaries."*

---

### Step 06: Multi-Interval & Multi-Range Partial Interval Resolver
- **Goal:** Support retail and industrial scales with variable scale intervals across load ranges (OIML R 76-1 Clause 3.2).
- **Deliverables:** `backend/app/core/multi_interval_engine.py`:
  - Handles instruments where $e_1 = 1\text{g}$ for $0-2\text{kg}$ and $e_2 = 2\text{g}$ for $2-5\text{kg}$.
  - Dynamically resolves which partial range $W_i$ the load falls into and applies corresponding $e_i$.
  - Adjusts MPE calculation seamlessly for multi-interval instruments.
- **Zero-Bug Rules:** Enforce monotonic increase of verification intervals ($e_1 < e_2 < \dots < e_r$).
- **Verification Test Gate:** Pytest simulating a dual-interval supermarket balance with load transition at $2000\text{g}$.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/multi_interval_engine.py` supporting multi-interval and multi-range weighing instruments under OIML R 76-1 Clause 3.2. Implement models for partial weighing ranges $W_i = (\text{Min}_i, \text{Max}_i, e_i, d_i)$. Write a resolver that identifies the active partial range for any test load $L$ and computes the correct scale interval $e$ and MPE tier. Include unit tests for dual-interval scales at load points below, on, and above the range switch point."*

---

### Step 07: Versioned RulePack Engine (OIML 2006 vs 2026 Revision Draft)
- **Goal:** Future-proof the application against international standard revisions using declarative JSON/YAML RulePacks.
- **Deliverables:** `backend/app/core/rulepack/`:
  - `rulepack_schema.py`: Pydantic schema for RulePack definition.
  - `oiml_r76_2006.yaml`: Base standard currently active.
  - `oiml_r76_2026_draft.yaml`: Future revision draft.
  - `rulepack_manager.py`: Loader that compiles RulePacks dynamically into runtime MPE and TAM evaluators.
- **Zero-Bug Rules:** The calculation engine must never import hardcoded numbers; all tolerances and formulas must be driven by the active RulePack.
- **Verification Test Gate:** Pytest loading both RulePacks and demonstrating that replaying the same observation dataset under 2006 vs 2026 yields distinct, rule-driven evaluation results.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/rulepack/` providing a declarative RulePack engine. Define YAML schemas for legal metrology standards containing MPE tables, accuracy class criteria, and test requirements. Create `oiml_r76_2006.yaml` and `oiml_r76_2026_draft.yaml`. Build `RulePackManager` to load, validate, and query RulePacks at runtime. Write pytest tests proving the metrology engine can dynamically swap rulepacks and re-evaluate compliance."*

---

### Step 08: Automated Test Applicability Matrix (TAM) Engine
- **Goal:** Build the engine that inspects declared scale parameters and automatically generates the mandatory test plan.
- **Deliverables:** `backend/app/core/tam_engine.py`:
  - Evaluates: Capacity, verification intervals $n$, receptor type (`PLATFORM`, `HANGING`, `WEIGHBRIDGE`, `TANK`), mobility (`PORTABLE`, `FIXED`).
  - Automatically selects applicable test suite: Weighing, Repeatability, Eccentricity, Discrimination, Tare, Temperature, Tilting (for portable non-leveled scales).
  - Generates target load points for each test (e.g., Min, 500e, 2000e, Max).
- **Zero-Bug Rules:** No manual test picking — every test must be legally justified by an OIML R 76 clause reference.
- **Verification Test Gate:** Pytest verifying that a $60\text{kg}$ platform scale gets 4-corner eccentricity, while a $50\text{t}$ weighbridge gets rolling-load eccentricity with standard axles.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/tam_engine.py` implementing the Test Applicability Matrix for OIML R 76-1. Given `InstrumentSpecification`, automatically generate the customized battery of required test procedures and calculated load points (Min, 500e, 2000e, Max, 4-corner loads). Each test procedure must cite the authorizing OIML clause. Write pytest tests verifying test batteries for laboratory balances, retail counter scales, and heavy industrial platform scales."*

---

## PHASE 2: DATABASE, PERSISTENCE & RBAC (Steps 09–12)

### Step 09: Unified Lean PostgreSQL & SQLite Database Schema
- **Goal:** Design the production-grade database schema with support for centralized PostgreSQL and local SQLite desktop fallback.
- **Deliverables:** `backend/app/db/`:
  - `models.py`: SQLAlchemy 2.0 async models for `User`, `Laboratory`, `Instrument`, `TestSession`, `TestObservation`, `AuditTrailEvent`, `StandardWeightSet`.
  - Use `JSONB` on PostgreSQL (and `JSON` fallback on SQLite) for flexible observation grids.
  - Decimal precision columns (`Numeric(16, 6)`) for all physical loads and errors.
- **Zero-Bug Rules:** Strict foreign key constraints with cascade rules; indexed `created_at` and `instrument_id` for sub-millisecond lookups.
- **Verification Test Gate:** Alembic migration runs up and down cleanly on both SQLite and PostgreSQL.
- **Ready-to-Use Vibe Prompt:**
  > *"Create `backend/app/db/models.py` using SQLAlchemy 2.0 (async). Design tables: `users` (RBAC), `laboratories` (RRSL/GATC metadata), `instruments` (specs), `test_sessions` (type evaluation status), `test_observations` (detailed changeover readings with JSON payloads), `audit_trail_events` (immutable event log), and `standard_weight_sets` (OIML R 111 calibration traceability). Ensure schema is 100% compatible with both PostgreSQL and SQLite. Provide an initial Alembic migration."*

---

### Step 10: Database Seed Data & Repository Pattern Layer
- **Goal:** Build clean repository abstractions for data access and seed official RRSL and GATC test lab profiles.
- **Deliverables:** `backend/app/db/repositories/` & `backend/app/db/seed.py`:
  - `InstrumentRepository`, `TestSessionRepository`, `AuditRepository`.
  - Seed script inserting 6 RRSLs (Bengaluru, Ahmedabad, Faridabad, etc.), standard OIML R 111 weight sets (Class $E_2, F_1, F_2, M_1$), and demo user roles.
- **Zero-Bug Rules:** Use Repository pattern so business logic never executes raw SQL or leaks DB session handling.
- **Verification Test Gate:** Run seed script; query repositories in unit tests asserting seeded data exists.
- **Ready-to-Use Vibe Prompt:**
  > *"Build the Repository Pattern layer in `backend/app/db/repositories/` for instruments, sessions, observations, and equipment. Create a database seeder script in `backend/app/db/seed.py` that populates Indian RRSL laboratory locations, standard user accounts, and certified OIML R 111 weight sets with calibration validity dates. Write pytest tests verifying repository CRUD operations."*

---

### Step 11: Immutable Audit Trail & Cryptographic Event Sourcing
- **Goal:** Implement tamper-evident logging where every observation change is hashed with the operator's identity.
- **Deliverables:** `backend/app/core/audit_logger.py`:
  - Intercepts observation updates.
  - Records: `event_id`, `session_id`, `operator_id`, `timestamp_ist`, `field_name`, `old_value`, `new_value`, `justification_reason`.
  - Computes continuous SHA-256 Merkle chain hash: $H_k = \text{SHA256}(H_{k-1} + \text{payload}_k)$.
- **Zero-Bug Rules:** Audit trail records can NEVER be updated or deleted (`ON DELETE RESTRICT` / trigger-enforced).
- **Verification Test Gate:** Pytest testing that tampering with an audit record breaks the cryptographic chain verification.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/audit_logger.py` implementing an immutable, append-only audit trail for test observations. Every modification must log the operator, timestamp (IST), field changed, previous value, new value, and mandatory reason. Implement a continuous SHA-256 hash chain where each event includes the hash of the preceding event. Provide a verification function `verify_audit_integrity(session_id: str) -> bool` that detects any manual database tampering. Include pytest tests."*

---

### Step 12: Statutory Laboratory RBAC & JWT Authentication
- **Goal:** Implement the multi-tier laboratory permission hierarchy.
- **Deliverables:** `backend/app/api/auth.py` & `backend/app/core/security.py`:
  - Roles: `METROLOGIST` (Testing Officer), `REVIEWER` (Principal Scientific Officer), `DIRECTOR` (Lab Head / Issuing Authority), `AUDITOR` (Read-only DoCA Inspector).
  - FastAPI dependency injectors: `require_role(Role.REVIEWER)`, `require_role(Role.DIRECTOR)`.
  - Secure password hashing (Argon2 / bcrypt) + stateless JWT token issuance.
- **Zero-Bug Rules:** Metrologists can never approve sessions or digitally sign certificates; Directors cannot overwrite raw test observations without audit logging.
- **Verification Test Gate:** Pytest trying to access review endpoints with `METROLOGIST` token returning `403 Forbidden`.
- **Ready-to-Use Vibe Prompt:**
  > *"Implement JWT authentication and Role-Based Access Control (RBAC) in `backend/app/api/auth.py` and `backend/app/core/security.py`. Define roles: METROLOGIST, REVIEWER, DIRECTOR, and AUDITOR. Implement FastAPI security dependencies `get_current_user` and `require_roles([Role.REVIEWER, Role.DIRECTOR])`. Enforce separation of duties: Metrologists can only enter raw observations; only Reviewers can request re-tests; only Directors can issue final certificates. Write pytest tests for all authorization scenarios."*

---

## PHASE 3: EXTENDED OIML R 76 TESTS & TRACEABILITY (Steps 13–16)

### Step 13: Eccentricity (Corner Loading) Test Engine
- **Goal:** Implement Clause A.4.7 eccentricity evaluations for all platform configurations.
- **Deliverables:** `backend/app/core/eccentricity_engine.py`:
  - Calculates required test load: $L = \frac{1}{3}\text{Max}$ (4 supports), $L = \frac{1}{N-1}\text{Max}$ ($N > 4$ supports), $L = 0.8\text{Max}$ (rolling loads).
  - Evaluates corrected error $E_c$ at center and each quadrant/corner against $\text{MPE}_{\text{initial}}(L)$.
  - Calculates maximum inter-corner spread: $\Delta E_{\text{corner}} = E_{c,\max} - E_{c,\min}$.
- **Zero-Bug Rules:** Enforce test load placement sequence per R 76-1: center $\to$ front-left $\to$ rear-left $\to$ rear-right $\to$ front-right.
- **Verification Test Gate:** Pytest verifying pass condition when all corners $< \text{MPE}$, and fail condition when front-right corner deflects beyond tolerance.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/eccentricity_engine.py` implementing OIML R 76-1 Clause A.4.7 Corner Loading tests. Support 4-point platforms ($L = \frac{1}{3}\text{Max}$), multi-point platforms ($L = \frac{1}{N-1}\text{Max}$), and rolling loads. For each load position, compute $P$, uncorrected $E$, and corrected $E_c$ via auxiliary weights. Compare errors against MPE at the test load and compute maximum corner error spread. Write comprehensive pytest unit tests."*

---

### Step 14: Repeatability & Discrimination Test Engines
- **Goal:** Implement Clause A.4.10 repeatability and Clause A.4.8 discrimination/sensitivity checks.
- **Deliverables:** `backend/app/core/repeatability_engine.py` & `backend/app/core/discrimination_engine.py`:
  - **Repeatability:** Two load series (approx. $50\%\text{Max}$ and $100\%\text{Max}$); minimum 10 consecutive runs (or 3 series of 6); verifies $E_{\max} - E_{\min} \le |\text{MPE}(L)|$.
  - **Discrimination:** With scale in equilibrium at Min, $0.5\text{Max}$, and Max, an extra load of $1.4d$ placed gently must produce an indication increase of at least $1d$.
- **Zero-Bug Rules:** Calculate empirical standard deviation ($s$) for statistical traceability alongside legal threshold compliance.
- **Verification Test Gate:** Pytest validating repeatability spread and discrimination trigger logic.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/repeatability_engine.py` and `backend/app/core/discrimination_engine.py`. Repeatability must evaluate 10 consecutive runs at 50% and 100% Max, verifying that $E_{\max} - E_{\min} \le |\text{MPE}|$, and calculate standard deviation $s$. Discrimination must evaluate $1.4d$ auxiliary placement at Min, 50% Max, and Max, asserting an unrounded changeover $\ge 1d$. Write thorough pytest unit tests."*

---

### Step 15: Tare Mechanism & Temperature Span Drift Engine
- **Goal:** Implement Clause A.4.6 tare accuracy and Clause A.5.3 temperature influence on span and zero.
- **Deliverables:** `backend/app/core/tare_temp_engine.py`:
  - **Tare Evaluation:** Net load errors verified against MPE calculated for net load.
  - **Temperature Influence:** Computes zero drift per $^\circ\text{C}$: $\Delta E_0 / \Delta T \le 1e / 5^\circ\text{C}$ (Class II/III/IIII) or $0.5e / 5^\circ\text{C}$ (Class I). Evaluates span error shifts between $20^\circ\text{C}$, $-10^\circ\text{C}$, $+40^\circ\text{C}$, and return to $20^\circ\text{C}$.
- **Zero-Bug Rules:** Ensure temperature change rate does not exceed $5^\circ\text{C}/\text{hr}$ per test condition rules.
- **Verification Test Gate:** Pytest validating thermal stability limits and zero-drift pass/fail verdicts.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/tare_temp_engine.py` for OIML R 76-1 Clause A.4.6 (Tare) and Clause A.5.3 (Temperature Influence). Compute zero drift per $5^\circ\text{C}$ temperature delta and compare against class limits ($0.5e$ for Class I, $1.0e$ for Class II/III/IIII). Evaluate span temperature coefficient across reference, cold, and warm chamber conditions. Write pytest tests covering compliant temperature curves and failing thermal drift cases."*

---

### Step 16: OIML R 111 Standard Weight Set & Equipment Traceability Lockout
- **Goal:** Enforce mandatory physical standards traceability before a laboratory test can begin.
- **Deliverables:** `backend/app/core/traceability_validator.py`:
  - Validates that standard weights used have an active calibration certificate (not expired).
  - Checks standard weight class adequacy per R 76-1 Clause 3.7.1: Weight expanded uncertainty $U \le \frac{1}{3}\text{MPE}$ (e.g. Class $E_2$ for Class I, $F_1$ for Class II, $F_2/M_1$ for Class III).
  - Hard-locks the test session workspace if standard weights fail traceability or uncertainty criteria.
- **Zero-Bug Rules:** No test session can be submitted or approved with uncalibrated or out-of-class reference standards.
- **Verification Test Gate:** Pytest checking that an expired calibration certificate or an $M_2$ weight on a Class II scale triggers a metrological hard lockout.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/core/traceability_validator.py` implementing OIML R 111 test equipment validation. Check reference weight class adequacy ($E_2, F_1, F_2, M_1$), calibration certificate expiry, and verify expanded uncertainty satisfies $U \le \frac{1}{3}\text{MPE}$. If any validation fails, return a hard lockout status with an explanatory violation message. Write pytest tests verifying standard weight compatibility."*

---

## PHASE 4: FRONTEND WORKSPACE & VISUALIZATIONS (Steps 17–21)

### Step 17: Next.js / React Lab Design System & Navigation Layout [COMPLETED]
- **Goal:** Build a stunning, professional laboratory design system matching high-end metrology interfaces.
- **Deliverables:** `frontend/src/`:
  - Modern layout with collapsible sidebar navigation, laboratory breadcrumbs, active test counter, and official Government of India / DoCA header styling.
  - Theme support (Sleek dark mode + crisp laboratory high-contrast light mode with class toggle and `localStorage` persistence).
  - Shared UI primitives: Badges (`PASS` in emerald, `FAIL` in ruby, `MARGINAL` in amber, `LOCKED_OUT`, `PENDING`), MetricCards, StatusPills, Button, Modal, DataTable, and LockoutBanner.
  - Complete executive dashboard (`features/dashboard/LabDashboard.tsx`) with live test sessions, physical standard weight calibration tracking, statutory lockout enforcement, and test launch modal.
- **Zero-Bug Rules:** Zero raw inline CSS; 100% Tailwind tokens; responsive and accessible layout.
- **Verification Test Gate:** `npm run build` (`tsc -b && vite build`) passed with zero TypeScript/lint errors in 5.55s. Full backend regression: 334 tests passing in 15.30s with 92% coverage. Ruff: clean with zero errors.
- **Ready-to-Use Vibe Prompt:**
  > *"Build the core frontend design system for METROLOGIX-76 in `frontend/src/` using Vite + React 18 + Tailwind CSS + Lucide Icons. Create a professional national laboratory layout with a top navigation bar (DoCA/RRSL branding, active lab selector, operator profile) and a collapsible sidebar. Implement reusable UI primitives: `MetricCard`, `ComplianceBadge` (PASS in emerald, FAIL in ruby, MARGINAL in amber), `DataTable`, `Modal`, and theme switcher (Dark/Light). Ensure strict TypeScript types."*

---

### Step 18: Instrument Intake, Nameplate OCR & WELMEC 7.2 Software Examination [COMPLETED]
- **Goal:** Build the instrument intake screen that captures specifications (manually or via OCR), displays live TAM test plans, and records WELMEC 7.2 software audit parameters.
- **Deliverables:** `frontend/src/features/intake/InstrumentIntakeForm.tsx`, `backend/app/vision/ocr_intake.py` & `backend/app/api/intake.py`:
  - Form with inputs: Manufacturer, Model, Serial, Accuracy Class (I/II/III/IIII), $\text{Max}, \text{Min}, e, d$, Receptor Type, Number of Supports, Mobility, Tare & Level flags.
  - **PaddleOCR Nameplate Scanner:** Rating plate image dropzone & preview with vision regex heuristics; quick-load presets (Avery Class III 30kg, Mettler Class I 220g, Sansui Class II 600g, Essae Class IIII 5,000kg) that auto-populate specs and software markings.
  - **WELMEC 7.2 & OIML R 76-1 Section 5.5 Software Audit:** Fields capturing legally relevant firmware version, SHA-256 binary checksum hash (with 64-hex char live validator and indicator), calibration event counter ($C$-parameter), and software separation type (`TYPE_P` / `TYPE_U`).
  - **Live Scale Interval Validator:** Real-time calculation of $n = \text{Max}/e$ with Table 3 bracket checks ($n \in [n_{\min}, n_{\max}]$) and green/ruby conformity banners.
  - **Live TAM Preview:** Displays dynamically generated list of required test battery cards (Weighing Clause A.4.4, Eccentricity Clause A.4.7, Repeatability Clause A.4.10, Discrimination Clause A.4.8, Tare Clause A.4.6, Temperature Drift Clause A.5.3) with load points and statutory criteria.
- **Zero-Bug Rules:** Hard lockout gate preventing form submission if scale parameters are mathematically or legally invalid under Table 3, or if the SHA-256 hash is invalid.
- **Verification Test Gate:**
  - Backend integration test: `tests/test_intake_ocr.py` passed 11 of 11 tests. Testing $\text{Max}=30\text{kg}, e=5\text{g} \implies n=6,000$ (Valid Class III) dynamically generates $\ge 6$ test battery cards.
  - Out-of-bracket parameters (e.g. $n=300 < 500$) legally rejected under Table 3.
  - Frontend production build (`tsc -b && vite build`) passed in 2.00s with zero errors; oxlint passed with zero errors. Full backend test suite: 345 passed with 91% code coverage.

---

### Step 19: High-Density Observation Grid with Live Changeover Calculator [COMPLETED]
- **Goal:** The primary laboratory workhorse interface where technicians enter test readings.
- **Deliverables:** `frontend/src/features/testing/ObservationGrid.tsx`:
  - Dense tabular spreadsheet-like grid with keyboard navigation (Arrow Up/Down/Left/Right, Enter, Tab).
  - Columns: Step, Direction ($\uparrow$ ASC / $\downarrow$ DESC), Target Load ($L$), Indication ($I$), Auxiliary Load ($\Delta L$), True Indication ($P$), Error ($E$), Zero ($E_0$), Corrected Error ($E_c$), MPE Limit, Status Badge, and Trace.
  - Interactive "Inspect Calculation Trace" modal on every row showing full mathematical formulas with values plugged in ($P = I + 0.5e - \Delta L$, $E = P - L$, $E_c = E - E_0$, MPE margin, and OIML R 76-1:2006 Clause A.4.4.3 / Seventh Schedule citations).
  - Stage switch toggle: "Initial Verification" (1.0x MPE) vs "In-Service Re-verification" (2.0x MPE) that instantly updates all MPE columns, margins, and status badges.
  - Summary KPI cards strip displaying total evaluated test points, $\max(E_c)$, $\min(E_c)$, error span $\Delta E_c$, and Max-load hysteresis.
- **Zero-Bug Rules:** Instant zero-latency client-side calculation matching the Python backend math to the exact decimal.
- **Verification Test Gate:**
  - Test gate verified: Setting $L = 10000, I = 10000, \Delta L = 1.5$ with $e = 5$ and $E_0 = +0.5 \implies$ Grid instantly renders $P = 10001.0, E_c = +0.5$, green PASS badge!
  - `npm run build` (`tsc -b && vite build`) passed with zero errors in 1.85s; `oxlint` passed across 23 files with zero errors.
  - Full backend test suite passing: 345 of 345 tests with 91% code coverage.

---

### Step 20: Interactive Error Corridor Visualization (Recharts Dynamic MPE Band) [COMPLETED]
- **Goal:** Visualize test errors dynamically against allowable OIML tolerance corridors.
- **Deliverables:** `frontend/src/features/testing/ErrorCorridorChart.tsx` & integration in `ObservationGrid.tsx`:
  - Renders load on X-axis (units of $e$ or kg/g) and error on Y-axis (units of $e$ or grams).
  - Green shaded corridor representing $\pm \text{MPE}$ step envelope ($\pm 0.5e \to \pm 1.0e \to \pm 1.5e$ for Initial Verification, or $\pm 1.0e \to \pm 2.0e \to \pm 3.0e$ for In-Service).
  - Mathematical right-angle vertical jumps at exact Table 6 statutory breakpoints ($500e, 2000e$ for Class III; $5000e, 20000e$ for Class II; etc.).
  - Plotted points for Ascending Load (sky blue curve with solid circles) and Descending Load (purple dashed curve with rotated diamond markers).
  - Hover tooltip with dynamic crosshairs displaying load, scale interval $m = L/e$, corrected error $E_c$, allowable Table 6 tolerance, and positive/negative compliance margin.
  - Interactive toolbar with units toggle ($e$ vs $g$), series visibility toggles (Corridor, Ascending, Descending), expand/minimize view, and live "100% IN CORRIDOR" vs "OUT-OF-CORRIDOR DETECTED" badge.
  - Seamlessly embedded in `frontend/src/features/testing/ObservationGrid.tsx` with a 3-way view mode switcher: `Split View (Grid + Corridor)`, `Observation Grid Only`, and `Tolerance Corridor Only`.
- **Zero-Bug Rules:** The step function renders vertical right-angle jumps at exact boundary points ($500e, 2000e$).
- **Verification Test Gate:**
  - Visual & mathematical gate passed: Error observations plot with zero latency directly inside or outside the shaded tolerance corridor.
  - Verification gate test point ($L=10000, I=10000, \Delta L=1.5, E_c = +0.5$) plots right on the ascending curve inside the $2000e$ corridor with $+1.0e$ margin.
  - `npm run build` (`tsc -b && vite build`) passed with zero errors; `oxlint` passed across 24 files with zero errors.
  - Full backend test suite passing: 345 of 345 tests with 91% code coverage.

---

### Step 21: 2D Dynamic Platter Deflection Heatmap for Corner Loading [COMPLETED]
- **Goal:** Replace boring 5-row eccentricity tables with a visual, interactive platter deflection widget.
- **Deliverables:** `frontend/src/features/testing/PlatterHeatmap.tsx` & integration in `frontend/src/App.tsx`:
  - Renders top-down interactive SVG view of scale platform with 3 geometry modes:
    * `RECTANGLE`: 4 corner quadrants with mechanical load-cell support pins + center bullseye.
    * `CIRCLE`: Circular lab pan with 4 annular sectors + center circular pan.
    * `WEIGHBRIDGE_TRACK`: Longitudinal dual-rail pit with approach, mid, and departure rolling axle zones.
  - 5 prescribed target quadrants per OIML R 76-1 Clause A.4.7.1: Center (Pos 1), Front-Left (Pos 2), Back-Left (Pos 3), Back-Right (Pos 4), and Front-Right (Pos 5).
  - Dynamic deflection heatmap shading based on $|E_c| / \text{MPE}$:
    * Emerald green ($< 50\%\ \text{MPE}$)
    * Amber ($50\% - 100\%\ \text{MPE}$)
    * Flashing crimson red alert ($> 100\%\ \text{MPE}$)
  - Dynamic eccentric deflection vector arrow:
    * Originates at center $(0,0)$ pointing toward the dominant corner of error torque.
    * Displays dynamic tilt angle (e.g. $135^\circ$ SE toward Front-Right) and magnitude.
  - Interactive quadrant editor modal with live Clause A.4.4.3 changeover evaluation ($P = I + 0.5e - \Delta L$, $E_c = E - E_0$), zero reference adjustment, and technician remarks.
  - Controls toolbar with Geometry switcher (`Rectangle`, `Circular Pan`, `Weighbridge Track`), Stage switcher (`Initial 1.0x` vs `In-Service 2.0x`), Support points selector ($N=4$ vs $N=6$), and Export/Save action.
  - Integrated directly into the main application navigation layout under the "Eccentricity Corner Loading" tab.
- **Zero-Bug Rules:** Coordinates and load assignments follow OIML R 76-1 Clause A.4.7 quadrant mapping and exact Table 6 MPE limits.
- **Verification Test Gate:**
  - Visual & mathematical gate passed: Clicking "Fail FR (Test Gate)" immediately sets Front-Right to $L=10000, I=10006, \Delta L=2.0 \implies E_c = +6.00\,\text{g}$, turning that quadrant crimson red with a flashing alert filter and directing the deflection vector directly at Front-Right ($135^\circ$ SE).
  - `npm run build` (`tsc -b && vite build`) passed with zero errors; `oxlint` passed across 25 files with zero errors.
  - Full backend test suite passing: 345 of 345 tests with 91% code coverage.

---

## PHASE 5: OFFICIAL R 76-2 DUAL REPORTING & CRYPTO (Steps 22–25)

### Step 22: Authentic OIML R 76-2 Archival PDF/A Compiler with Bilingual Support [COMPLETED]
- **Goal:** Generate pixel-perfect, 1:1 replicas of the official 8-section OIML R 76-2 international report format in both English and Hindi.
- **Deliverables:** `backend/app/reporting/pdf_compiler.py`, `backend/app/reporting/__init__.py`, and `backend/tests/test_pdf_compiler.py`:
  - **Form 1 (General Information About the Type):** Complete technical specifications table (Pattern type, Model, Serial No, Accuracy Class, Max/Min, $e$, $d$, $n$, Tare device, Load receptor, Power supply, WELMEC 7.2 software version and SHA-256 firmware hash).
  - **Form 2 (Test Equipment & Environmental Conditions):** Traceability details for standard weight set (OIML R 111 Class, Serial, NPL Calibration Cert No, Validity date, Traceability status) and ambient conditions ($T^\circ\text{C}$, RH%, atmospheric pressure $P$, local gravity $g$).
  - **Form 3 (Summary of Type Evaluation):** Master pass/fail table covering all 8 metrological and software evaluation clauses (A.4.4, A.4.7, A.4.8, A.4.10, A.4.1, A.4.6, A.5.3, WELMEC 7.2).
  - **Form 4 (Measurement Observation Sheet — Weighing Performance):** Full multi-point ascending and descending load observation table ($L, I, \Delta L, P, E, E_0, E_c, \text{MPE}$, Margin %, Status).
  - **Form 5 (Measurement Observation Sheet — Eccentricity Corner Loading):** 5-quadrant corner loading table ($L = \frac{1}{3}\text{Max}$, inter-corner spread $\Delta E_{\text{corner}}$, Clause A.4.7 limits).
  - **Form 6 (Measurement Observation Sheet — Repeatability & Discrimination):** 10 consecutive runs at $0.5\text{Max}$ and $\text{Max}$, range $R$, sample standard deviation $s$, and $+1.4d$ discrimination test results.
  - **Form 7 (Measurement Observation Sheet — Tare & Temperature Drift):** Tare accuracy checks and multi-temperature drift tracking ($+20^\circ\text{C} \to +40^\circ\text{C} \to +10^\circ\text{C}$, zero drift per $5^\circ\text{C}$).
  - **Form 8 (Official Certification, Cryptographic QR & Sign-off Block):** 3 statutory signature blocks (Testing Officer, Reviewing Officer, RRSL Director/Controller), cryptographic SHA-256 audit digest, and dynamic high-resolution QR code embedding the verification URL (`https://emaap.doca.gov.in/verify/{report_no}`).
  - **Bilingual Engine:** Generates official reports in English, Devanagari Hindi (using registered Unicode TrueType fonts), or dual-language parallel format matching Gazette of India and DoCA publishing standards.
  - **ISO 19005-1 (PDF/A-1b) Compliance:** Embeds valid XMP metadata packet (`pdfaid:part=1`, `pdfaid:conformance=B`, Dublin Core, XMP Basic) and standard sRGB OutputIntent dictionary (`/GTS_PDFA1`).
  - **Two-Pass Numbered Canvas:** Page numbering strictly follows "Page $X$ of $Y$" with running statutory headers and SHA-256 footer blocks.
- **Zero-Bug Rules:** Exact "Page $X$ of $Y$" numbering via two-pass `OimlNumberedCanvas`; explicit table column widths prevent row splitting and text clipping; lossless decimal precision; valid cross-reference tables without corruption.
- **Verification Test Gate:**
  - Automated PDF/A compliance validator tool `validate_pdfa_compliance(pdf_bytes)` verifies valid PDF header, PDF/A-1b XMP packet, OutputIntent, two-pass page numbering, and detection of all 8 OIML forms.
  - 10 comprehensive unit tests in `backend/tests/test_pdf_compiler.py` covering English, Hindi, and Bilingual compilation, custom data injection, file output, metadata structure, and error handling.
  - Full backend test suite passing: **355 of 355 tests** passing with **92% overall code coverage** (pdf_compiler.py at 99% coverage).

---

### Step 23: Standardized Editable Microsoft Word (.docx) Compiler [COMPLETED]
- **Goal:** Satisfy Problem Statement 26035's explicit mandate for editable test report formats.
- **Deliverables:** `backend/app/reporting/docx_compiler.py`, `backend/app/reporting/__init__.py`, and `backend/tests/test_docx_compiler.py`:
  - Uses `python-docx` to generate fully editable, standardized Microsoft Word (.docx) test reports strictly mirroring the official 8-section OIML R 76-2 international layout.
  - **Form 1 (General Information About the Type):** Complete 4-column key-value table declaring applicant name, manufacturer, pattern type, model, serial number, accuracy class, Max, Min, $e$, $d$, $n$, tare device, load receptor, power supply, WELMEC 7.2 software version, and firmware SHA-256 hash.
  - **Form 2 (Test Equipment & Environmental Conditions):** Standards traceability table detailing standard weight set (OIML R 111 Class, Serial, NPL Calibration Cert No, validity date, active status) and ambient conditions ($T^\circ\text{C}$, RH%, atmospheric pressure $P$, local gravity $g$).
  - **Form 3 (Summary of Type Evaluation):** Master pass/fail table covering all 8 metrological and software evaluation clauses with emerald green (`#dcfce7`) PASS badges and crimson red (`#fee2e2`) FAIL badges.
  - **Form 4 (Measurement Observation Sheet — Weighing Performance):** 12-column high-density table ($L, I, \Delta L, P, E, E_0, E_c, \text{MPE}$, Margin %, Status).
  - **Form 5 (Measurement Observation Sheet — Eccentricity Corner Loading):** 8-column corner loading table for center and 4 corners with inter-corner variation.
  - **Form 6 (Measurement Observation Sheet — Repeatability & Discrimination):** Repeatability tables at $0.5Max$ and $Max$ (10 runs, range $R$, std dev $s$) and $+1.4d$ discrimination test results.
  - **Form 7 (Measurement Observation Sheet — Tare & Temperature Drift):** Tare accuracy checks and multi-temperature drift tracking ($+20^\circ\text{C} \to +40^\circ\text{C} \to +10^\circ\text{C}$, zero drift per $5^\circ\text{C}$).
  - **Form 8 (Official Certification, Cryptographic QR & Sign-off Block):** Embedded high-resolution PNG QR code, SHA-256 audit digest, verification URL, and tripartite sign-off block (Testing Officer, Reviewing Officer, Director/Controller).
  - **Bilingual Engine:** Generates official editable reports in English, Devanagari Hindi, or dual-language parallel format.
- **Zero-Bug Rules:** Explicitly declared cell widths (`col_widths`) across every single cell in all tables to prevent word-wrap corruption in Microsoft Word and LibreOffice; XML shading (`w:shd`) and hairline borders (`w:tblBorders`); `w:cantSplit` on rows to prevent split rows across page breaks; `w:tblHeader` on header rows.
- **Verification Test Gate:**
  - Automated DOCX compliance validator tool `validate_docx_compliance(docx_bytes)` verifies valid DOCX ZIP package, presence of all 8 OIML forms, explicit column width declarations, table count $\ge 8$, and SHA-256 digest.
  - 8 comprehensive unit tests in `backend/tests/test_docx_compiler.py` covering English, Hindi, and Bilingual compilation, custom data injection, file output, and verdict styling.
  - Full backend test suite passing: **363 of 363 tests** passing with **93% overall code coverage** (`docx_compiler.py` at 99% coverage, `pdf_compiler.py` at 99% coverage).

---

### Step 24: Cryptographic ECDSA Digital Signing & eMaap QR Code Generator [COMPLETED]
- **Goal:** Implement non-repudiation and instant mobile verification for issued test reports.
- **Deliverables:** `backend/app/core/crypto_signer.py` & `backend/app/api/verification.py`:
  - **ECDSA NIST P-256 (`secp256r1`) Signing & Verification:** Uses Python's `cryptography.hazmat` library conforming to CCA India standards under the IT Act, 2000.
  - **Deterministic JSON Canonicalization:** `canonicalize_payload(data)` sorts keys recursively, removes whitespace, formats Python `Decimal` objects losslessly without scientific notation, and standardizes datetimes into ISO UTC strings.
  - **SHA-256 Digest Calculation:** Computes deterministic 64-character hex digests of canonical test session payloads.
  - **Cryptographic Signature Block:** `DigitalSignatureBlock` containing `signature_base64`, `signature_hex`, `digest_sha256`, `public_key_pem`, `key_id`, `signer_identity`, `verification_url`, and `timestamp_iso`.
  - **High-Resolution QR Code Engine:** Generates PIL-based PNG byte streams (error correction M, border 4, box size 10) and Base64 data URLs for seamless embedding into both PDF/A and DOCX report compilers.
  - **eMaap URL Formatting:** Real-time generation of official portal verification URLs: `https://emaap.doca.gov.in/verify/{report_uuid}?sig={signature}` with URL-safe base64 encoding without padding.
  - **Public Verification API Endpoints (`/api/v1/verify`):**
    * `GET /api/v1/verify/{report_uuid}`: Public verification endpoint returning validity, report metadata, digital certificate, and official eMaap portal link.
    * `POST /api/v1/verify/check`: Public mathematical signature verification endpoint supporting direct JSON payload validation against public keys or authority signers.
    * `POST /api/v1/verify/sign`: Laboratory authority endpoint generating digital signature blocks and QR codes for test sessions.
    * `GET /api/v1/verify/{report_uuid}/qr`: Public image endpoint returning binary PNG QR code (`image/png`).
- **Zero-Bug Rules:** Private keys securely loadable from environment variable / PKCS#8 encrypted PEM file with passphrase; mathematical verification strictly verifies raw ECDSA DER signature over SHA-256 digest; signature format automatically decodes URL-safe Base64, standard Base64, or Hex.
- **Verification Test Gate:**
  - 18 comprehensive unit and integration tests in `backend/tests/test_crypto_signer.py`:
    * Keypair generation, PKCS#8 password-encrypted export & import.
    * Deterministic canonicalization invariance across key order and numeric types.
    * Authentic signature verification returning `True`.
    * 1-byte payload tampering (e.g. changing 1 single digit or character) returns `False`.
    * Signature bit-flip / truncation tampering returns `False`.
    * Different key verification failure detection.
    * High-resolution PNG and Base64 QR code generation with valid image decoding.
    * Full API endpoint testing (`GET /verify/{uuid}`, `POST /verify/check`, `POST /verify/sign`, `GET /verify/{uuid}/qr`).
  - Full backend regression test suite: **381 of 381 tests passing** (100% pass rate, 92% coverage across the entire backend).

---

### Step 25: Multi-Tier Laboratory Review Pipeline & Row-Level Audit UI [COMPLETED]
- **Goal:** Build the UI workflow where Reviewing Officers inspect calculations, leave notes, and Directors sign certificates.
- **Deliverables:** `frontend/src/features/review/` & `backend/app/api/review.py`:
  - **`ReviewerQueue.tsx`:** Operational triage queue with filter chips (`All`, `Pending Review`, `In-Testing`, `Approved & Sealed`, `Remanded for Retest`), search bar, class selector, and role-sensitive action buttons.
  - **`RowLevelCommentDrawer.tsx`:** Slide-over drawer opened by clicking any observation row. Displays raw parameters, live OIML R 76-1 Clause A.4.4.3 calculation trace ($P = I + 0.5d - \Delta L$, $E_c = E - E_0$), quick metrology audit flag chips (*"Repeatability margin too low (< 0.2e); re-test recommended."*), severity levels (`FLAG`, `NOTE`, `REJECT_REASON`), and chronological audit remarks thread.
  - **`DirectorSignModal.tsx`:** Restricted modal for `DIRECTOR` role displaying deterministic canonical SHA-256 digest, 4-digit laboratory signing PIN prompt (`1234`), statutory confirmation under Rule 16 of Legal Metrology (General) Rules, 2011, and ECDSA P-256 signing trigger.
  - **`GreenStampedSeal.tsx`:** Authentic Government of India Legal Metrology green stamped seal component with concentric guilloche watermark, official RRSL stamp emblem, Certificate UUID, non-repudiable SHA-256 digest, and embedded eMaap verification QR code.
  - **`ReviewPipeline.tsx`:** Main master orchestrator combining the queue, detailed evaluation session view, multi-test tabbed inspection (Form 4 Weighing, Form 5 Eccentricity, Automated Metrological Anomaly & Anti-Fraud Scan, Audit Notes), and interactive Role Switcher (`Metrologist`, `Reviewing Officer`, `Lab Director`).
  - **Backend Review API (`/api/v1/review`):**
    * `GET /api/v1/review/queue`: List and filter evaluation sessions in the review queue.
    * `POST /api/v1/review/sessions/{id}/submit`: Metrologist transitions session to `PENDING_REVIEW` with append-only audit event.
    * `POST /api/v1/review/sessions/{id}/remand`: Reviewer remands session with statutory reason for re-testing.
    * `POST /api/v1/review/sessions/{id}/approve`: Reviewer recommends session for Director approval.
    * `POST /api/v1/review/sessions/{id}/sign`: Director executes ECDSA P-256 signature and activates permanent read-only lock.
    * `GET /api/v1/review/sessions/{id}/comments` & `POST /api/v1/review/sessions/{id}/comments`: Row-level comment management.
- **Zero-Bug Rules:** Once a Director signs, the entire test session switches to read-only lock state; Metrologist cannot sign; Reviewer cannot sign; only Director can sign with valid authority PIN; locked sessions permanently reject amendments or re-signing attempts.
- **Verification Test Gate:**
  - Automated unit and integration tests in `backend/tests/test_review_pipeline.py`:
    * Queue retrieval with status filtering.
    * Metrologist submission to `PENDING_REVIEW` with audit transition logging.
    * Reviewer remand with required justification updating status to `REJECTED`/`REMANDED`.
    * Reviewer recommendation workflow.
    * Director signing: PIN validation (401 on wrong PIN), ECDSA P-256 signature generation, permanent lock activation, and rejection of re-signing attempts on locked sessions (400 Bad Request).
    * Row-level comment creation and retrieval.
  - Full backend test suite: **388 of 388 tests passing** (100% pass rate, 92% coverage).
  - Frontend TypeScript & production bundle build: `✓ built in 2.67s` with zero errors.
  - Automated Browser Subagent Verification (`review_pipeline_demo`):
    * Role switcher verified across Metrologist, Reviewing Officer, and Lab Director.
    * Verified Metrologist cannot sign.
    * Verified Reviewer opens row-level drawer, inspects calculation trace, and flags row.
    * Verified Director signs with PIN `1234`, session locks permanently, and Green Stamped Seal with eMaap QR code is rendered.

---

## PHASE 6: HARDWARE IOT, VISION & GRAND FINALE (Steps 26–30)

### Step 26: 1-Click Synthetic Metrological Edge-Case Generator `[COMPLETED]`
- **Goal:** Build the single most powerful live demo feature: 1-click loading of realistic laboratory stress scenarios.
- **Deliverables:** `backend/app/core/synthetic_generator.py` & frontend selector:
  - **Scenario 1:** Standard Class III Retail Scale (Passing baseline, 31 observations).
  - **Scenario 2:** Rounding Discrepancy Trap (Naive $I - L$ says PASS $0.0\text{g}$, but true unrounded $P = I + 0.5e - \Delta L$ catches failure at $2000e$ boundary with $E_c = -5.3\text{g} > \pm 5.0\text{g}$ MPE!).
  - **Scenario 3:** Temperature Span Drift Fail (Passes at $20^\circ\text{C}$, but fails at $40^\circ\text{C}$ chamber run).
  - **Scenario 4:** Eccentricity Cantilever Twist (Corner 5 exceeds MPE due to platform load cell mechanical torque, $E_c = -7.3\text{g}$).
  - **Scenario 5:** High-Interval Class I Analytical Balance ($n = 120,000$, $e = 0.001\text{g}$, $d = 0.0001\text{g}$).
- **Backend Endpoints:**
  - `GET /api/v1/sessions/scenarios` — Registry metadata and scenario list.
  - `GET /api/v1/sessions/scenarios/{id}` — Full scenario specification.
  - `POST /api/v1/sessions/load-scenario/{id}` — 1-click DB test session loader with automatic OIML evaluation.
- **Frontend Components:**
  - `frontend/src/types/scenarios.ts` & `frontend/src/data/syntheticScenarios.ts`: Zero-latency offline precompiled datasets.
  - `frontend/src/context/ScenarioContext.tsx`: `ScenarioProvider` and `useScenario()` hook.
  - `frontend/src/features/testing/DemoScenarioSelector.tsx`: Quick scenario ribbon and golden STATUTORY TRAP HIGHLIGHT callout banner with side-by-side Naive vs OIML calculation comparison.
  - `frontend/src/components/layout/Header.tsx`: Prominent "Load Demo Scenario (5 Cases)" dropdown with instant tab routing.
  - `frontend/src/features/testing/ObservationGrid.tsx`: Visual amber highlight ring, `TRAP` badge on Step 7, and dynamic row tally.
  - `frontend/src/features/testing/PlatterHeatmap.tsx`: Dynamic synchronization with Scenario 4 Corner Twist, lighting up Corner 5 in crimson.
- **Verification Test Gate Passed:**
  - Pytest suite: `backend/tests/test_synthetic_generator.py` (9 dedicated tests passing, all 397 backend tests passing, 0 failures, 91% coverage).
  - Production build: `npm run build` succeeded with 0 errors.
  - Browser Subagent Verification (`demo_scenarios_verify_1790400738179.webp`):
    * 1-click loaded Scenario 2: Step 7 amber ring, `TRAP` badge, $-5.3\text{g}$ error, and golden comparison banner displayed.
    * 1-click loaded Scenario 4: Corner 5 / Front-Right highlighted in crimson on 2D Platter Deflection Heatmap with $-7.3\text{g}$ error.

---

### Step 27: Metrologix LiveBridge IoT Gateway & Virtual Scale Simulator (with WELMEC 7.2 Counter) `[COMPLETED]`
- **Goal:** Direct browser-to-scale communication via WebSerial API plus a software simulator for demo day that supports live telemetry and WELMEC 7.2 audit counter interrogation.
- **Deliverables:** `frontend/src/features/iot/` & `backend/app/iot/`:
  - `backend/app/iot/protocols.py`: Industrial serial ASCII protocol parser (CAS CI-series `ST,GS,+0010.000kg`, Mettler-Toledo SICS `S S 10.000 kg`, Avery SMA, and WELMEC 7.2 inquiry `I4 / C`).
  - `backend/app/iot/simulator.py`: Virtual scale mechanical physics engine with harmonic damping, Gaussian jitter, and settling transitions.
  - `backend/app/api/iot.py`: REST API endpoints (`POST /api/v1/iot/parse-packet`, `POST /api/v1/iot/welmec/verify`, `POST /api/v1/iot/simulate-packet`, `GET /api/v1/iot/protocols`).
  - `frontend/src/features/iot/webserial_client.ts`: Connects to physical scale via browser `navigator.serial` with line-by-line decoding and automated protocol detection.
  - `frontend/src/features/iot/VirtualScaleSimulator.tsx`: Interactive software simulator with preset weights (0g, 100g, 500g, 2500g, 10000g, 15000g), fine-tuning auxiliary weight $\Delta L$ slider, and tare/re-zero controls.
  - `frontend/src/features/iot/WelmecAuditPanel.tsx`: Statutory WELMEC 7.2 software guide verification panel ($C = 0042$, $P = 0017$, firmware SHA-256 hash, and tamper simulation toggle triggering Section 24 violation alert).
  - `frontend/src/features/iot/LiveBridge.tsx`: Master IoT gateway with 7-segment green glowing digital LED readout, serial monitor console, and auto-capture triggers.
  - `frontend/src/context/IoTContext.tsx`: Shared telemetry context across entire frontend.
  - `frontend/src/components/layout/Header.tsx`: Real-time LiveBridge Scale Telemetry pill showing live weight and `STABLE` / `MOTION` annunciators.
  - `frontend/src/features/testing/ObservationGrid.tsx`: Integrated LiveBridge Telemetry bar with 1-click and Spacebar auto-capture into the active test row.
- **Verification Test Gate Passed:**
  - Backend Pytest suite: `tests/test_iot_protocols.py` (14 dedicated unit & API tests passing; 411 total tests passing, 0 failures, 91% code coverage).
  - Frontend production build: `npm run build` succeeded with 0 errors in 1.78s.
  - Automated Browser Subagent Verification (`livebridge_iot_verify_1790402048353.webp`):
    * Top navigation bar renders live scale pill with `2,500.0 g STABLE`.
    * Virtual Scale Simulator settles dynamic load cell readings and logs raw ASCII packets to the serial console.
    * WELMEC 7.2 audit panel confirms baseline $C = 0042$; toggling tampered $C = 0043$ triggers crimson statutory alert under Section 24 of the Legal Metrology Act.
    * Weighing Error grid captures live reading (`2500 g`) into Step 1 instantly via the "Capture to Active Row" button.

---

### Step 28: Deterministic OpenCV Platter Surface, Spirit Bubble & Lead Seal Auditor
- **Goal:** Provide automated computer vision verification of scale leveling, platter cleanliness, and statutory physical sealing.
- **Deliverables:** `backend/app/vision/photo_auditor.py`:
  - **Spirit Bubble Checker:** Uses OpenCV Hough Circles to detect outer target ring and inner air bubble. Calculates concentricity offset $\delta_{\text{tilt}}$. Alerts if tilt $> 0.5^\circ$.
  - **Platter Surface Integrity Check:** Uses deterministic optical baseline subtraction ($\Delta = |I_{\text{curr}} - I_{\text{base}}|$) over platter ROI against the calibrated empty tared pan. Flags extraneous mass or edge-binding obstructions.
  - **Lead Seal Wire Hole Verification:** Uses edge-gradient template matching to verify the presence of the physical sealing pass-through hole mandated for verification stamping under Section 24 of the Legal Metrology Act.
- **Zero-Bug Rules:** Zero probabilistic deep learning (no uncertified YOLO hallucination) — 100% deterministic, explainable metrological image processing.
- **Verification Test Gate:** Pytest with sample photos: Off-center bubble triggers leveling warning; coin on platter triggers clutter alert; missing seal hole triggers inspection warning.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/vision/photo_auditor.py` using OpenCV for deterministic optical verification. Implement `audit_spirit_bubble(image_bytes)` using Hough Circles to measure bubble concentricity and alert if displaced. Implement `audit_platter_surface(current_image, baseline_image)` using image subtraction and contour thresholding to detect foreign objects or edge obstructions on the platter before zero-load capture. Implement `verify_lead_seal_hole(casing_image)` using edge-gradient template matching to detect the physical wire sealing hole. Return structured JSON with bounding coordinates and pass/fail status."*

---

### Step 29: Legacy Excel Spreadsheet Ingestion & Migration Engine
- **Goal:** Enable DoCA and RRSL labs to import 10 years of legacy Excel test sheets in seconds.
- **Deliverables:** `backend/app/ingestion/excel_parser.py`:
  - Accepts `.xlsx` / `.xls` legacy lab test sheets.
  - Intelligently maps columns (Load, Indication, Auxiliary weights, Corner readings).
  - Recalculates all historical data through the deterministic OIML changeover engine.
  - Flags historical rounding errors where manual Excel formulas were mathematically flawed.
- **Zero-Bug Rules:** Robust parsing with openpyxl that gracefully handles merged cells, header variations, and missing values.
- **Verification Test Gate:** Pytest importing a sample legacy lab spreadsheet and verifying clean conversion into a `TestSession`.
- **Ready-to-Use Vibe Prompt:**
  > *"Build `backend/app/ingestion/excel_parser.py` using `openpyxl`. Parse legacy RRSL/GATC laboratory Excel spreadsheets, extract instrument metadata and observation tables, and map them into the structured `TestSession` schema. Automatically run the extracted data through our OIML R 76 calculation engine and highlight any discrepancy where the legacy Excel formula falsely evaluated compliance. Write pytest tests with sample spreadsheets."*

---

### Step 30: Standalone Desktop Packaging (Tauri / Local Bundle) & Grand Finale Demo Suite
- **Goal:** Package the entire system for air-gapped lab PCs and polish the 10-minute winning jury presentation.
- **Deliverables:**
  - Tauri desktop configuration (`src-tauri/`) building a single-click `.exe` installer with embedded SQLite database.
  - 1-click Docker Compose bundle for local lab deployment without internet.
  - Grand Finale Demo Mode: A guided walkthrough banner in the UI with script cues for each minute of the 10-minute presentation.
- **Zero-Bug Rules:** Offline mode must function with 100% feature parity with the web version (zero broken API calls when Wi-Fi is disconnected).
- **Verification Test Gate:** Disconnect all internet connections $\to$ launch desktop app $\to$ run complete test $\to$ export PDF/A $\to$ 100% operational.
- **Ready-to-Use Vibe Prompt:**
  > *"Configure standalone desktop deployment for METROLOGIX-76 using Tauri (or a standalone offline local bundle with embedded SQLite). Ensure the application operates 100% offline with local IndexedDB caching and local filesystem PDF/Word exports. Add a toggleable 'Jury Demo Assistant' toolbar that guides the presenter through the 10-minute pitch timeline with 1-click shortcuts for each demonstration milestone. Provide full build instructions."*

---

## 🚀 Execution Cadence Summary

| Step Range | Core Objective | Time to Build (with AI Vibe Coding) |
|---|---|---|
| **Steps 01 – 08** | Pure Metrological Core & RulePacks | 3 – 4 Days |
| **Steps 09 – 12** | Database, Audit Trail & RBAC | 2 – 3 Days |
| **Steps 13 – 16** | Extended OIML Tests & Traceability | 3 – 4 Days |
| **Steps 17 – 21** | Frontend Workspace & Visualizations | 4 – 5 Days |
| **Steps 22 – 25** | Official R 76-2 Dual Reporting & Crypto | 3 – 4 Days |
| **Steps 26 – 30** | Hardware IoT, Vision & Desktop Packaging | 4 – 5 Days |
| **TOTAL** | **Full National Laboratory Operating System** | **~20 – 25 Days (Comfortable in 1 Month)** |

*Every step is atomic, modular, and protected by automated test gates. Follow this order, and you will produce a flawless, award-winning submission.*
