from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

class FactorImpact(BaseModel):
    feature: str
    label: str
    impact: float
    current_value: Any
    baseline_value: Any

class PredictRequest(BaseModel):
    mode: Literal["early", "midterm"] = "midterm"
    subject: Literal["math", "portuguese"] = "math"
    studytime: int = Field(default=2, ge=1, le=4, description="Weekly study time: 1 (<2h), 2 (2-5h), 3 (5-10h), 4 (>10h)")
    failures: int = Field(default=0, ge=0, le=4, description="Number of past class failures (0 to 4)")
    absences: int = Field(default=4, ge=0, le=93, description="Number of school absences (0 to 93)")
    higher: int = Field(default=1, ge=0, le=1, description="Wants to take higher education: 1 (yes), 0 (no)")
    schoolsup: int = Field(default=0, ge=0, le=1, description="Extra educational school support: 1 (yes), 0 (no)")
    
    # Mid-Term required fields
    G1: Optional[int] = Field(default=None, ge=0, le=20, description="First period grade (0-20)")
    G2: Optional[int] = Field(default=None, ge=0, le=20, description="Second period grade (0-20)")
    
    # Optional / Advanced demographic & lifestyle attributes (defaults to dataset median/mode)
    school: Optional[str] = "GP"
    sex: Optional[str] = "F"
    age: Optional[int] = Field(default=17, ge=15, le=22)
    address: Optional[str] = "U"
    famsize: Optional[str] = "GT3"
    Pstatus: Optional[str] = "T"
    Medu: Optional[int] = Field(default=2, ge=0, le=4)
    Fedu: Optional[int] = Field(default=2, ge=0, le=4)
    Mjob: Optional[str] = "other"
    Fjob: Optional[str] = "other"
    reason: Optional[str] = "course"
    guardian: Optional[str] = "mother"
    traveltime: Optional[int] = Field(default=1, ge=1, le=4)
    famsup: Optional[int] = Field(default=1, ge=0, le=1)
    paid: Optional[int] = Field(default=0, ge=0, le=1)
    activities: Optional[int] = Field(default=1, ge=0, le=1)
    nursery: Optional[int] = Field(default=1, ge=0, le=1)
    internet: Optional[int] = Field(default=1, ge=0, le=1)
    romantic: Optional[int] = Field(default=0, ge=0, le=1)
    famrel: Optional[int] = Field(default=4, ge=1, le=5)
    freetime: Optional[int] = Field(default=3, ge=1, le=5)
    goout: Optional[int] = Field(default=3, ge=1, le=5)
    Dalc: Optional[int] = Field(default=1, ge=1, le=5)
    Walc: Optional[int] = Field(default=1, ge=1, le=5)
    health: Optional[int] = Field(default=3, ge=1, le=5)
    label: Optional[str] = None

    @model_validator(mode="after")
    def validate_mode_requirements(self):
        if self.mode == "midterm":
            if self.G1 is None or self.G2 is None:
                raise ValueError("Both G1 and G2 grades (0-20) are required in Mid-Term mode.")
        return self

class ConfidenceRange(BaseModel):
    min: float
    max: float

class PredictResponse(BaseModel):
    id: Optional[int] = None
    predicted_g3: float
    predicted_g3_formatted: str
    confidence_range: ConfidenceRange
    predicted_pass: int
    pass_probability: float
    risk_level: Literal["Low", "Medium", "High"]
    risk_label: str
    mode: str
    factors: List[FactorImpact]
    suggestions: List[str]

class BatchValidationItem(BaseModel):
    row: int
    reason: str

class BatchPredictionItem(BaseModel):
    row_index: int
    label: str
    subject: str
    predicted_g3: float
    predicted_pass: int
    pass_probability: float
    risk_level: str
    inputs: Dict[str, Any]

class BatchPredictionResponse(BaseModel):
    batch_id: str
    filename: str
    total_rows: int
    accepted_rows: int
    rejected_rows: int
    rejected_details: List[BatchValidationItem]
    results: List[BatchPredictionItem]
    risk_summary: Dict[str, int]
    grade_distribution: List[Dict[str, Any]]

class HistoryItem(BaseModel):
    id: int
    created_at: datetime
    label: Optional[str]
    subject: str
    mode: str
    predicted_g3: float
    pass_probability: float
    predicted_pass: int
    risk_level: str
    inputs: Dict[str, Any]
    factors: List[FactorImpact]

class HistoryListResponse(BaseModel):
    items: List[HistoryItem]
    total: int
    page: int
    page_size: int
    total_pages: int
