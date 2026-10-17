from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Batch(Base):
    __tablename__ = "batches"

    id = Column(String(36), primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    filename = Column(String(255), nullable=False)
    row_count = Column(Integer, default=0)
    rejected_count = Column(Integer, default=0)

    predictions = relationship("Prediction", back_populates="batch", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    label = Column(String(255), nullable=True)
    subject = Column(String(50), nullable=False)
    mode = Column(String(50), nullable=False)
    inputs_json = Column(Text, nullable=False)
    predicted_g3 = Column(Float, nullable=False)
    pass_probability = Column(Float, nullable=False)
    predicted_pass = Column(Integer, nullable=False)
    risk_level = Column(String(50), nullable=False)
    factors_json = Column(Text, nullable=False)
    batch_id = Column(String(36), ForeignKey("batches.id", ondelete="CASCADE"), nullable=True)

    batch = relationship("Batch", back_populates="predictions")
