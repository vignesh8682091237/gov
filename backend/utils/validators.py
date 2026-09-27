import re

import bleach
from email_validator import validate_email, EmailNotValidError

INDIAN_MOBILE_RE = re.compile(r"^[6-9]\d{9}$")  # 10 digits, starts 6-9 (no +91 needed)
INDIAN_MOBILE_WITH_CODE_RE = re.compile(r"^(\+91|0)?([6-9]\d{9})$")

MAX_NAME_LEN = 120
MAX_PURPOSE_LEN = 500
MAX_CAMPAIGN_NAME_LEN = 120


class ValidationError(Exception):
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")


def sanitize_text(value: str) -> str:
    """Strip HTML/JS to prevent stored XSS. Returns plain text only."""
    if value is None:
        return value
    cleaned = bleach.clean(value, tags=[], attributes={}, strip=True)
    return cleaned.strip()


def validate_optional_email(value: str):
    if not value:
        return None
    value = value.strip()
    try:
        result = validate_email(value, check_deliverability=False)
        return result.normalized
    except EmailNotValidError as exc:
        raise ValidationError("email", str(exc))


def validate_optional_mobile(value: str):
    if not value:
        return None
    digits = re.sub(r"[\s\-()]", "", value.strip())
    match = INDIAN_MOBILE_WITH_CODE_RE.match(digits)
    if not match:
        raise ValidationError(
            "mobile", "Enter a valid 10-digit Indian mobile number."
        )
    return match.group(2)


def validate_name(value: str):
    if not value:
        return None
    value = sanitize_text(value)
    if len(value) > MAX_NAME_LEN:
        raise ValidationError("name", f"Must be under {MAX_NAME_LEN} characters.")
    return value or None


def validate_purpose(value: str):
    if not value:
        return None
    value = sanitize_text(value)
    if len(value) > MAX_PURPOSE_LEN:
        raise ValidationError(
            "purpose", f"Must be under {MAX_PURPOSE_LEN} characters."
        )
    return value or None


def validate_campaign_name(value: str):
    if not value or not value.strip():
        raise ValidationError("campaign_name", "Campaign name is required.")
    value = sanitize_text(value)
    if len(value) > MAX_CAMPAIGN_NAME_LEN:
        raise ValidationError(
            "campaign_name", f"Must be under {MAX_CAMPAIGN_NAME_LEN} characters."
        )
    return value


def validate_username(value: str):
    if not value or not re.match(r"^[a-zA-Z0-9_.\-]{3,64}$", value):
        raise ValidationError(
            "username",
            "Username must be 3-64 characters: letters, digits, . _ - only.",
        )
    return value


def validate_password_strength(value: str):
    if not value or len(value) < 10:
        raise ValidationError("password", "Password must be at least 10 characters.")
    if not re.search(r"[A-Z]", value) or not re.search(r"[a-z]", value) or not re.search(r"\d", value):
        raise ValidationError(
            "password",
            "Password must include upper, lower case letters and a digit.",
        )
    return value
