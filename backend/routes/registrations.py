import csv
import io
from flask import Blueprint, request, jsonify, Response
from extensions import db, limiter
from models import Registration
from middleware.auth_middleware import admin_required
from services.device_parser import parse_user_agent
from utils.ip_utils import get_client_ip

registrations_bp = Blueprint("registrations", __name__, url_prefix="/api/registrations")


@registrations_bp.route("", methods=["POST"])
@limiter.limit("30 per minute")
def create_registration():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Full name is required.", "field": "name"}), 400

    email = (data.get("email") or "").strip().lower()
    if not email or "@" not in email:
        return jsonify({"error": "Valid email address is required.", "field": "email"}), 400

    mobile = (data.get("mobile") or "").strip()
    if not mobile or len(mobile) < 7:
        return jsonify({"error": "Valid mobile number is required.", "field": "mobile"}), 400

    alt_mobile = (data.get("alt_mobile") or "").strip() or None
    dob = (data.get("dob") or "").strip() or None

    age = data.get("age")
    if age is not None and str(age).strip():
        try:
            age = int(age)
            if age < 1 or age > 120:
                return jsonify({"error": "Age must be between 1 and 120.", "field": "age"}), 400
        except ValueError:
            return jsonify({"error": "Invalid age value.", "field": "age"}), 400
    else:
        age = None

    # Technical metadata (IP, device info)
    ua_raw = request.headers.get("User-Agent", "")
    parsed_ua = parse_user_agent(ua_raw)
    client_info = data.get("client_info") or {}

    device_type = client_info.get("device_type") or parsed_ua.get("device_type") or "Unknown"
    browser = client_info.get("browser") or parsed_ua.get("browser") or "Unknown"
    os = client_info.get("operating_system") or parsed_ua.get("operating_system") or "Unknown"

    reg = Registration(
        name=name[:120],
        age=age,
        dob=dob[:50] if dob else None,
        email=email[:254],
        mobile=mobile[:30],
        alt_mobile=alt_mobile[:30] if alt_mobile else None,
        ip_address=get_client_ip(),
        user_agent=ua_raw[:500],
        device_type=str(device_type)[:60],
        browser=str(browser)[:100],
        operating_system=str(os)[:100],
    )

    db.session.add(reg)
    db.session.commit()

    return jsonify({
        "message": "Registration successful!",
        "id": reg.id,
        "name": reg.name,
    }), 201


@registrations_bp.route("", methods=["GET"])
@admin_required
def list_registrations():
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(int(request.args.get("per_page", 25)), 100)
    search = (request.args.get("q") or "").strip()

    query = Registration.query
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            db.or_(
                Registration.name.ilike(search_filter),
                Registration.email.ilike(search_filter),
                Registration.mobile.ilike(search_filter),
                Registration.alt_mobile.ilike(search_filter),
            )
        )

    query = query.order_by(Registration.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": [r.to_dict() for r in pagination.items],
        "page": page,
        "per_page": per_page,
        "total": pagination.total,
    })


@registrations_bp.route("/export", methods=["GET"])
@admin_required
def export_registrations_csv():
    items = Registration.query.order_by(Registration.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Name", "Age", "Date of Birth", "Email", "Mobile",
        "Alternative Mobile", "IP Address", "Device Type", "Browser", "OS", "Created At"
    ])

    for r in items:
        writer.writerow([
            r.id,
            r.name,
            r.age or "",
            r.dob or "",
            r.email,
            r.mobile,
            r.alt_mobile or "",
            r.ip_address or "",
            r.device_type or "",
            r.browser or "",
            r.operating_system or "",
            r.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if r.created_at else "",
        ])

    csv_data = output.getvalue()
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=registrations.csv"},
    )


@registrations_bp.route("/<reg_id>", methods=["DELETE"])
@admin_required
def delete_registration(reg_id):
    reg = Registration.query.get(reg_id)
    if not reg:
        return jsonify({"error": "Registration not found"}), 404

    db.session.delete(reg)
    db.session.commit()
    return jsonify({"message": "Registration deleted successfully"})
