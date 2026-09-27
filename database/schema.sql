-- Consent-Based Link Analytics and Device Information Collection System
-- PostgreSQL schema. This mirrors the SQLAlchemy models in backend/models/.
-- In normal development, `flask --app app init-db` creates these tables for
-- you; this file is provided for manual setup / review / migrations tooling.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS admins (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(64) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tracking_links (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_code   VARCHAR(16) UNIQUE NOT NULL,
    campaign_name   VARCHAR(120) NOT NULL,
    destination_url VARCHAR(500) NOT NULL DEFAULT '/thank-you',
    status          VARCHAR(16) NOT NULL DEFAULT 'active',
    created_by      UUID NOT NULL REFERENCES admins(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_tracking_links_code ON tracking_links(tracking_code);

-- consent_status: 'accepted' | 'declined'
-- Every client-reported column below is populated ONLY when
-- consent_status = 'accepted'. See backend/models/visitor_session.py for
-- the full privacy rationale.
CREATE TABLE IF NOT EXISTS visitor_sessions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_link_id    UUID NOT NULL REFERENCES tracking_links(id) ON DELETE CASCADE,
    consent_status      VARCHAR(16) NOT NULL,
    ip_address          VARCHAR(64),
    request_method      VARCHAR(8),
    user_agent_raw      TEXT,
    browser             VARCHAR(64),
    operating_system    VARCHAR(64),
    device_type         VARCHAR(32),
    screen_resolution   VARCHAR(32),
    language            VARCHAR(32),
    timezone            VARCHAR(64),
    referrer            VARCHAR(500),
    visited_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_link ON visitor_sessions(tracking_link_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visited_at ON visitor_sessions(visited_at);

-- Optional, voluntarily-typed-in visitor-provided details.
-- Every column is nullable: every field is optional. Never populated
-- automatically from the device.
CREATE TABLE IF NOT EXISTS visitor_details (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_session_id   UUID UNIQUE NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    name                 VARCHAR(120),
    email                VARCHAR(254),
    mobile               VARCHAR(20),
    purpose              VARCHAR(500),
    submitted_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id    UUID REFERENCES admins(id),
    action      VARCHAR(64) NOT NULL,
    details     TEXT,
    ip_address  VARCHAR(64),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
