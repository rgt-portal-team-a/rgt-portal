from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, func, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from sqlalchemy.sql import case
from sqlalchemy.exc import OperationalError, SQLAlchemyError
import logging
import time
import psycopg2
from typing import Optional

Base = declarative_base()

# Configure logging
logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class EndpointMetrics(Base):
    __tablename__ = 'endpoint_metrics'
    id = Column(Integer, primary_key=True)
    endpoint = Column(String(255))
    timestamp = Column(DateTime, default=datetime.utcnow)
    response_time = Column(Float)
    status_code = Column(Integer)


class ModelMetrics(Base):
    __tablename__ = 'model_metrics'
    id = Column(Integer, primary_key=True)
    model_name = Column(String(255))
    timestamp = Column(DateTime, default=datetime.utcnow)
    metric_name = Column(String(255))
    metric_value = Column(Float)


class SystemMetrics(Base):
    __tablename__ = 'system_metrics'
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    cpu_usage = Column(Float)
    memory_usage = Column(Float)


def get_database_url(use_ssl: bool = True) -> str:
    """Construct the database connection URL with optional SSL"""
    from config.settings import DB_CONFIG
    base_url = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
    return f"{base_url}?sslmode=require" if use_ssl else base_url


def create_db_engine(max_retries: int = 3, retry_delay: int = 2) -> Optional[create_engine]:
    """Create database engine with retry logic"""
    for attempt in range(max_retries):
        try:
            engine = create_engine(
                get_database_url(),
                pool_pre_ping=True,
                pool_size=5,
                max_overflow=10,
                pool_recycle=3600,
                connect_args={
                    'connect_timeout': 10,
                    'keepalives': 1,
                    'keepalives_idle': 30,
                    'keepalives_interval': 10,
                    'keepalives_count': 5
                }
            )

            # Test connection immediately
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            logger.info("Database connection established successfully")
            return engine

        except OperationalError as e:
            logger.warning(
                f"Connection attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries - 1:
                logger.error(
                    "Max retries reached, could not connect to database")
                return None
            time.sleep(retry_delay * (attempt + 1))  # Exponential backoff


def init_db() -> bool:
    """Initialize database tables with error handling"""
    try:
        global engine, Session

        engine = create_db_engine()
        if engine is None:
            logger.error("Failed to create database engine")
            return False

        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)

        logger.info("Database tables initialized successfully")
        return True

    except SQLAlchemyError as e:
        logger.error(f"Database initialization failed: {str(e)}")
        return False


# Initialize database connection and session maker
engine = create_db_engine()
Session = sessionmaker(bind=engine) if engine else None


def get_session():
    """Provide a database session with automatic cleanup"""
    if not Session:
        raise RuntimeError("Database session factory not initialized")

    session = Session()
    try:
        yield session
    except Exception as e:
        session.rollback()
        logger.error(f"Database operation failed: {str(e)}")
        raise
    finally:
        session.close()
