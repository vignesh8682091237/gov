import secrets
import uuid
from datetime import datetime, timezone

from extensions import db


def generate_tracking_code(length: int = 8) -> str:
    """Cryptographically random, URL-safe tracking code, e.g. 'ABCD1234'."""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no ambiguous chars (0/O, 1/I)
    return "".join(secrets.choice(alphabet) for _ in range(length))


class TrackingLink(db.Model):
    __tablename__ = "tracking_links"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_code = db.Column(
        db.String(16), unique=True, nullable=False, index=True,
        default=generate_tracking_code,
    )
    campaign_name = db.Column(db.String(120), nullable=False)
    destination_url = db.Column(db.String(500), nullable=False, default="/thank-you")
    status = db.Column(db.String(16), nullable=False, default="active")  # active/inactive
    created_by = db.Column(db.String(36), db.ForeignKey("admins.id"), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    expires_at = db.Column(db.DateTime(timezone=True), nullable=True)

    sessions = db.relationship(
        "VisitorSession", backref="tracking_link", lazy="dynamic",
        cascade="all, delete-orphan",
    )

    def is_usable(self) -> bool:
        if self.status != "active":
            return False
        if self.expires_at and self.expires_at < datetime.now(timezone.utc):
            return False
        return True

    def to_dict(self, include_stats: bool = False):
        data = {
            "id": self.id,
            "tracking_code": self.tracking_code,
            "campaign_name": self.campaign_name,
            "destination_url": self.destination_url,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }
        if include_stats:
            total = self.sessions.count()
            accepted = self.sessions.filter_by(consent_status="accepted").count()
            declined = self.sessions.filter_by(consent_status="declined").count()
            data["stats"] = {
                "total_visits": total,
                "consent_accepted": accepted,
                "consent_declined": declined,
            }
        return data
