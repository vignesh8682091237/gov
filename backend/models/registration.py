import uuid
from datetime import datetime, timezone

from extensions import db


class Registration(db.Model):
    """
    Stores registrations submitted by visitors/users.
    Contains name, age, dob, email, mobile, alternative mobile,
    and technical metadata for admin analytics.
    """

    __tablename__ = "registrations"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False, index=True)
    age = db.Column(db.Integer, nullable=True)
    dob = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(254), nullable=False, index=True)
    mobile = db.Column(db.String(30), nullable=False, index=True)
    alt_mobile = db.Column(db.String(30), nullable=True)
    ip_address = db.Column(db.String(64), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    device_type = db.Column(db.String(60), nullable=True)
    browser = db.Column(db.String(100), nullable=True)
    operating_system = db.Column(db.String(100), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "dob": self.dob,
            "email": self.email,
            "mobile": self.mobile,
            "alt_mobile": self.alt_mobile,
            "ip_address": self.ip_address,
            "device_type": self.device_type,
            "browser": self.browser,
            "operating_system": self.operating_system,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
