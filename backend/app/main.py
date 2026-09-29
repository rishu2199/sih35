"""METROLOGIX-76 FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.ingestion import router as ingestion_router
from app.api.intake import router as intake_router
from app.api.iot import router as iot_router
from app.api.reports import router as reports_router
from app.api.review import router as review_router
from app.api.scenarios import router as scenarios_router
from app.api.verification import router as verification_router
from app.api.vision import router as vision_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION,
    description=(
        "METROLOGIX-76: OIML R 76 Test Report Generation System "
        "for Non-Automatic Weighing Instruments (NAWI) — Ministry of Consumer Affairs"
    ),
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Handlers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication & RBAC"])
app.include_router(intake_router, prefix="/api/v1/intake", tags=["Instrument Intake & OCR"])
app.include_router(ingestion_router, prefix="/api/v1/ingestion", tags=["Legacy Excel Ingestion & Migration"])
app.include_router(ingestion_router, prefix="/api/ingestion", tags=["Legacy Excel Ingestion & Migration (Direct)"])
app.include_router(iot_router, prefix="/api/v1/iot", tags=["IoT & Scale Telemetry LiveBridge"])
app.include_router(reports_router, prefix="/api/v1/reports", tags=["Standardized OIML R 76-2 Reports & Repository"])
app.include_router(reports_router, prefix="/api/reports", tags=["Standardized OIML R 76-2 Reports (Direct)"])
app.include_router(review_router, prefix="/api/v1/review", tags=["Multi-Tier Review Pipeline"])
app.include_router(verification_router, prefix="/api/v1/verify", tags=["Cryptographic Verification & eMaap"])
app.include_router(vision_router, prefix="/api/vision", tags=["Computer Vision & Physical Auditor"])
app.include_router(vision_router, prefix="/api/v1/vision", tags=["Computer Vision & Physical Auditor (v1)"])
app.include_router(scenarios_router, prefix="/api/v1/sessions", tags=["Synthetic Edge-Case Generator"])
app.include_router(scenarios_router, prefix="/api/v1/scenarios", tags=["Synthetic Edge-Case Generator (Direct)"])


@app.get("/api/health", tags=["System"])
@app.get("/health", tags=["System"])
async def health_check() -> dict[str, str]:
    """Liveness probe — returns OK when the service is running."""
    return {"status": "healthy", "version": settings.APP_VERSION}
