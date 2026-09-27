import uuid
from datetime import datetime, timezone

from extensions import db


class AuditLog(db.Model):
    """Append-only record of security-relevant admin actions."""

    __tablename__ = "audit_logs"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_id = db.Column(db.String(36), db.ForeignKey("admins.id"), nullable=True)
    action = db.Column(db.String(64), nullable=False)  # e.g. 'login', 'link_created'
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(64), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "action": self.action,
            "details": self.details,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def record_audit(admin_id, action, details=None, ip_address=None):
    entry = AuditLog(
        admin_id=admin_id, action=action, details=details, ip_address=ip_address
    )
    db.session.add(entry)
    return entry
