import functools

import jwt
from flask import request, jsonify, current_app, g

from models import Admin


def issue_token(admin: Admin) -> str:
    import datetime as dt

    now = dt.datetime.now(dt.timezone.utc)
    payload = {
        "sub": admin.id,
        "username": admin.username,
        "iat": now,
        "exp": now + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def _extract_token():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[len("Bearer "):].strip()
    return None


def admin_required(view_func):
    """Protects a route: requires a valid, non-expired JWT for an active admin."""

    @functools.wraps(view_func)
    def wrapper(*args, **kwargs):
        token = _extract_token()
        if not token:
            return jsonify({"error": "Authentication required."}), 401
        try:
            payload = jwt.decode(
                token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
            )
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token."}), 401

        from extensions import db
        admin = db.session.get(Admin, payload.get("sub"))
        if not admin or not admin.is_active:
            return jsonify({"error": "Account not found or disabled."}), 401

        g.current_admin = admin
        return view_func(*args, **kwargs)

    return wrapper
