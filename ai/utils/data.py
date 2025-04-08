import json
import pandas as pd
import os
from datetime import datetime, date, time
from decimal import Decimal
from typing import List, Dict, Any

class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for handling datetime objects"""
    def default(self, obj):
        if isinstance(obj, (datetime, date, time)):
            return obj.isoformat()
        return super().default(obj)

class DecimalEncoder(json.JSONEncoder):
    """Custom JSON encoder for handling Decimal and datetime types"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # Convert Decimal to float for JSON serialization
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()  # Convert datetime/date objects to ISO format string
        return super(DecimalEncoder, self).default(obj)


def clean_nan_values(obj):
    """Replace NaN values with None for JSON serialization"""
    if isinstance(obj, dict):
        return {k: clean_nan_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, float) and pd.isna(obj):
        return None
    else:
        return obj

def load_jobs_data(file_path: str) -> List[Dict]:
    """Load jobs data from file and clean NaN values"""
    ext = os.path.splitext(file_path)[1].lower()

    try:
        data = None
        if ext == '.csv':
            df = pd.read_csv(file_path)
            data = df.to_dict('records')
        elif ext == '.json':
            with open(file_path, 'r') as f:
                data = json.load(f)
        elif ext in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path)
            data = df.to_dict('records')
        else:
            raise ValueError(f"Unsupported file format: {ext}")
        
        # Clean NaN values from the data
        return clean_nan_values(data)
    except Exception as e:
        raise Exception(f"Error loading jobs data: {str(e)}")
    
