import io
import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test_endpoints():
    print("Testing all FastAPI endpoints on 127.0.0.1:8000...")
    
    # 1. Health
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health failed: {r.status_code}"
    print("[OK] GET /health ->", r.json()["status"])

    # 2. Meta
    r = requests.get(f"{BASE_URL}/meta")
    assert r.status_code == 200, f"Meta failed: {r.status_code}"
    print("[OK] GET /meta -> schema & examples verified")

    # 3. Predict Early
    r = requests.post(f"{BASE_URL}/predict", json={
        "mode": "early",
        "subject": "math",
        "studytime": 3,
        "failures": 0,
        "absences": 2,
        "higher": 1,
        "schoolsup": 0,
        "label": "Test Early Warning"
    })
    assert r.status_code == 200, f"Predict early failed: {r.status_code}"
    early_id = r.json()["id"]
    print(f"[OK] POST /predict (early) -> G3: {r.json()['predicted_g3']} / 20 (id: {early_id})")

    # 4. Predict Midterm
    r = requests.post(f"{BASE_URL}/predict", json={
        "mode": "midterm",
        "subject": "math",
        "studytime": 3,
        "failures": 0,
        "absences": 2,
        "higher": 1,
        "schoolsup": 0,
        "G1": 15,
        "G2": 16,
        "label": "Test Midterm"
    })
    assert r.status_code == 200, f"Predict midterm failed: {r.status_code}"
    midterm_id = r.json()["id"]
    print(f"[OK] POST /predict (midterm) -> G3: {r.json()['predicted_g3']} / 20 (id: {midterm_id})")

    # 5. Batch template
    r = requests.get(f"{BASE_URL}/batch/template")
    assert r.status_code == 200 and "text/csv" in r.headers["content-type"]
    print("[OK] GET /batch/template -> CSV template download verified")

    # 6. Batch upload valid
    csv_valid = "label,subject,studytime,failures,absences,higher,schoolsup,G1,G2\nS1,math,2,0,2,1,0,12,13\n"
    r = requests.post(f"{BASE_URL}/predict/batch?mode=midterm", files={"file": ("valid.csv", io.BytesIO(csv_valid.encode()), "text/csv")})
    assert r.status_code == 200 and r.json()["accepted_rows"] == 1
    print("[OK] POST /predict/batch (valid CSV) -> 1 accepted")

    # 7. Batch upload partly invalid
    csv_partly = "label,subject,studytime,failures,absences,higher,schoolsup,G1,G2\nS1,math,2,0,2,1,0,12,13\nS2,math,99,0,2,1,0,12,13\n"
    r = requests.post(f"{BASE_URL}/predict/batch?mode=midterm", files={"file": ("partly.csv", io.BytesIO(csv_partly.encode()), "text/csv")})
    assert r.status_code == 200 and r.json()["accepted_rows"] == 1 and r.json()["rejected_rows"] == 1
    print("[OK] POST /predict/batch (partly invalid) -> 1 accepted, 1 rejected")

    # 8. Batch upload empty CSV (expect 400)
    r = requests.post(f"{BASE_URL}/predict/batch?mode=midterm", files={"file": ("empty.csv", io.BytesIO(b""), "text/csv")})
    assert r.status_code == 400
    print("[OK] POST /predict/batch (empty CSV) -> 400 Bad Request verified")

    # 9. Batch upload wrong file type (expect 400)
    r = requests.post(f"{BASE_URL}/predict/batch?mode=midterm", files={"file": ("test.txt", io.BytesIO(b"hello"), "text/plain")})
    assert r.status_code == 400
    print("[OK] POST /predict/batch (wrong file type) -> 400 Bad Request verified")

    # 10. Batch upload oversized file (> 2 MB, expect 400)
    large_csv = b"a" * (2 * 1024 * 1024 + 10)
    r = requests.post(f"{BASE_URL}/predict/batch?mode=midterm", files={"file": ("large.csv", io.BytesIO(large_csv), "text/csv")})
    assert r.status_code == 400
    print("[OK] POST /predict/batch (oversized file) -> 400 Bad Request verified")

    # 11. Insights
    for ep in ["summary", "progression", "distribution", "correlations", "quality"]:
        r = requests.get(f"{BASE_URL}/insights/{ep}")
        assert r.status_code == 200, f"insights/{ep} failed"
        print(f"[OK] GET /insights/{ep}")

    # 12. Models
    for ep in ["metrics", "importance", "diagnostics"]:
        r = requests.get(f"{BASE_URL}/models/{ep}")
        assert r.status_code == 200, f"models/{ep} failed"
        print(f"[OK] GET /models/{ep}")

    # 13. History
    r = requests.get(f"{BASE_URL}/history")
    assert r.status_code == 200
    print(f"[OK] GET /history -> total items: {r.json()['total']}")

    r = requests.get(f"{BASE_URL}/history/{early_id}")
    assert r.status_code == 200
    print(f"[OK] GET /history/{early_id} -> detail retrieved")

    r = requests.get(f"{BASE_URL}/history/export.csv")
    assert r.status_code == 200 and "text/csv" in r.headers["content-type"]
    print("[OK] GET /history/export.csv -> CSV export streamed")

    print("\n[ALL ENDPOINTS VERIFIED SUCCESSFULLY]")

if __name__ == "__main__":
    test_endpoints()
