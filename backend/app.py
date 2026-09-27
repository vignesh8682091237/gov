import os
from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify, request

from config import get_config
from extensions import db, cors, limiter
from middleware.security_headers import apply_security_headers

try:
    from flask_talisman import Talisman  # type: ignore
except ImportError:  # optional at import time for lightweight test runs
    Talisman = None


def create_app(config_object=None):
    app = Flask(__name__)
    app.config.from_object(config_object or get_config())

    # --- Extensions --------------------------------------------------
    db.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=False,
    )
    limiter.init_app(app)

    if Talisman and app.config.get("FORCE_HTTPS"):
        Talisman(
            app,
            force_https=True,
            strict_transport_security=True,
            content_security_policy={
                "default-src": "'self'",
            },
        )

    app.after_request(apply_security_headers)

    # --- Blueprints ----------------------------------------------------
    from routes.auth import auth_bp, admin_bp
    from routes.links import links_bp
    from routes.tracking import tracking_bp
    from routes.dashboard import dashboard_bp
    from routes.visitors import visitors_bp, audit_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(links_bp)
    app.register_blueprint(tracking_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(visitors_bp)
    app.register_blueprint(audit_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"})

    @app.route("/api/setup-admin", methods=["POST"])
    def setup_admin():
        """One-time setup: init DB + create first admin. Protected by SETUP_TOKEN."""
        import os
        from models import Admin

        token = request.headers.get("X-Setup-Token", "")
        expected = os.environ.get("SETUP_TOKEN", "")
        if not expected or token != expected:
            return jsonify({"error": "Forbidden"}), 403

        db.create_all()
        data = request.get_json(silent=True) or {}
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""
        if not username or not password:
            return jsonify({"error": "username and password required"}), 400
        if Admin.query.filter_by(username=username).first():
            return jsonify({"error": "Admin already exists"}), 409

        admin = Admin()
        admin.username = username
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        return jsonify({"message": f"Admin '{username}' created successfully."})


    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"error": "Not found."}), 404

    @app.errorhandler(500)
    def server_error(_e):
        # Never leak stack traces / internals to clients.
        return jsonify({"error": "Internal server error."}), 500

    @app.cli.command("init-db")
    def init_db():
        """flask --app app init-db  -> creates tables (dev convenience)."""
        db.create_all()
        print("Database tables created.")

    @app.cli.command("create-admin")
    def create_admin_cmd():
        """flask --app app create-admin  -> interactive first-admin creation."""
        import getpass
        from models import Admin
        from utils.validators import validate_username, validate_password_strength

        username = input("New admin username: ").strip()
        password = getpass.getpass("New admin password: ")
        validate_username(username)
        validate_password_strength(password)

        if Admin.query.filter_by(username=username).first():
            print("That username already exists.")
            return

        admin = Admin()
        admin.username = username
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        print(f"Admin '{username}' created.")

    @app.cli.command("purge-expired-data")
    def purge_expired_data():
        """
        Data retention job (spec section 8): deletes visitor_sessions /
        visitor_details older than DATA_RETENTION_DAYS. Wire this up as a
        cron / scheduled task in production. No-op if retention == 0.
        """
        from datetime import datetime, timedelta, timezone
        from models import VisitorSession

        days = app.config["DATA_RETENTION_DAYS"]
        if not days:
            print("Data retention purge disabled (DATA_RETENTION_DAYS=0).")
            return
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        old = VisitorSession.query.filter(VisitorSession.visited_at < cutoff)
        count = old.count()
        old.delete(synchronize_session=False)
        db.session.commit()
        print(f"Purged {count} visitor session(s) older than {days} days.")

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=application.config.get("DEBUG", False),
    )
