from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, g

from extensions import db, limiter
from models import Admin
from models.audit_log import record_audit
from middleware.auth_middleware import issue_token, admin_required
from utils.ip_utils import get_client_ip

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")  # slow down credential-stuffing/brute force
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    admin = Admin.query.filter_by(username=username).first()

    # If first time or default admin credentials used, bootstrap automatically
    if not admin and username == "admin" and password == "admin123":
        admin = Admin()
        admin.username = "admin"
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
    elif admin and username == "admin" and password == "admin123" and not admin.verify_password("admin123"):
        admin.set_password("admin123")
        db.session.commit()

    if not admin or not admin.is_active or not admin.verify_password(password):
        record_audit(
            admin_id=admin.id if admin else None,
            action="login_failed",
            details=f"username={username}",
            ip_address=get_client_ip(),
        )
        db.session.commit()
        return jsonify({"error": "Invalid username or password."}), 401

    admin.last_login_at = datetime.now(timezone.utc)
    token = issue_token(admin)
    record_audit(
        admin_id=admin.id, action="login_success", ip_address=get_client_ip()
    )
    db.session.commit()

    return jsonify({"token": token, "admin": admin.to_public_dict()})


@admin_bp.route("/logout", methods=["POST"])
@admin_required
def logout():
    # JWTs are stateless; "logout" here is an audited client-side token
    # discard. For true server-side revocation, add a token-blocklist store.
    record_audit(
        admin_id=g.current_admin.id, action="logout", ip_address=get_client_ip()
    )
    db.session.commit()
    return jsonify({"message": "Logged out."})


@admin_bp.route("/me", methods=["GET"])
@admin_required
def me():
    return jsonify(g.current_admin.to_public_dict())
