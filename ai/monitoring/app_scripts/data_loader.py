import json
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy import func, case
from database import Session, EndpointMetrics, ModelMetrics, SystemMetrics


def load_data(time_range, start_date, end_date):
    """Load data from the database based on time range"""
    session = Session()

    try:
        # Calculate time filter
        if time_range == 'custom':
            start_date = datetime.strptime(start_date[:10], '%Y-%m-%d')
            end_date = datetime.strptime(end_date[:10], '%Y-%m-%d') + timedelta(days=1)
            time_filter = (EndpointMetrics.timestamp >= start_date) & (EndpointMetrics.timestamp <= end_date)
        else:
            hours = int(time_range)
            time_filter = EndpointMetrics.timestamp >= datetime.now() - timedelta(hours=hours)

        if time_range == '720':  # One month
            # For monthly view, group by day instead of hour
            endpoint_data = session.query(
                EndpointMetrics.endpoint,
                func.date_trunc('day', EndpointMetrics.timestamp).label('time_bucket'),
                func.avg(EndpointMetrics.response_time).label('avg_response_time'),
                func.count().label('request_count'),
                func.sum(case((EndpointMetrics.status_code >= 400, 1), else_=0)).label('error_count')
            ).filter(time_filter).group_by(
                EndpointMetrics.endpoint,
                func.date_trunc('day', EndpointMetrics.timestamp)
            ).all()
        else:
            # Endpoint metrics
            endpoint_data = session.query(
                EndpointMetrics.endpoint,
                func.date_trunc('hour', EndpointMetrics.timestamp).label(
                    'time_bucket'),
                func.avg(EndpointMetrics.response_time).label('avg_response_time'),
                func.count().label('request_count'),
                func.sum(case((EndpointMetrics.status_code >= 400, 1), else_=0)).label(
                    'error_count')
            ).filter(time_filter).group_by(
                EndpointMetrics.endpoint,
                func.date_trunc('hour', EndpointMetrics.timestamp)
            ).all()

        # Model metrics
        model_data = session.query(
            ModelMetrics.model_name,
            ModelMetrics.metric_name,
            ModelMetrics.metric_value,
            func.date_trunc('hour', ModelMetrics.timestamp).label(
                'time_bucket')
        ).filter(time_filter).all()

        # System metrics
        system_data = session.query(
            func.date_trunc('minute', SystemMetrics.timestamp).label(
                'time_bucket'),
            func.avg(SystemMetrics.cpu_usage).label('avg_cpu'),
            func.avg(SystemMetrics.memory_usage).label('avg_memory')
        ).filter(time_filter).group_by(
            func.date_trunc('minute', SystemMetrics.timestamp)
        ).order_by('time_bucket').all()

        # Convert to DataFrames
        endpoint_df = pd.DataFrame([{
            'endpoint': d.endpoint,
            'time_bucket': d.time_bucket,
            'avg_response_time': d.avg_response_time,
            'request_count': d.request_count,
            'error_rate': d.error_count / d.request_count if d.request_count > 0 else 0
        } for d in endpoint_data])

        model_df = pd.DataFrame([{
            'model_name': d.model_name,
            'metric_name': d.metric_name,
            'metric_value': d.metric_value,
            'time_bucket': d.time_bucket
        } for d in model_data])

        system_df = pd.DataFrame([{
            'time_bucket': d.time_bucket,
            'cpu_usage': d.avg_cpu,
            'memory_usage': d.avg_memory
        } for d in system_data])

        # Calculate summary stats
        total_requests = endpoint_df['request_count'].sum(
        ) if not endpoint_df.empty else 0
        if not endpoint_df.empty and total_requests > 0:
            total_errors = (endpoint_df['request_count']
                            * endpoint_df['error_rate']).sum()
            total_error_rate = total_errors / total_requests
        else:
            total_error_rate = 0

        # Create a JSON-serializable dictionary
        data = {
            'endpoints': endpoint_df.to_json(date_format='iso', orient='split'),
            'models': model_df.to_json(date_format='iso', orient='split'),
            'system': system_df.to_json(date_format='iso', orient='split'),
            'total_requests': int(total_requests),
            'error_rate': float(total_error_rate)
        }

        # Return as JSON string
        return json.dumps(data)

    except Exception as e:
        print(f"Error loading data: {e}")
        return json.dumps({})
    finally:
        session.close()