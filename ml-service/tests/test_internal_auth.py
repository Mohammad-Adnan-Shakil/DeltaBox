import importlib


def load_app(monkeypatch, token=None, auth_disabled=None):
    if token is None:
        monkeypatch.delenv("ML_SERVICE_TOKEN", raising=False)
    else:
        monkeypatch.setenv("ML_SERVICE_TOKEN", token)
    if auth_disabled is None:
        monkeypatch.delenv("ML_AUTH_DISABLED", raising=False)
    else:
        monkeypatch.setenv("ML_AUTH_DISABLED", auth_disabled)

    import app
    return importlib.reload(app).app


def test_protected_route_without_header_returns_401(monkeypatch):
    client = load_app(monkeypatch, "test-token").test_client()

    response = client.post("/predict", json={})

    assert response.status_code == 401
    assert response.json == {"error": "unauthorized"}


def test_protected_route_with_wrong_header_returns_401(monkeypatch):
    client = load_app(monkeypatch, "test-token").test_client()

    response = client.post("/predict", headers={"X-Internal-Token": "wrong"}, json={})

    assert response.status_code == 401


def test_protected_route_with_correct_header_is_not_401(monkeypatch):
    client = load_app(monkeypatch, "test-token").test_client()

    response = client.post("/predict", headers={"X-Internal-Token": "test-token"}, json={})

    assert response.status_code != 401


def test_health_does_not_require_header(monkeypatch):
    client = load_app(monkeypatch, "test-token").test_client()

    response = client.get("/health")

    assert response.status_code == 200


def test_unset_token_returns_503(monkeypatch):
    client = load_app(monkeypatch).test_client()

    response = client.post("/predict", json={})

    assert response.status_code == 503
    assert response.json == {"error": "ml_service_token_not_configured"}
