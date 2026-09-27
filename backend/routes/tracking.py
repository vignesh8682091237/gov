"""
Public-facing endpoints hit by *visitors*, not admins.

PRIVACY / CONSENT DESIGN (read before modifying):
 1. GET /api/tracking/<code>  just tells the frontend whether the link is
    valid/active. It records NOTHING. The consent page is shown before any
    data is written to the database.
 2. POST /api/tracking/<code>/consent is the ONLY place a visitor_session
    row is created. If the visitor declines, we store only the minimum
    "an event happened" fields (ip, method, timestamp, raw user-agent
    string) for consent-audit purposes, and explicitly leave every
    client-reported column NULL. If the visitor allows, we additionally
    accept the client-reported technical fields the frontend gathered
    from standard, non-invasive browser JS APIs (see frontend consent
    page) — never GPS, never contacts, never stored credentials.
 3. POST /api/tracking/<code>/details stores the OPTIONAL form and only
    succeeds against a session that already has consent_status='accepted'.
    A declined session can never carry a details row.
"""

from flask import Blueprint, request, jsonify

from extensions import db, limiter
from models import TrackingLink, VisitorSession, VisitorDetails
from services.device_parser import parse_user_agent
from utils.ip_utils import get_client_ip
from utils.validators import (
    validate_name, validate_optional_email, validate_optional_mobile,
    validate_purpose, ValidationError,
)

tracking_bp = Blueprint("tracking", __name__, url_prefix="/api/tracking")

ALLOWED_CLIENT_FIELDS = {
    "browser", "operating_system", "device_type", "screen_resolution",
    "language", "timezone", "referrer",
}


@tracking_bp.route("/<tracking_code>", methods=["GET"])
@limiter.limit("60 per minute")
def resolve_link(tracking_code):
    link = TrackingLink.query.filter_by(tracking_code=tracking_code).first()
    if not link or not link.is_usable():
        return jsonify({"valid": False}), 404
    return jsonify({
        "valid": True,
        "campaign_name": link.campaign_name,
        "consent_notice": (
            "This page may collect limited technical information such as "
            "IP address, browser type, operating system, device type, "
            "language, timezone and visit time for security and analytics "
            "purposes."
        ),
    })


@tracking_bp.route("/<tracking_code>/consent", methods=["POST"])
@limiter.limit("30 per minute")
def record_consent(tracking_code):
    link = TrackingLink.query.filter_by(tracking_code=tracking_code).first()
    if not link or not link.is_usable():
        return jsonify({"error": "This tracking link is not valid or has expired."}), 404

    data = request.get_json(silent=True) or {}
    choice = data.get("consent")  # 'accepted' | 'declined'
    if choice not in ("accepted", "declined"):
        return jsonify({"error": "consent must be 'accepted' or 'declined'."}), 400

    ua_raw = request.headers.get("User-Agent", "")
    session = VisitorSession(
        tracking_link_id=link.id,
        consent_status=choice,
        ip_address=get_client_ip(),
        request_method=request.method,
        user_agent_raw=ua_raw,
    )

    if choice == "accepted":
        server_parsed = parse_user_agent(ua_raw)
        client_reported = data.get("client_info") or {}

        # Take client-reported values when present (more precise for e.g.
        # exact browser version / screen size), otherwise fall back to the
        # server-side UA parse. Unknown keys are ignored (allow-list).
        merged = {**server_parsed}
        for key in ALLOWED_CLIENT_FIELDS:
            val = client_reported.get(key)
            if val is not None:
                merged[key] = str(val)[:120]

        session.browser = merged.get("browser")
        session.operating_system = merged.get("operating_system")
        session.device_type = merged.get("device_type")
        session.screen_resolution = merged.get("screen_resolution")
        session.language = merged.get("language")
        session.timezone = merged.get("timezone")
        session.referrer = (merged.get("referrer") or "")[:500] or None

    db.session.add(session)
    db.session.commit()

    return jsonify({
        "session_id": session.id,
        "consent_status": session.consent_status,
        "destination_url": link.destination_url,
    }), 201


@tracking_bp.route("/<tracking_code>/details", methods=["POST"])
@limiter.limit("20 per minute")
def submit_optional_details(tracking_code):
    link = TrackingLink.query.filter_by(tracking_code=tracking_code).first()
    if not link:
        return jsonify({"error": "Invalid tracking link."}), 404

    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id")
    session = VisitorSession.query.filter_by(
        id=session_id, tracking_link_id=link.id
    ).first()

    if not session or session.consent_status != "accepted":
        return jsonify({
            "error": "Optional details can only be submitted after consent is given."
        }), 403

    if session.details is not None:
        return jsonify({"error": "Details already submitted for this visit."}), 409

    try:
        name = validate_name(data.get("name"))
        email = validate_optional_email(data.get("email"))
        mobile = validate_optional_mobile(data.get("mobile"))
        purpose = validate_purpose(data.get("purpose"))
    except ValidationError as exc:
        return jsonify({"error": exc.message, "field": exc.field}), 400

    details = VisitorDetails(
        visitor_session_id=session.id,
        name=name, email=email, mobile=mobile, purpose=purpose,
    )
    db.session.add(details)
    db.session.commit()
    return jsonify({"message": "Thank you.", "details": details.to_dict()}), 201
