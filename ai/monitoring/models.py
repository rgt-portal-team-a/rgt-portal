# monitoring/models.py
from sqlalchemy import Column, Integer, Float, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class ModelMetrics(Base):
    __tablename__ = 'model_metrics'
    id = Column(Integer, primary_key=True)
    model_name = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Text, nullable=False)
    details = Column(Text)


class ModelInputMetrics(Base):
    __tablename__ = 'model_input_metrics'
    id = Column(Integer, primary_key=True)
    model_name = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    feature_name = Column(String(100), nullable=False)
    feature_value = Column(Text, nullable=False)
