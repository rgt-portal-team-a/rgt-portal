import psycopg2
import psycopg2.extras
import logging
from config.settings import DB_CONFIG

logger = logging.getLogger(__name__)

def get_db_connection():
    """Get a connection to the PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            database=DB_CONFIG["database"]
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        # Log more detailed information for debugging
        logger.error(f"DB Config: {DB_CONFIG['host']}:{DB_CONFIG['port']}, DB: {DB_CONFIG['database']}")
        raise

def get_db_cursor(conn):
    """Get a cursor that returns results as dictionaries"""
    return conn.cursor(cursor_factory=psycopg2.extras.DictCursor)