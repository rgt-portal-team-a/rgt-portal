from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
import os
import tempfile
import logging
from config.settings import MAX_PDF_PAGES
from cv_screening.cv_processor import process_cv
from langchain_community.document_loaders import PyPDFLoader

router = APIRouter(tags=["CV Processing"], prefix="/upload-cv")
logger = logging.getLogger(__name__)

@router.post("/")
async def upload_cv(file: UploadFile = File(...)):
    """
    Upload and process a CV file, and return extracted information.
    Rejects CVs that exceed the page limit.
    """
    temp_file_path = None

    try:
        # Read content
        content = await file.read()

        # Save the uploaded file to a temporary location
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Check page count for PDF files
        if suffix.lower() == '.pdf':
            try:
                # Use PyPDFLoader to count pages
                loader = PyPDFLoader(temp_file_path)
                documents = loader.load()

                # Count pages
                page_count = len(documents)

                if page_count > MAX_PDF_PAGES:
                    # Clean up the temporary file before returning
                    if temp_file_path:
                        os.unlink(temp_file_path)
                        temp_file_path = None

                    # Return a direct response with the error
                    return JSONResponse(
                        status_code=413,  # Payload Too Large
                        content={
                            "detail": f"CV contains {page_count} pages, which exceeds our limit of {MAX_PDF_PAGES} pages. Please reduce the length of your CV and try again."}
                    )
            except Exception as e:
                # If there's an error counting pages, log it but continue processing
                logger.error(f"Error counting PDF pages: {str(e)}")

        # Process the CV file
        cv_info = process_cv(temp_file_path)

        # Return all extracted information directly
        return cv_info

    except Exception as e:
        # Return a properly formatted error
        return JSONResponse(
            status_code=500,
            content={"detail": f"Error processing request: {str(e)}"}
        )

    finally:
        # Always clean up the temporary file in a finally block
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.error(f"Error removing temporary file: {str(e)}")