import uuid
from datetime import datetime, timezone

from extensions import db


class VisitorDetails(db.Model):
    """
    Optional, voluntarily-typed-in details. Never auto-populated from the
    device. Every field is nullable because every field is optional.
    Access to this table must be restricted to authenticated admins
    (enforced at the route layer, not just the DB layer).
    """

    __tablename__ = "visitor_details"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    visitor_session_id = db.Column(
        db.String(36), db.ForeignKey("visitor_sessions.id"),
        unique=True, nullable=False,
    )
    name = db.Column(db.String(120), nullable=True)
    email = db.Column(db.String(254), nullable=True)
    mobile = db.Column(db.String(20), nullable=True)
    purpose = db.Column(db.String(500), nullable=True)
    submitted_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "visitor_session_id": self.visitor_session_id,
            "name": self.name,
            "email": self.email,
            "mobile": self.mobile,
            "purpose": self.purpose,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
        }
