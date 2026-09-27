from collections import defaultdict
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, current_app

from models import TrackingLink, VisitorSession
from middleware.auth_middleware import admin_required

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/statistics", methods=["GET"])
@admin_required
def dashboard_statistics():
    links = TrackingLink.query.all()
    sessions = VisitorSession.query.all()

    total_links = len(links)
    total_visits = len(sessions)
    accepted = sum(1 for s in sessions if s.consent_status == "accepted")
    declined = sum(1 for s in sessions if s.consent_status == "declined")

    mask = current_app.config.get("MASK_IPS_IN_DASHBOARD", True)
    unique_ips = {
        (VisitorSession.mask_ip(s.ip_address) if mask else s.ip_address)
        for s in sessions if s.ip_address
    }

    # Visits per day, last 14 days
    since = datetime.now(timezone.utc) - timedelta(days=14)
    per_day = defaultdict(int)
    for s in sessions:
        if s.visited_at and s.visited_at >= since:
            day = s.visited_at.strftime("%Y-%m-%d")
            per_day[day] += 1

    by_device, by_browser, by_os = defaultdict(int), defaultdict(int), defaultdict(int)
    for s in sessions:
        if s.consent_status != "accepted":
            continue
        by_device[s.device_type or "unknown"] += 1
        by_browser[s.browser or "unknown"] += 1
        by_os[s.operating_system or "unknown"] += 1

    return jsonify({
        "summary": {
            "total_links": total_links,
            "total_visits": total_visits,
            "consent_accepted": accepted,
            "consent_declined": declined,
            "unique_ips": len(unique_ips),
        },
        "visits_per_day": dict(sorted(per_day.items())),
        "consent_breakdown": {"accepted": accepted, "declined": declined},
        "by_device_type": dict(by_device),
        "by_browser": dict(by_browser),
        "by_operating_system": dict(by_os),
    })
