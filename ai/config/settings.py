import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Keys
api_key = os.getenv("GROQ_API_KEY")

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "tramway.proxy.rlwy.net"),
    "port": int(os.getenv("DB_PORT", "55140")),
    "user": os.getenv("DB_USERNAME", "postgres"),
    "password": os.getenv("DB_PASSWORD", "sQBXitkORvKixULmKfAufGUKZanZTeuv"),
    "database": os.getenv("DB_NAME", "railway")
}

# Constants
MAX_PDF_PAGES = 5  # Maximum allowed PDF pages for CV uploads