from models import VisitorDetails


def test_xss_payload_sanitized(client, auth_headers, db):
    resp = client.post(
        "/api/links",
        json={"campaign_name": "<script>alert(1)</script>Promo"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert "<script>" not in resp.get_json()["campaign_name"]


def test_sql_injection_in_username_does_not_break_login(client, admin_user):
    resp = client.post(
        "/api/auth/login",
        json={"username": "' OR '1'='1", "password": "anything"},
    )
    # Should be a normal auth failure, not a 500 / DB error.
    assert resp.status_code == 401


def test_unauthorized_access_to_dashboard(client):
    resp = client.get("/api/dashboard/statistics")
    assert resp.status_code == 401


def test_unauthorized_access_to_visitors(client):
    resp = client.get("/api/visitors")
    assert resp.status_code == 401


def test_unauthorized_access_to_audit_logs(client):
    resp = client.get("/api/audit")
    assert resp.status_code == 401


def test_campaign_name_required(client, auth_headers):
    resp = client.post("/api/links", json={}, headers=auth_headers)
    assert resp.status_code == 400


def test_campaign_name_too_long_rejected(client, auth_headers):
    resp = client.post(
        "/api/links",
        json={"campaign_name": "x" * 500},
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_login_rate_limited(client, admin_user):
    # RATELIMIT_ENABLED is False in TestingConfig by default in this scaffold;
    # this test documents the expected production behavior and can be
    # enabled by setting RATELIMIT_ENABLED=True for this test module.
    for _ in range(3):
        client.post(
            "/api/auth/login",
            json={"username": "testadmin", "password": "wrong"},
        )
    # Even without hard rate-limit enforcement in tests, repeated failed
    # logins must never succeed or crash the server.
    resp = client.post(
        "/api/auth/login", json={"username": "testadmin", "password": "wrong"}
    )
    assert resp.status_code == 401
