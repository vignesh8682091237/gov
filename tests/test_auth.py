def test_login_success(client, admin_user):
    resp = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "StrongPassw0rd!"},
    )
    assert resp.status_code == 200
    assert "token" in resp.get_json()


def test_login_wrong_password(client, admin_user):
    resp = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "wrongpass"},
    )
    assert resp.status_code == 401


def test_login_unknown_user_same_status(client, admin_user):
    resp = client.post(
        "/api/auth/login",
        json={"username": "ghost", "password": "whatever123"},
    )
    assert resp.status_code == 401


def test_protected_route_requires_token(client):
    resp = client.get("/api/links")
    assert resp.status_code == 401


def test_protected_route_with_token(client, auth_headers):
    resp = client.get("/api/links", headers=auth_headers)
    assert resp.status_code == 200


def test_logout(client, auth_headers):
    resp = client.post("/api/admin/logout", headers=auth_headers)
    assert resp.status_code == 200


def test_invalid_token_rejected(client):
    resp = client.get("/api/links", headers={"Authorization": "Bearer garbage.token.here"})
    assert resp.status_code == 401
