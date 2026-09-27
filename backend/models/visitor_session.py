import uuid
from datetime import datetime, timezone

from extensions import db


class VisitorSession(db.Model):
    """
    Records one visit to a tracking link.

    PRIVACY NOTE: every column here is limited to information that is either
    (a) inherent to an HTTP request (IP, User-Agent, method, timestamp) or
    (b) explicitly and voluntarily disclosed by the browser's public JS APIs
    (navigator.language, screen.width/height, Intl timezone, document.referrer)
    AFTER the visitor has clicked "Allow & Continue" on the consent page.
    Nothing here is collected before consent, and nothing here comes from a
    covert channel (no cookies read from other sites, no contacts, no GPS,
    no camera/mic, no credentials).
    """

    __tablename__ = "visitor_sessions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_link_id = db.Column(
        db.String(36), db.ForeignKey("tracking_links.id"), nullable=False, index=True
    )

    consent_status = db.Column(db.String(16), nullable=False)  # accepted/declined

    # --- Server-observed (available for every HTTP request regardless of
    # consent choice; recording the bare fact "a request happened" for a
    # decline is the "minimum necessary event information" the spec calls
    # for; only IP + timestamp + method are kept for a decline).
    ip_address = db.Column(db.String(64), nullable=True)
    request_method = db.Column(db.String(8), nullable=True)
    user_agent_raw = db.Column(db.Text, nullable=True)

    # --- Client-reported, ONLY populated when consent_status == 'accepted'
    browser = db.Column(db.String(64), nullable=True)
    operating_system = db.Column(db.String(64), nullable=True)
    device_type = db.Column(db.String(32), nullable=True)  # desktop/mobile/tablet
    screen_resolution = db.Column(db.String(32), nullable=True)
    language = db.Column(db.String(32), nullable=True)
    timezone = db.Column(db.String(64), nullable=True)
    referrer = db.Column(db.String(500), nullable=True)

    visited_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    details = db.relationship(
        "VisitorDetails", backref="session", uselist=False,
        cascade="all, delete-orphan",
    )

    @staticmethod
    def mask_ip(ip: str) -> str:
        """Zero out the last octet (IPv4) or last group (IPv6) for display."""
        if not ip:
            return ip
        if ":" in ip:  # IPv6
            parts = ip.split(":")
            parts[-1] = "0"
            return ":".join(parts)
        parts = ip.split(".")
        if len(parts) == 4:
            parts[-1] = "0"
            return ".".join(parts)
        return ip

    def to_dict(self, mask_ip: bool = True):
        return {
            "id": self.id,
            "tracking_link_id": self.tracking_link_id,
            "consent_status": self.consent_status,
            "ip_address": self.mask_ip(self.ip_address) if mask_ip else self.ip_address,
            "browser": self.browser,
            "operating_system": self.operating_system,
            "device_type": self.device_type,
            "screen_resolution": self.screen_resolution,
            "language": self.language,
            "timezone": self.timezone,
            "referrer": self.referrer,
            "visited_at": self.visited_at.isoformat() if self.visited_at else None,
        }
