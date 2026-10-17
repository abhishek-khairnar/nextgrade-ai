import os
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

class Settings(BaseModel):
    PROJECT_NAME: str = "NextGrade AI API"
    API_PREFIX: str = "/api"
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'nextgrade.db')}")
    ARTIFACTS_DIR: str = os.getenv("ARTIFACTS_DIR", os.path.join(BASE_DIR, "artifacts"))
    PROCESSED_CSV_PATH: str = os.getenv(
        "PROCESSED_CSV_PATH",
        os.path.join(PROJECT_ROOT, "data", "processed", "students_clean.csv")
    )

settings = Settings()
