# ⚖️ METROLOGIX-76

**Statutory OIML R 76 Test Report Generation System for Non-Automatic Weighing Instruments (NAWI)**

![SIH 2026](https://img.shields.io/badge/SIH_2026-Problem_26035-orange?style=for-the-badge)
![Ministry](https://img.shields.io/badge/Ministry-DoCA_India-green?style=for-the-badge)
![Standard](https://img.shields.io/badge/Standard-OIML_R_76--1:2006-blue?style=for-the-badge)
![Act](https://img.shields.io/badge/Act-Legal_Metrology_Act_2009-red?style=for-the-badge)

![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)
![Offline Ready](https://img.shields.io/badge/Offline_Ready-Air--Gapped_Deployment-blueviolet?style=flat-square)

---

## 📋 Table of Contents

- [🎯 Problem Statement](#-problem-statement)
- [🚀 What is METROLOGIX-76?](#-what-is-metrologix-76)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture Overview](#-architecture-overview)
- [🧮 Metrological Calculation Engines](#-metrological-calculation-engines)
- [📁 Project Structure](#-project-structure)
- [⚙️ Tech Stack](#-tech-stack)
- [🛠️ Local Development Setup](#-local-development-setup)
- [🐳 Docker / Offline Deployment](#-docker--offline-deployment)
- [☁️ Cloud Deployment](#-cloud-deployment)
- [🔌 API Reference](#-api-reference)
- [🔐 Security & Cryptographic Sealing](#-security--cryptographic-sealing)
- [🧪 Testing](#-testing)
- [👥 RBAC — Role-Based Access Control](#-rbac--role-based-access-control)
- [🤝 Contributing](#-contributing)

---

## 🎯 Problem Statement

**SIH 2026 | Problem Statement ID: 26035**  
**Organization: Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution**

> *"Development of a Software Program/Application for Generation of Test Reports for Non-Automatic Weighing Instruments (NAWI) as per OIML Recommendation R-76"*

Non-Automatic Weighing Instruments (NAWIs) — electronic weighing scales, platform scales, weighbridges — are legally mandated under the **Legal Metrology Act, 2009** and **Legal Metrology (General) Rules, 2011** to undergo rigorous metrological testing before model approval and market deployment.

Today, designated laboratories (RRSLs — Regional Reference Standards Laboratories) prepare these test reports **manually in spreadsheets**, leading to:

- ❌ Calculation errors in statutory compliance math (MPE, Repeatability Spread Δ, etc.)
- ❌ No uniformity across labs and testing sessions
- ❌ Hours of manual documentation per instrument
- ❌ No tamper-proof audit trail for legal enforceability

**METROLOGIX-76 solves this completely.**

---

## 🚀 What is METROLOGIX-76?

METROLOGIX-76 is a **full-stack, offline-capable statutory compliance platform** that automates the entire OIML R 76-1 metrological verification workflow for NAWIs — from instrument intake to legally sealed PDF test reports.

```
Instrument Intake → Pre-Condition Gates → 7-Stage Testing Protocol → Compliance Evaluation → Cryptographically Sealed Report
```

The system is built to operate in **air-gapped RRSL lab environments** (zero-internet) while also supporting cloud deployment for centralized DoCA oversight.

---

## ✨ Key Features

### ⚖️ Statutory Compliance Engine
- **15 precision metrological calculation engines** implementing every clause of OIML R 76-1:2006
- Real-time Maximum Permissible Error (MPE) resolution across all accuracy classes (Class I, II, III, IIII)
- Correct **Repeatability Spread evaluation**: `Δ = E_max − E_min ≤ |MPE|` (not row-by-row, as mandated by R 76-1 Clause A.4.10)
- Multi-interval scale support (MD instruments with variable MPE zones)
- Eccentricity (corner-load) test engine with SVG platter heatmap visualization

### 🔒 ISO/IEC 17025 Traceability Gate
- Unconditional **pre-condition gate** — observations cannot be recorded until reference standard weights (F1/F2 class) are certified
- Calibration certificate expiry validation with NABL/BIS traceability chain enforcement
- Prevents the legally catastrophic error of testing before standards traceability is established

### 📊 Persistent Verification Session Header
- Live scale telemetry: serial number, accuracy class, Max/Min/e values
- Real-time stable weight indicator, zero flag, hardware connection status
- **7-Step OIML R 76 Testing Protocol Stepper** (routed navigation):
  1. Visual & Markings (Clause 3.1)
  2. Tare & Zero (Clause 4.5)
  3. Eccentricity / Corner Load (Clause 3.6.2)
  4. Weighing & Linearity — Ascending + Descending (Clause 3.5.1)
  5. Repeatability — Spread `Δ ≤ |MPE|` (Clause 3.6.1)
  6. Environmental / Creep / Thermal Stability (Clause 3.9)
  7. Legal Metrology Review & Cryptographic Report Sealing (ISO 17025)

### 📄 Automated Report Generation
- **Statutory PDF test reports** (ReportLab + Jinja2 templating)
- DOCX export compatible with DoCA reporting formats
- QR code embedding for instant field verification via eMaap portal
- Multi-page structured output matching RRSL report formats

### 🔐 Cryptographic Report Sealing
- **ECDSA (NIST P-256) digital signatures** for tamper-evident reports
- HMAC-SHA256 payload canonicalization
- Lab Director digital certificate embedded in every final report
- Public key QR verification printable on the physical instrument seal

### 📸 Vision / AI Assistance
- Nameplate OCR (OpenCV + Tesseract) — automatically reads instrument marking data
- AI-assisted visual inspection pre-check
- Reduces human transcription error during intake

### 🌐 IoT Real-Time Integration
- WebSocket-based live weighbridge data stream (`/api/v1/iot/stream`)
- Simulated & live scale adapters for USB/RS-232 connected instruments
- Automatic stable reading detection with configurable settling time

### 🌐 Air-Gapped / Offline Mode
- SQLite embedded database (no PostgreSQL required for labs)
- Docker Compose 1-click offline bundle for RRSL workstations
- All static assets pre-bundled — zero CDN dependency at runtime

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        METROLOGIX-76 Platform                        │
├──────────────────────────┬──────────────────────────────────────────┤
│       Frontend           │               Backend                     │
│  React 19 + TypeScript   │        FastAPI + Python 3.13             │
│  Tailwind CSS + Vite     │        SQLAlchemy + Alembic              │
│                          │                                           │
│  ┌─────────────────┐     │   ┌──────────────────────────────────┐   │
│  │ Verification     │     │   │  15 Metrological Engines         │   │
│  │ Session Header  │────>│   │  (MPE, Repeatability, Eccentric- │   │
│  │ (7-Step OIML    │     │   │   ity, Tare, TAM, Changeover...) │   │
│  │  R76 Stepper)   │     │   └──────────────────────────────────┘   │
│  └─────────────────┘     │                                           │
│                          │   ┌────────────────────────────────────┐  │
│  ┌─────────────────┐     │   │  ECDSA Crypto Signer               │  │
│  │ Observation     │     │   │  (NIST P-256, HMAC-SHA256)        │  │
│  │ Grid + Error    │────>│   └────────────────────────────────────┘  │
│  │ Corridor Chart  │     │                                           │
│  └─────────────────┘     │   ┌────────────────────────────────────┐  │
│                          │   │  Report Compiler                   │  │
│  ┌─────────────────┐     │   │  (PDF + DOCX + QR Code)           │  │
│  │ Platter Heatmap │────>│   └────────────────────────────────────┘  │
│  │ (Eccentricity)  │     │                                           │
│  └─────────────────┘     │   ┌────────────────────────────────────┐  │
│                          │   │  Vision Engine                     │  │
│  ┌─────────────────┐     │   │  (OpenCV + Tesseract OCR)          │  │
│  │ IoT Live Stream │────>│   └────────────────────────────────────┘  │
│  │ (WebSocket)     │     │                                           │
│  └─────────────────┘     │   ┌────────────────────────────────────┐  │
│                          │   │  Immutable Audit Logger             │  │
│                          │   │  (ISO 17025 Compliant)             │  │
│                          │   └────────────────────────────────────┘  │
└──────────────────────────┴──────────────────────────────────────────┘
                    ▼                           ▼
            SQLite / PostgreSQL        DoCA eMaap Portal
            (Air-Gapped Mode)         (QR Verification)
```

---

## 🧮 Metrological Calculation Engines

All engines in `backend/app/core/` implement statutory formulas directly from **OIML R 76-1:2006**:

| Engine | File | OIML R 76 Clause | Function |
|--------|------|------------------|----------|
| **MPE Resolver** | `mpe_resolver.py` | Table 1, Table 2 | Computes Max Permissible Error for any load `m` across all accuracy classes |
| **Repeatability Engine** | `repeatability_engine.py` | Clause A.4.10 | Evaluates spread `Δ = E_max − E_min ≤ |MPE|` (not row-by-row) |
| **Eccentricity Engine** | `eccentricity_engine.py` | Clause 3.6.2 | Corner-load test with SVG heatmap, 4/5-point evaluation |
| **TAM Engine** | `tam_engine.py` | Clause 3.7 | Tare + Additional mass weighing evaluation |
| **Tare & Temperature Engine** | `tare_temp_engine.py` | Clause 3.8, 4.8 | Tare range, thermal drift, creep evaluation |
| **Scale Interval Validator** | `scale_interval_validator.py` | Clause 3.2 | Validates `d`, `e`, `n = Max/d` against class limits |
| **Multi-Interval Engine** | `multi_interval_engine.py` | Clause 3.3 | MD instrument multi-range MPE zoning |
| **Changeover Engine** | `changeover_engine.py` | Clause 4.9 | Automatic changeover point test for multi-range instruments |
| **Discrimination Engine** | `discrimination_engine.py` | Clause 4.10 | Sensitivity / discrimination threshold evaluation |
| **Traceability Validator** | `traceability_validator.py` | ISO 17025 §5.6 | Reference weight calibration chain & certificate expiry gate |
| **Crypto Signer** | `crypto_signer.py` | ISO 17025 §4.14 | ECDSA digital signature + QR code generation |
| **Audit Logger** | `audit_logger.py` | ISO 17025 §4.13 | Immutable append-only action log |
| **Synthetic Generator** | `synthetic_generator.py` | All | Generates 5 canonical test scenarios for demo/training |
| **Rule Pack** | `rulepack/` | All Clauses | Declarative rule definitions for all test evaluations |

---

## 📁 Project Structure

```
SIH35/
├── README.md                           # This file
├── UI_MENTAL_MODEL.md                  # Full UI architecture specification
├── vercel.json                         # Vercel frontend deployment config
├── render.yaml                         # Render backend deployment config
├── docker-compose.offline.yml          # 1-click air-gapped lab bundle
├── Dockerfile.backend                  # Multi-stage Python backend image
├── Dockerfile.frontend                 # Nginx + Vite build frontend image
├── dev.ps1                             # Windows dev helper script
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                     # Root app + view routing
│   │   ├── index.css                   # Design system tokens
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── VerificationSessionHeader.tsx  # Persistent 7-step header
│   │   │   └── ui/                     # Shared UI components
│   │   ├── features/
│   │   │   ├── auth/                   # Login / RBAC
│   │   │   ├── dashboard/              # Lab overview dashboard
│   │   │   ├── intake/                 # Instrument intake & registration
│   │   │   ├── testing/
│   │   │   │   ├── ObservationGrid.tsx         # Live data entry table
│   │   │   │   ├── ErrorCorridorChart.tsx       # MPE compliance chart
│   │   │   │   ├── PlatterHeatmap.tsx           # Eccentricity heatmap
│   │   │   │   ├── RepeatabilityView.tsx        # Delta spread visualization
│   │   │   │   ├── TareTempView.tsx             # Tare/thermal view
│   │   │   │   ├── ActiveTestsWorkspace.tsx     # Multi-test workspace
│   │   │   │   └── DemoScenarioSelector.tsx     # Demo data loader
│   │   │   ├── reports/                # Report generation & preview
│   │   │   ├── review/                 # Legal metrology review + seal
│   │   │   ├── iot/                    # Live scale stream viewer
│   │   │   ├── ingestion/              # Bulk Excel data import
│   │   │   └── vision/                 # Nameplate OCR scanner
│   │   ├── context/                    # React context providers
│   │   ├── types/                      # TypeScript type definitions
│   │   └── data/                       # Static reference data
│   ├── vite.config.ts                  # Vite + API proxy config
│   └── package.json
│
└── backend/
    ├── app/
    │   ├── main.py                     # FastAPI app entry point
    │   ├── api/                        # REST API route handlers
    │   │   ├── auth.py                 # JWT authentication
    │   │   ├── intake.py               # Instrument intake endpoints
    │   │   ├── iot.py                  # IoT / WebSocket streaming
    │   │   ├── reports.py              # Report generation endpoints
    │   │   ├── review.py               # Legal review + signing
    │   │   ├── verification.py         # Test data submission
    │   │   ├── scenarios.py            # Demo scenario API
    │   │   ├── ingestion.py            # Excel bulk ingestion
    │   │   └── vision.py               # OCR vision endpoints
    │   ├── core/                       # 15 Metrological Engines
    │   ├── db/                         # SQLAlchemy models + migrations
    │   ├── reporting/                  # PDF/DOCX report compiler
    │   ├── iot/                        # IoT scale protocol adapters
    │   ├── ingestion/                  # Excel data parsers
    │   └── vision/                     # OpenCV + Tesseract pipeline
    ├── alembic/                        # Database migrations
    ├── keys/                           # ECDSA PEM key files (gitignored)
    ├── requirements.txt
    ├── .env.example                    # Environment variables template
    └── pyproject.toml
```

---

## ⚙️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.13+ | Core language |
| **FastAPI** | 0.115 | ASGI web framework + OpenAPI docs |
| **Uvicorn** | 0.30 | ASGI server |
| **SQLAlchemy** | 2.0 (async) | ORM + database abstraction |
| **Alembic** | 1.13 | Database migrations |
| **Pydantic v2** | 2.9 | Data validation & settings |
| **aiosqlite** | 0.20 | Async SQLite driver (offline mode) |
| **asyncpg** | 0.30 | Async PostgreSQL driver (production) |
| **ReportLab** | 4.2 | PDF generation |
| **python-docx** | 1.1 | DOCX report generation |
| **Jinja2** | 3.1 | Report templating |
| **OpenCV** | 4.10 headless | Computer vision / image processing |
| **Tesseract** | 0.3.10 | OCR — nameplate text extraction |
| **cryptography** | 43.0 | ECDSA digital signing |
| **python-jose** | 3.3 | JWT authentication |
| **qrcode** | 7.4 | QR code generation for eMaap links |
| **Ruff** | 0.7 | Linting & formatting |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19 | UI framework |
| **TypeScript** | 6.0 | Type safety |
| **Vite** | 8.3 | Build tool + dev server |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **Lucide React** | 1.48 | Icon library |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Docker + Docker Compose** | Air-gapped offline lab deployment |
| **Nginx** | Frontend static file serving (offline mode) |
| **Vercel** | Frontend cloud deployment |
| **Render** | Backend cloud deployment |
| **SQLite** | Embedded database (offline labs) |
| **PostgreSQL** | Production cloud database |

---

## 🛠️ Local Development Setup

### Prerequisites

- **Python 3.13+** — [Download](https://www.python.org/downloads/)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/rishu2199/sih35.git
cd sih35
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your SECRET_KEY:
# python -c "import secrets; print(secrets.token_hex(32))"

# Start the backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend running at: **http://127.0.0.1:8000**  
Interactive API Docs: **http://127.0.0.1:8000/api/docs**

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend running at: **http://localhost:5173**

> **Note:** The Vite dev server automatically proxies all `/api/*` requests to the backend at `http://localhost:8000`.

### 4. Default Login Credentials

After first launch, the database is seeded with demo accounts:

| Role | Username | Password |
|------|----------|----------|
| Lab Director | `director` | `director123` |
| Metrologist | `metrologist` | `metro123` |
| Inspector | `inspector` | `inspect123` |

### 5. Load Demo Scenarios

Navigate to the **Dashboard → Demo Scenarios** to load 5 pre-built test scenarios:

1. ✅ Class III Platform Scale — All tests PASS
2. ❌ Class II Precision Balance — Repeatability FAIL
3. ❌ Class III Weighbridge — Eccentricity corner error FAIL
4. ✅ Class IIII Retail Scale — Borderline PASS
5. ⚠️ Multi-Interval Class II Balance — TAM partial FAIL

---

## 🐳 Docker / Offline Deployment

For **air-gapped RRSL lab environments** with zero internet access:

### Prerequisites
- Docker Desktop installed on the lab workstation

### 1-Click Deployment

```bash
# Build and start all services
docker compose -f docker-compose.offline.yml up --build -d

# Check service health
docker compose -f docker-compose.offline.yml ps

# View logs
docker compose -f docker-compose.offline.yml logs -f
```

Or use the Windows batch launcher:

```batch
launch_offline.bat
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/api/docs |

### Stop Services

```bash
docker compose -f docker-compose.offline.yml down
```

> **Data Persistence:** The SQLite database and exported reports are stored in named Docker volumes (`lab_db_data`, `lab_reports_data`) and survive container restarts.

---

## ☁️ Cloud Deployment

### Frontend → Vercel

```bash
# Push to main branch — Vercel auto-deploys
git push origin main
```

The `vercel.json` is pre-configured to:
- Build the frontend with `npm --prefix frontend run build`
- Proxy `/api/*` to the Render backend
- Handle React SPA client-side routing

### Backend → Render

`render.yaml` is pre-configured for automatic deployment. Set these environment variables in the Render dashboard:

```
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
DATABASE_URL=<your PostgreSQL connection string>
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

---

## 🔌 API Reference

Interactive Swagger UI: **http://127.0.0.1:8000/api/docs**

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/login` | JWT authentication |
| `POST` | `/api/v1/intake/instruments` | Register a new NAWI for testing |
| `GET` | `/api/v1/intake/instruments/{id}` | Get instrument test record |
| `POST` | `/api/v1/verification/submit` | Submit test observations |
| `GET` | `/api/v1/verification/{id}/evaluate` | Run compliance evaluation |
| `POST` | `/api/v1/reports/generate` | Generate PDF/DOCX report |
| `GET` | `/api/v1/reports/{id}/download` | Download generated report |
| `POST` | `/api/v1/review/sign` | Lab Director digital sign & seal |
| `GET` | `/api/v1/review/verify/{qr_token}` | Verify report signature |
| `WS` | `/api/v1/iot/stream` | Live scale WebSocket stream |
| `POST` | `/api/v1/vision/ocr` | Nameplate OCR extraction |
| `GET` | `/api/v1/scenarios` | Get demo test scenarios |

---

## 🔐 Security & Cryptographic Sealing

### Report Integrity Chain

```
Test Data → SHA-256 Digest → ECDSA Signature (Lab Director Private Key)
                                      |
                            Embedded in PDF Report
                                      |
                            QR Code → eMaap Verification URL
                                      |
                     Field Inspector scans → Public Key Verification
```

### Key Generation

```bash
cd backend

python -c "
from app.core.crypto_signer import generate_keypair, export_private_key_pem, export_public_key_pem
priv, pub = generate_keypair()
open('keys/lab_private.pem', 'wb').write(export_private_key_pem(priv))
open('keys/lab_public.pem', 'wb').write(export_public_key_pem(pub))
print('Keys generated successfully.')
"
```

> ⚠️ **`keys/`** is listed in `.gitignore`. **Never commit private keys to version control.**

---

## 🧪 Testing

```bash
cd backend

# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Run specific test suite
pytest tests/test_mpe_resolver.py -v
pytest tests/test_repeatability_engine.py -v
```

**Frontend type checking:**
```bash
cd frontend
npx tsc --noEmit      # TypeScript validation only
npm run build          # Full Vite build validation
```

---

## 👥 RBAC — Role-Based Access Control

| Permission | Inspector | Metrologist | Lab Director |
|-----------|-----------|-------------|--------------|
| View instrument records | ✅ | ✅ | ✅ |
| Create instrument intake | ❌ | ✅ | ✅ |
| Record test observations | ❌ | ✅ | ✅ |
| Evaluate compliance | ❌ | ✅ | ✅ |
| Generate draft report | ❌ | ✅ | ✅ |
| **Legally sign & seal report** | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ✅ | ✅ |

---

## 🤝 Contributing

This project is a **Smart India Hackathon 2026** submission.

### Development Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes, then stage and commit
git add .
git commit -m "feat(scope): description of change"

# Push to GitHub
git push origin feature/your-feature-name
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope):     add new feature
fix(scope):      fix a bug
docs(scope):     update documentation
refactor(scope): restructure code without behavior change
test(scope):     add or update tests
chore(scope):    build tools, dependencies
```

### Code Quality

```bash
# Backend — lint & format
cd backend && ruff check . && ruff format .

# Backend — type check
mypy app/

# Frontend — type check
cd frontend && npx tsc --noEmit
```

---

## 📜 Statutory Standards & References

| Standard | Full Title |
|---------|------------|
| **OIML R 76-1:2006** | Non-Automatic Weighing Instruments — Part 1: Metrological and Technical Requirements |
| **OIML R 76-2:2006** | Non-Automatic Weighing Instruments — Part 2: Test Report Format |
| **Legal Metrology Act, 2009** | Government of India statutory framework for weighing instruments |
| **Legal Metrology (General) Rules, 2011** | Rules for model approval, verification, and stamping |
| **ISO/IEC 17025:2017** | General requirements for the competence of testing and calibration laboratories |
| **OIML R 111** | Weights of classes E1 to M3 — Reference standard weights specification |

---

## 🏆 Team & SIH Details

- **Hackathon:** Smart India Hackathon 2026
- **Problem Statement ID:** 26035
- **Organization:** Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution, Government of India
- **Category:** Software

---

*Built for India's Legal Metrology Infrastructure — making OIML R 76 compliance accurate, uniform, and tamper-proof across every RRSL lab in India.*
