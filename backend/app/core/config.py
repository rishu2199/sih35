"""Application configuration loaded from environment variables."""

import json
from typing import Any
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central settings object — all values sourced from .env / environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"  # noqa: S104
    APP_PORT: int = 8000
    APP_TITLE: str = "METROLOGIX-76"
    APP_VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./metrologix.db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_database_url(cls, v: Any) -> str:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return str(v)

    # Security
    SECRET_KEY: str = "dev-secret-key-replace-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # ECDSA Signing
    LAB_PRIVATE_KEY_PATH: str = "./keys/lab_private.pem"
    LAB_PUBLIC_KEY_PATH: str = "./keys/lab_public.pem"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000", "*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            stripped = v.strip()
            if stripped.startswith("[") and stripped.endswith("]"):
                try:
                    return json.loads(stripped)
                except Exception:
                    pass
            return [i.strip() for i in stripped.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # eMaap
    EMAAP_VERIFY_BASE_URL: str = "https://emaap.doca.gov.in/verify"

    # Logging
    LOG_LEVEL: str = "INFO"


# Module-level singleton — import this everywhere instead of instantiating Settings() directly
settings = Settings()
