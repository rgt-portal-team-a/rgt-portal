import psutil
import plotly.graph_objs as go
from constants import colors


def update_live_metrics():
    """Get real-time system metrics and create gauge charts"""
    cpu = psutil.cpu_percent()
    memory = psutil.virtual_memory().percent

    # CPU gauge
    cpu_gauge = go.Figure(go.Indicator(
        mode="gauge+number",
        value=cpu,
        domain={'x': [0, 1], 'y': [0, 1]},
        gauge={
            'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': colors['text']},
            'bar': {'color': colors['primary']},
            'steps': [
                {'range': [0, 50], 'color': colors['tertiary']},
                {'range': [50, 80], 'color': colors['warning']},
                {'range': [80, 100], 'color': colors['secondary']}
            ]
        }
    ))
    cpu_gauge.update_layout(
        margin=dict(l=20, r=20, t=30, b=20),
        paper_bgcolor='rgba(0,0,0,0)',
        font={'color': colors['text']}
    )

    # Memory gauge
    memory_gauge = go.Figure(go.Indicator(
        mode="gauge+number",
        value=memory,
        domain={'x': [0, 1], 'y': [0, 1]},
        gauge={
            'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': colors['text']},
            'bar': {'color': colors['secondary']},
            'steps': [
                {'range': [0, 50], 'color': colors['tertiary']},
                {'range': [50, 80], 'color': colors['warning']},
                {'range': [80, 100], 'color': colors['secondary']}
            ]
        }
    ))
    memory_gauge.update_layout(
        margin=dict(l=20, r=20, t=30, b=20),
        paper_bgcolor='rgba(0,0,0,0)',
        font={'color': colors['text']}
    )

    return f"{cpu}%", f"{memory}%", cpu_gauge, memory_gauge
