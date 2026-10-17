import io
import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app
from app.db import Base, engine

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["models_loaded"] is True
    assert "early" in data["supported_modes"]
    assert "midterm" in data["supported_modes"]

def test_metadata_endpoint():
    resp = client.get("/api/meta")
    assert resp.status_code == 200
    data = resp.json()
    assert "schema" in data
    assert "examples" in data
    assert "at_risk" in data["examples"]
    assert "high_achiever" in data["examples"]

def test_predict_early_warning_mode():
    payload = {
        "mode": "early",
        "subject": "math",
        "studytime": 3,
        "failures": 0,
        "absences": 2,
        "higher": 1,
        "schoolsup": 0,
        "label": "Test Student Early"
    }
    resp = client.post("/api/predict", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert 0.0 <= data["predicted_g3"] <= 20.0
    assert data["predicted_pass"] in [0, 1]
    assert data["risk_level"] in ["Low", "Medium", "High"]
    assert len(data["factors"]) > 0
    assert len(data["suggestions"]) > 0
    assert data["id"] is not None

def test_predict_midterm_mode_success():
    payload = {
        "mode": "midterm",
        "subject": "math",
        "studytime": 3,
        "failures": 0,
        "absences": 2,
        "higher": 1,
        "schoolsup": 0,
        "G1": 15,
        "G2": 16,
        "label": "Test Student Midterm"
    }
    resp = client.post("/api/predict", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert 13.0 <= data["predicted_g3"] <= 20.0  # High past grades should predict high
    assert data["predicted_pass"] == 1
    assert data["risk_level"] == "Low"

def test_predict_midterm_missing_grades_fails():
    payload = {
        "mode": "midterm",
        "subject": "math",
        "studytime": 2,
        "failures": 0,
        "absences": 4,
        "higher": 1,
        "schoolsup": 0
        # G1 and G2 omitted
    }
    resp = client.post("/api/predict", json=payload)
    assert resp.status_code == 422  # Pydantic validation error

def test_predict_invalid_studytime_fails():
    payload = {
        "mode": "early",
        "subject": "math",
        "studytime": 99,  # Invalid range (1-4)
        "failures": 0,
        "absences": 4,
        "higher": 1,
        "schoolsup": 0
    }
    resp = client.post("/api/predict", json=payload)
    assert resp.status_code == 422

def test_batch_template_download():
    resp = client.get("/api/batch/template")
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert "studytime" in resp.text
    assert "failures" in resp.text

def test_batch_upload_valid_and_invalid_rows():
    csv_content = """label,subject,studytime,failures,absences,higher,schoolsup,G1,G2
Valid Student 1,math,2,0,2,1,0,12,13
Invalid Student 2 (studytime out of range),math,10,0,2,1,0,12,13
Valid Student 3,portuguese,3,1,4,1,0,8,9
"""
    file_bytes = io.BytesIO(csv_content.encode("utf-8"))
    files = {"file": ("test_batch.csv", file_bytes, "text/csv")}
    resp = client.post("/api/predict/batch?mode=midterm", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_rows"] == 3
    assert data["accepted_rows"] == 2
    assert data["rejected_rows"] == 1
    assert data["rejected_details"][0]["row"] == 3

def test_insights_endpoints():
    r_summary = client.get("/api/insights/summary")
    assert r_summary.status_code == 200
    assert r_summary.json()["total_students"] == 1044

    r_prog = client.get("/api/insights/progression")
    assert r_prog.status_code == 200
    assert "overall" in r_prog.json()

    r_dist = client.get("/api/insights/distribution?feature=G3&subject=math")
    assert r_dist.status_code == 200
    assert "distribution" in r_dist.json()

    r_corr = client.get("/api/insights/correlations")
    assert r_corr.status_code == 200
    assert "matrix" in r_corr.json()

    r_qual = client.get("/api/insights/quality")
    assert r_qual.status_code == 200
    assert r_qual.json()["missing_values_count"] == 0

def test_models_endpoints():
    r_metrics = client.get("/api/models/metrics")
    assert r_metrics.status_code == 200
    assert "early" in r_metrics.json()
    assert "midterm" in r_metrics.json()

    r_imp = client.get("/api/models/importance?mode=midterm")
    assert r_imp.status_code == 200
    assert isinstance(r_imp.json(), list)
    assert len(r_imp.json()) > 0

    r_diag = client.get("/api/models/diagnostics?mode=midterm")
    assert r_diag.status_code == 200
    assert "confusion_matrix" in r_diag.json()

def test_history_crud_and_export():
    # 1. Fetch history
    r_hist = client.get("/api/history")
    assert r_hist.status_code == 200
    data = r_hist.json()
    assert data["total"] > 0
    first_id = data["items"][0]["id"]

    # 2. Get detail
    r_detail = client.get(f"/api/history/{first_id}")
    assert r_detail.status_code == 200
    assert r_detail.json()["id"] == first_id

    # 3. Export CSV
    r_export = client.get("/api/history/export.csv")
    assert r_export.status_code == 200
    assert "predicted_g3" in r_export.text

    # 4. Delete single record
    r_del = client.delete(f"/api/history/{first_id}")
    assert r_del.status_code == 200
    assert r_del.json()["status"] == "deleted"
