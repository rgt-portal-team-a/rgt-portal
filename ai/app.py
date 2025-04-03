from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, HTMLResponse
import logging
import os
from dotenv import load_dotenv
from enum import Enum
import uvicorn

# Import config
from config.settings import api_key, DB_CONFIG
from utils.db import get_db_connection, get_db_cursor

# Import routers directly from their modules
from routers.health_router import router as health_router
from routers.recruitment_router import router as recruitment_router
from routers.attrition_router import router as attrition_router
from routers.cv_router import router as cv_router
from routers.query_router import router as query_router
from routers.scoring_router import router as scoring_router
from routers.report_router import router as report_router

# Set up logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="RGT API Project",
    description="AI APIs for RGT Portal",
    version="1.0.0"
)

# Load environment variables
load_dotenv()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(recruitment_router)
app.include_router(attrition_router)
app.include_router(cv_router)
app.include_router(query_router)
app.include_router(scoring_router)
app.include_router(report_router)

@app.get("/")
def read_root():
    return {"message": "RGT API Project"}

if __name__ == "__main__":
    # Run the server
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
