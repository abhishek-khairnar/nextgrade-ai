import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

predictions = [
    {
        "mode": "early",
        "subject": "math",
        "studytime": 1,
        "failures": 2,
        "absences": 16,
        "higher": 0,
        "schoolsup": 1,
        "label": "Alex Rivera (Early Alert)",
        "school": "GP",
        "sex": "M",
        "age": 17,
        "Medu": 1,
        "Fedu": 1,
        "Dalc": 3,
        "Walc": 4,
        "health": 2
    },
    {
        "mode": "midterm",
        "subject": "math",
        "studytime": 2,
        "failures": 0,
        "absences": 4,
        "higher": 1,
        "schoolsup": 0,
        "G1": 11,
        "G2": 11,
        "label": "Jordan Lee (Midterm Average)",
        "school": "GP",
        "sex": "F",
        "age": 16,
        "Medu": 2,
        "Fedu": 2,
        "Dalc": 1,
        "Walc": 2,
        "health": 4
    },
    {
        "mode": "midterm",
        "subject": "portuguese",
        "studytime": 4,
        "failures": 0,
        "absences": 0,
        "higher": 1,
        "schoolsup": 0,
        "G1": 17,
        "G2": 18,
        "label": "Maya Chen (Honors Portuguese)",
        "school": "GP",
        "sex": "F",
        "age": 16,
        "Medu": 4,
        "Fedu": 4,
        "Dalc": 1,
        "Walc": 1,
        "health": 5
    },
    {
        "mode": "early",
        "subject": "portuguese",
        "studytime": 2,
        "failures": 0,
        "absences": 2,
        "higher": 1,
        "schoolsup": 0,
        "label": "Carlos Silva (Standard Profile)",
        "school": "MS",
        "sex": "M",
        "age": 15,
        "Medu": 3,
        "Fedu": 3,
        "Dalc": 1,
        "Walc": 1,
        "health": 4
    },
    {
        "mode": "midterm",
        "subject": "math",
        "studytime": 2,
        "failures": 1,
        "absences": 8,
        "higher": 1,
        "schoolsup": 0,
        "G1": 10,
        "G2": 10,
        "label": "Sam Patel (Borderline Pass)",
        "school": "MS",
        "sex": "M",
        "age": 18,
        "Medu": 2,
        "Fedu": 2,
        "Dalc": 2,
        "Walc": 3,
        "health": 3
    }
]

print("Seeding individual predictions...")
for p in predictions:
    res = requests.post(f"{BASE_URL}/predict", json=p)
    if res.status_code == 200:
        data = res.json()
        print(f"  [OK] {p['label']} -> G3: {data['predicted_g3']} ({data['risk_level']} Risk)")
    else:
        print(f"  [ERROR] {p['label']}: {res.status_code} {res.text}")

print("\nSeeding batch predictions...")
with open("data/sample_batch.csv", "rb") as f:
    files = {"file": ("sample_batch.csv", f, "text/csv")}
    res = requests.post(f"{BASE_URL}/predict/batch?mode=midterm", files=files)
    if res.status_code == 200:
        batch_data = res.json()
        print(f"  [OK] Batch ID: {batch_data['batch_id']}, accepted: {batch_data['accepted_rows']}, rejected: {batch_data['rejected_rows']}")
        # Also save batch results to history
        save_res = requests.post(f"{BASE_URL}/history/batch", json={"batch_id": batch_data["batch_id"], "results": batch_data["results"]})
        print(f"  [OK] Batch saved to history: {save_res.status_code}")
    else:
        print(f"  [ERROR] Batch: {res.status_code} {res.text}")
