import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.express as px
import pandas as pd
from sqlalchemy import create_engine, func
from datetime import datetime, timedelta
from database import get_database_url

# Initialize Dash app
app = dash.Dash(__name__, title="RGT API Monitoring")

# Database connection
engine = create_engine(get_database_url())

app.layout = html.Div([
    html.H1("RGT API Monitoring Dashboard"),

    dcc.Tabs([
        dcc.Tab(label='API Performance', children=[
            html.Div([
                dcc.Dropdown(
                    id='endpoint-selector',
                    options=[
                        {'label': 'Attrition', 'value': '/attrition/predict'},
                        {'label': 'CV Screening', 'value': '/cv/analyze'},
                        {'label': 'Scoring', 'value': '/scoring/score'},
                        # Add your other endpoints
                    ],
                    multi=True,
                    value=['/attrition/predict']
                ),
                dcc.Graph(id='response-time-graph'),
                dcc.Interval(
                    id='interval-component',
                    interval=60*1000,  # Update every minute
                    n_intervals=0
                )
            ])
        ]),

        dcc.Tab(label='Model Metrics', children=[
            html.Div([
                dcc.Dropdown(
                    id='model-selector',
                    options=[
                        {'label': 'Attrition Model', 'value': 'attrition_model'},
                        {'label': 'CV Model', 'value': 'cv_model'},
                        {'label': 'Scoring Model', 'value': 'scoring_model'},
                        # Add your other models
                    ],
                    value='attrition_model'
                ),
                dcc.Graph(id='model-metrics-graph'),
                dcc.Interval(
                    id='model-interval',
                    interval=60*1000,
                    n_intervals=0
                )
            ])
        ]),

        dcc.Tab(label='System Health', children=[
            dcc.Graph(id='system-metrics-graph'),
            dcc.Interval(
                id='system-interval',
                interval=60*1000,
                n_intervals=0
            )
        ])
    ])
])

# Callbacks


@app.callback(
    Output('response-time-graph', 'figure'),
    [Input('interval-component', 'n_intervals'),
     Input('endpoint-selector', 'value')]
)
def update_api_metrics(n, endpoints):
    if not endpoints:
        return px.line(title="Select endpoints to view data")

    query = f"""
    SELECT 
        endpoint,
        date_trunc('hour', timestamp) as hour,
        AVG(response_time) as avg_response_time,
        COUNT(*) as request_count,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count
    FROM endpoint_metrics
    WHERE endpoint IN ({','.join([f"'{ep}'" for ep in endpoints])})
    AND timestamp > NOW() - INTERVAL '24 hours'
    GROUP BY endpoint, hour
    ORDER BY hour
    """

    df = pd.read_sql(query, engine)

    if df.empty:
        return px.line(title="No data available for selected endpoints")

    fig = px.line(df, x='hour', y='avg_response_time',
                  color='endpoint', title='Average Response Time (ms)')
    fig.update_layout(yaxis_title="Response Time (ms)")
    return fig


@app.callback(
    Output('model-metrics-graph', 'figure'),
    [Input('model-interval', 'n_intervals'),
     Input('model-selector', 'value')]
)
def update_model_metrics(n, model_name):
    query = f"""
    SELECT 
        metric_name,
        timestamp,
        metric_value
    FROM model_metrics
    WHERE model_name = '{model_name}'
    AND timestamp > NOW() - INTERVAL '7 days'
    ORDER BY timestamp
    """

    df = pd.read_sql(query, engine)

    if df.empty:
        return px.line(title=f"No data available for {model_name}")

    fig = px.line(df, x='timestamp', y='metric_value',
                  color='metric_name', title=f"{model_name} Performance")
    return fig


@app.callback(
    Output('system-metrics-graph', 'figure'),
    [Input('system-interval', 'n_intervals')]
)
def update_system_metrics(n):
    query = """
    SELECT 
        timestamp,
        cpu_usage,
        memory_usage
    FROM system_metrics
    WHERE timestamp > NOW() - INTERVAL '1 hour'
    ORDER BY timestamp
    """

    df = pd.read_sql(query, engine)

    if df.empty:
        return px.line(title="No system metrics available")

    fig = px.line(df, x='timestamp', y=['cpu_usage', 'memory_usage'],
                  title='System Resource Usage')
    fig.update_layout(yaxis_title="Percentage Usage")
    return fig


if __name__ == '__main__':
    app.run_server(port=8050)
