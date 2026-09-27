import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

os.environ.setdefault("FLASK_ENV", "testing")

import pytest

from app import create_app
from config import TestingConfig
from extensions import db as _db
from models import Admin


@pytest.fixture()
def app():
    application = create_app(TestingConfig())
    with application.app_context():
        _db.create_all()
        yield application
        _db.session.remove()
        _db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def db(app):
    return _db


@pytest.fixture()
def admin_user(app, db):
    admin = Admin(username="testadmin")
    admin.set_password("StrongPassw0rd!")
    db.session.add(admin)
    db.session.commit()
    return admin


@pytest.fixture()
def auth_headers(client, admin_user):
    resp = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "StrongPassw0rd!"},
    )
    token = resp.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}
