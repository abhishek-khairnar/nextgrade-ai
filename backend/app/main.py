from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db import Base, engine
from app.routers import batch, history, insights, meta, models, predict
from app.services.predictor import predictor_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and artifacts are verified
    Base.metadata.create_all(bind=engine)
    if not predictor_service.is_ready:
        predictor_service.load_artifacts()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="NextGrade AI API",
    description="Student Performance Prediction API for early warning risk diagnosis and grade forecasting.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "NextGrade AI API",
        "models_loaded": predictor_service.is_ready,
        "supported_modes": ["early", "midterm"],
        "database": "sqlite_connected"
    }

# Mount subrouters under /api
app.include_router(meta.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(batch.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(history.router, prefix="/api")
