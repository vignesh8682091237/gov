import uuid
from datetime import datetime, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from extensions import db

# Argon2id is used instead of bcrypt: it is the current OWASP-recommended
# default for new applications. Cost parameters use the library defaults,
# which are tuned for interactive login (~ tens of ms per hash).
_ph = PasswordHasher()


class Admin(db.Model):
    __tablename__ = "admins"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    last_login_at = db.Column(db.DateTime(timezone=True), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def set_password(self, raw_password: str) -> None:
        self.password_hash = _ph.hash(raw_password)

    def verify_password(self, raw_password: str) -> bool:
        try:
            valid = _ph.verify(self.password_hash, raw_password)
        except VerifyMismatchError:
            return False
        except Exception:
            return False
        if valid and _ph.check_needs_rehash(self.password_hash):
            # Transparently upgrade the hash if Argon2 parameters changed.
            self.set_password(raw_password)
        return valid

    def to_public_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login_at": self.last_login_at.isoformat()
            if self.last_login_at
            else None,
        }
