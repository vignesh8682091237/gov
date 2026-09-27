"""
Application configuration.

SECURITY NOTE:
All secrets (DB credentials, JWT signing key, etc.) are read from environment
variables. Nothing sensitive is hardcoded here or anywhere else in the code
base. Copy .env.example to .env and fill in real values for local/dev use;
in production, inject these as real environment variables / secrets, never
commit a .env file.
"""

import os
from datetime import timedelta


def _bool_env(name: str, default: bool = False) -> bool:
    val = os.environ.get(name)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "on")


class BaseConfig:
    # --- Core / secrets -----------------------------------------------
    SECRET_KEY = os.environ.get("SECRET_KEY", "")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.environ.get("JWT_ACCESS_MINUTES", "60"))
    )

    # --- Database -------------------------------------------------------
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:postgres@localhost:5432/consent_analytics",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- CORS -------------------------------------------------------
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

    # --- Security / privacy knobs ----------------------------------------
    # Mask the last octet/group of IP addresses in normal dashboard views.
    MASK_IPS_IN_DASHBOARD = _bool_env("MASK_IPS_IN_DASHBOARD", True)

    # Days after which visitor_sessions / visitor_details are purged by the
    # retention job. Configurable per deployment; set 0 to disable auto-purge.
    DATA_RETENTION_DAYS = int(os.environ.get("DATA_RETENTION_DAYS", "180"))

    # Rate limiting defaults (Flask-Limiter storage backend)
    RATELIMIT_STORAGE_URI = os.environ.get("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_DEFAULT = os.environ.get("RATELIMIT_DEFAULT", "200 per hour")

    FORCE_HTTPS = _bool_env("FORCE_HTTPS", False)

    def __init__(self):
        # Fail loudly rather than silently running with an insecure default
        # secret in anything other than local dev.
        if not self.SECRET_KEY or not self.JWT_SECRET_KEY:
            raise RuntimeError(
                "SECRET_KEY and JWT_SECRET_KEY must be set via environment "
                "variables (see .env.example). Refusing to start with an "
                "empty/default secret."
            )


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    FORCE_HTTPS = False


class ProductionConfig(BaseConfig):
    DEBUG = False
    FORCE_HTTPS = True


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL", "sqlite:///:memory:"
    )
    RATELIMIT_ENABLED = False

    def __init__(self):
        # Tests supply their own throwaway secrets so devs don't need a
        # real .env just to run pytest.
        os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-prod")
        os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-not-for-prod")
        self.SECRET_KEY = os.environ["SECRET_KEY"]
        self.JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]


CONFIG_MAP = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}


def get_config():
    env = os.environ.get("FLASK_ENV", "development")
    return CONFIG_MAP.get(env, DevelopmentConfig)()
