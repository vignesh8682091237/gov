from models import TrackingLink, VisitorSession, VisitorDetails


def _create_link(client, auth_headers, name="Test Campaign"):
    resp = client.post(
        "/api/links", json={"campaign_name": name}, headers=auth_headers
    )
    assert resp.status_code == 201
    return resp.get_json()


def test_create_and_generate_unique_code(client, auth_headers):
    link1 = _create_link(client, auth_headers, "Campaign A")
    link2 = _create_link(client, auth_headers, "Campaign B")
    assert link1["tracking_code"] != link2["tracking_code"]
    assert len(link1["tracking_code"]) == 8


def test_resolve_valid_link(client, auth_headers):
    link = _create_link(client, auth_headers)
    resp = client.get(f"/api/tracking/{link['tracking_code']}")
    assert resp.status_code == 200
    assert resp.get_json()["valid"] is True


def test_resolve_invalid_link(client):
    resp = client.get("/api/tracking/DOESNOTEXIST")
    assert resp.status_code == 404


def test_decline_stores_minimum_only(client, auth_headers, db):
    link = _create_link(client, auth_headers)
    resp = client.post(
        f"/api/tracking/{link['tracking_code']}/consent",
        json={"consent": "declined"},
    )
    assert resp.status_code == 201
    session_id = resp.get_json()["session_id"]
    session = db.session.get(VisitorSession, session_id)
    assert session.consent_status == "declined"
    # No client-reported technical fields should be present on decline.
    assert session.browser is None
    assert session.operating_system is None
    assert session.screen_resolution is None


def test_accept_stores_client_info(client, auth_headers, db):
    link = _create_link(client, auth_headers)
    resp = client.post(
        f"/api/tracking/{link['tracking_code']}/consent",
        json={
            "consent": "accepted",
            "client_info": {
                "browser": "Chrome 128",
                "operating_system": "Windows 11",
                "device_type": "desktop",
                "screen_resolution": "1920x1080",
                "language": "en-IN",
                "timezone": "Asia/Kolkata",
                "referrer": "https://example.com",
            },
        },
    )
    assert resp.status_code == 201
    session_id = resp.get_json()["session_id"]
    session = db.session.get(VisitorSession, session_id)
    assert session.consent_status == "accepted"
    assert session.screen_resolution == "1920x1080"
    assert session.timezone == "Asia/Kolkata"


def test_details_requires_prior_consent(client, auth_headers):
    link = _create_link(client, auth_headers)
    resp = client.post(
        f"/api/tracking/{link['tracking_code']}/details",
        json={"session_id": "nonexistent", "name": "Vignesh"},
    )
    assert resp.status_code == 403


def test_details_rejected_after_decline(client, auth_headers):
    link = _create_link(client, auth_headers)
    consent_resp = client.post(
        f"/api/tracking/{link['tracking_code']}/consent",
        json={"consent": "declined"},
    )
    session_id = consent_resp.get_json()["session_id"]
    resp = client.post(
        f"/api/tracking/{link['tracking_code']}/details",
        json={"session_id": session_id, "name": "Vignesh"},
    )
    assert resp.status_code == 403


def test_optional_details_all_fields_truly_optional(client, auth_headers):
    link = _create_link(client, auth_headers)
    consent_resp = client.post(
        f"/api/tracking/{link['tracking_code']}/consent",
        json={"consent": "accepted", "client_info": {}},
    )
    session_id = consent_resp.get_json()["session_id"]
    resp = client.post(
        f"/api/tracking/{link['tracking_code']}/details",
        json={"session_id": session_id},  # nothing filled in
    )
    assert resp.status_code == 201


def test_invalid_email_rejected(client, auth_headers):
    link = _create_link(client, auth_headers)
    consent_resp = client.post(
        f"/api/tracking/{link['tracking_code']}/consent",
        json={"consent": "accepted", "client_info": {}},
    )
    session_id = consent_resp.get_json()["session_id"]
    resp = client.post(
        f"/api/tracking/{link['tracking_code']}/details",
        json={"session_id": session_id, "email": "not-an-email"},
    )
    assert resp.status_code == 400


def test_invalid_mobile_rejected(client, auth_headers):
    link = _create_link(client, auth_headers)
    consent_resp = client.post(
        f"/api/tracking/{link['tracking_code']}/consent",
        json={"consent": "accepted", "client_info": {}},
    )
    session_id = consent_resp.get_json()["session_id"]
    resp = client.post(
        f"/api/tracking/{link['tracking_code']}/details",
        json={"session_id": session_id, "mobile": "12345"},
    )
    assert resp.status_code == 400


def test_valid_indian_mobile_accepted(client, auth_headers):
    link = _create_link(client, auth_headers)
    consent_resp = client.post(
        f"/api/tracking/{link['tracking_code']}/consent",
        json={"consent": "accepted", "client_info": {}},
    )
    session_id = consent_resp.get_json()["session_id"]
    resp = client.post(
        f"/api/tracking/{link['tracking_code']}/details",
        json={"session_id": session_id, "mobile": "9876543210"},
    )
    assert resp.status_code == 201
