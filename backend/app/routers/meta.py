import json
import os
from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/meta", tags=["Metadata"])

EXAMPLES = {
    "at_risk": {
        "label": "Marcus (At-Risk Early Alert)",
        "mode": "early",
        "subject": "math",
        "studytime": 1,
        "failures": 2,
        "absences": 16,
        "higher": 0,
        "schoolsup": 1,
        "school": "GP",
        "sex": "M",
        "age": 17,
        "Medu": 1,
        "Fedu": 1,
        "traveltime": 2,
        "famrel": 3,
        "freetime": 4,
        "goout": 4,
        "Dalc": 2,
        "Walc": 3,
        "health": 3
    },
    "average": {
        "label": "Elena (Average Mid-Term Trajectory)",
        "mode": "midterm",
        "subject": "math",
        "studytime": 2,
        "failures": 0,
        "absences": 4,
        "higher": 1,
        "schoolsup": 0,
        "G1": 11,
        "G2": 11,
        "school": "GP",
        "sex": "F",
        "age": 16,
        "Medu": 2,
        "Fedu": 2,
        "traveltime": 1,
        "famrel": 4,
        "freetime": 3,
        "goout": 3,
        "Dalc": 1,
        "Walc": 2,
        "health": 4
    },
    "high_achiever": {
        "label": "Sophia (High Achiever)",
        "mode": "midterm",
        "subject": "portuguese",
        "studytime": 4,
        "failures": 0,
        "absences": 1,
        "higher": 1,
        "schoolsup": 0,
        "G1": 16,
        "G2": 17,
        "school": "GP",
        "sex": "F",
        "age": 16,
        "Medu": 4,
        "Fedu": 4,
        "traveltime": 1,
        "famrel": 5,
        "freetime": 2,
        "goout": 2,
        "Dalc": 1,
        "Walc": 1,
        "health": 5
    }
}

@router.get("")
def get_metadata():
    schema_path = os.path.join(settings.ARTIFACTS_DIR, "schema.json")
    if os.path.exists(schema_path):
        with open(schema_path, "r", encoding="utf-8") as f:
            schema = json.load(f)
    else:
        schema = {}

    return {
        "schema": schema,
        "examples": EXAMPLES
    }
