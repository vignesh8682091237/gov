from flask import Blueprint, request, jsonify, g

from extensions import db
from models import TrackingLink
from models.audit_log import record_audit
from middleware.auth_middleware import admin_required
from utils.validators import validate_campaign_name, ValidationError
from utils.ip_utils import get_client_ip

links_bp = Blueprint("links", __name__, url_prefix="/api/links")


@links_bp.route("", methods=["POST"])
@admin_required
def create_link():
    data = request.get_json(silent=True) or {}
    try:
        campaign_name = validate_campaign_name(data.get("campaign_name"))
    except ValidationError as exc:
        return jsonify({"error": exc.message, "field": exc.field}), 400

    destination_url = (data.get("destination_url") or "/thank-you").strip()[:500]

    link = TrackingLink(
        campaign_name=campaign_name,
        destination_url=destination_url,
        created_by=g.current_admin.id,
    )
    db.session.add(link)
    record_audit(
        admin_id=g.current_admin.id,
        action="link_created",
        details=f"campaign={campaign_name}",
        ip_address=get_client_ip(),
    )
    db.session.commit()
    return jsonify(link.to_dict()), 201


@links_bp.route("", methods=["GET"])
@admin_required
def list_links():
    links = TrackingLink.query.order_by(TrackingLink.created_at.desc()).all()
    return jsonify([l.to_dict(include_stats=True) for l in links])


@links_bp.route("/<link_id>", methods=["GET"])
@admin_required
def get_link(link_id):
    link = TrackingLink.query.get_or_404(link_id)
    return jsonify(link.to_dict(include_stats=True))


@links_bp.route("/<link_id>", methods=["PATCH"])
@admin_required
def update_link(link_id):
    link = TrackingLink.query.get_or_404(link_id)
    data = request.get_json(silent=True) or {}

    if "status" in data and data["status"] in ("active", "inactive"):
        link.status = data["status"]
    if "campaign_name" in data:
        try:
            link.campaign_name = validate_campaign_name(data["campaign_name"])
        except ValidationError as exc:
            return jsonify({"error": exc.message, "field": exc.field}), 400

    record_audit(
        admin_id=g.current_admin.id,
        action="link_updated",
        details=f"link_id={link_id} status={link.status}",
        ip_address=get_client_ip(),
    )
    db.session.commit()
    return jsonify(link.to_dict())


@links_bp.route("/<link_id>", methods=["DELETE"])
@admin_required
def delete_link(link_id):
    link = TrackingLink.query.get_or_404(link_id)
    db.session.delete(link)  # cascades to sessions + details
    record_audit(
        admin_id=g.current_admin.id,
        action="link_deleted",
        details=f"link_id={link_id}",
        ip_address=get_client_ip(),
    )
    db.session.commit()
    return jsonify({"message": "Deleted."})


@links_bp.route("/<link_id>/statistics", methods=["GET"])
@admin_required
def link_statistics(link_id):
    link = TrackingLink.query.get_or_404(link_id)
    sessions = link.sessions.all()
    total = len(sessions)
    accepted = sum(1 for s in sessions if s.consent_status == "accepted")
    declined = sum(1 for s in sessions if s.consent_status == "declined")

    by_device, by_browser, by_os = {}, {}, {}
    for s in sessions:
        if s.consent_status != "accepted":
            continue
        by_device[s.device_type or "unknown"] = by_device.get(s.device_type or "unknown", 0) + 1
        by_browser[s.browser or "unknown"] = by_browser.get(s.browser or "unknown", 0) + 1
        by_os[s.operating_system or "unknown"] = by_os.get(s.operating_system or "unknown", 0) + 1

    return jsonify({
        "link": link.to_dict(),
        "total_visits": total,
        "consent_accepted": accepted,
        "consent_declined": declined,
        "by_device_type": by_device,
        "by_browser": by_browser,
        "by_operating_system": by_os,
    })
