from flask import Blueprint, request, jsonify, current_app

from models import VisitorSession, TrackingLink, VisitorDetails, AuditLog
from middleware.auth_middleware import admin_required

visitors_bp = Blueprint("visitors", __name__, url_prefix="/api/visitors")
audit_bp = Blueprint("audit", __name__, url_prefix="/api/audit")


@visitors_bp.route("", methods=["GET"])
@admin_required
def list_visitors():
    """Visitor table: time, campaign, ip, device, browser, os, consent."""
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(int(request.args.get("per_page", 25)), 100)
    link_id = request.args.get("link_id")

    query = VisitorSession.query.join(TrackingLink)
    if link_id:
        query = query.filter(VisitorSession.tracking_link_id == link_id)
    query = query.order_by(VisitorSession.visited_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    mask = current_app.config.get("MASK_IPS_IN_DASHBOARD", True)

    rows = []
    for s in pagination.items:
        row = s.to_dict(mask_ip=mask)
        row["campaign_name"] = s.tracking_link.campaign_name
        rows.append(row)

    return jsonify({
        "items": rows,
        "page": page,
        "per_page": per_page,
        "total": pagination.total,
    })


@visitors_bp.route("/<session_id>/details", methods=["GET"])
@admin_required
def get_visitor_details(session_id):
    """
    Optional voluntary details (name/email/mobile/purpose) — separated from
    the main visitor table and gated behind admin auth, per spec section 7.
    """
    details = VisitorDetails.query.filter_by(visitor_session_id=session_id).first()
    if not details:
        return jsonify({"details": None})
    return jsonify({"details": details.to_dict()})


@audit_bp.route("", methods=["GET"])
@admin_required
def list_audit_logs():
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(int(request.args.get("per_page", 50)), 200)
    pagination = AuditLog.query.order_by(AuditLog.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "items": [a.to_dict() for a in pagination.items],
        "page": page,
        "per_page": per_page,
        "total": pagination.total,
    })
