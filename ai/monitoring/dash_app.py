import dash
from dash import dcc, html, Input, Output, callback
import plotly.graph_objs as go
import plotly.express as px
from datetime import datetime, timedelta
import dash_bootstrap_components as dbc
from sqlalchemy import func, case
from database import Session, EndpointMetrics, ModelMetrics, SystemMetrics
import pandas as pd
import psutil
import sys
import os
import json
from io import StringIO


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Initialize the Dash app with dark theme
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.DARKLY])
app.title = "API Metrics Dashboard"

# Custom color palette
colors = {
    'background': '#222',
    'text': '#fff',
    'primary': '#636EFA',
    'secondary': '#EF553B',
    'tertiary': '#00CC96',
    'quaternary': '#AB63FA',
    'warning': '#FFA15A'
}

# Layout of the dashboard
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(html.H1("API Performance Dashboard",
                className="text-center mb-4"), width=12)
    ]),

    # System Overview Cards
    dbc.Row([
        dbc.Col(dbc.Card([
            dbc.CardHeader("Live CPU Usage", className="text-center"),
            dbc.CardBody([
                html.H2("0%", id="live-cpu", className="text-center"),
                dcc.Graph(
                    id='cpu-gauge', config={'displayModeBar': False}, style={'height': '100px'})
            ])
        ], color="primary", inverse=True), width=4),

        dbc.Col(dbc.Card([
            dbc.CardHeader("Live Memory Usage", className="text-center"),
            dbc.CardBody([
                html.H2("0%", id="live-memory", className="text-center"),
                dcc.Graph(
                    id='memory-gauge', config={'displayModeBar': False}, style={'height': '100px'})
            ])
        ], color="secondary", inverse=True), width=4),

        dbc.Col(dbc.Card([
            dbc.CardHeader("Total Requests (24h)", className="text-center"),
            dbc.CardBody([
                html.H2("0", id="total-requests", className="text-center"),
                html.P("0% errors", id="error-rate",
                       className="text-center mb-0")
            ])
        ], color="tertiary", inverse=True), width=4)
    ], className="mb-4"),

    # Time range selector
    dbc.Row([
        dbc.Col([
            html.Label("Select Time Range:", className="mb-2"),
            dcc.Dropdown(
                id='time-range',
                options=[
                    {'label': 'Last 1 hour', 'value': '1'},
                    {'label': 'Last 6 hours', 'value': '6'},
                    {'label': 'Last 24 hours', 'value': '24'},
                    {'label': 'Last 7 days', 'value': '168'},
                    {'label': 'Custom', 'value': 'custom'}
                ],
                value='24',
                clearable=False,
                className="mb-3"
            ),
            dcc.DatePickerRange(
                id='custom-date-range',
                start_date=datetime.now() - timedelta(days=1),
                end_date=datetime.now(),
                display_format='YYYY-MM-DD',
                className="mb-3",
                style={'display': 'none'}
            )
        ], width=12)
    ]),

    # Tabs for different metric categories
    dbc.Tabs([
        dbc.Tab(label="Endpoint Metrics", tab_id="endpoint-tab"),
        dbc.Tab(label="Model Performance", tab_id="model-tab"),
        dbc.Tab(label="System Metrics", tab_id="system-tab"),
        dbc.Tab(label="Anomaly Detection", tab_id="anomaly-tab")
    ], id="tabs", active_tab="endpoint-tab", className="mb-4"),

    # Tab content
    html.Div(id="tab-content"),

    # Interval components for live updates
    dcc.Interval(id='live-update', interval=10*1000, n_intervals=0),
    dcc.Interval(id='data-refresh', interval=60*1000, n_intervals=0),

    # Hidden div for storing intermediate data
    html.Div(id='intermediate-data', style={'display': 'none'})
], fluid=True, style={'backgroundColor': colors['background']})

# Callback to show/hide custom date range picker


@app.callback(
    Output('custom-date-range', 'style'),
    Input('time-range', 'value')
)
def show_custom_date_range(selected_range):
    if selected_range == 'custom':
        return {'display': 'block'}
    return {'display': 'none'}

# Callback to update live system metrics


@app.callback(
    [Output('live-cpu', 'children'),
     Output('live-memory', 'children'),
     Output('cpu-gauge', 'figure'),
     Output('memory-gauge', 'figure')],
    Input('live-update', 'n_intervals')
)
def update_live_metrics(n):
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

# Callback to load and cache data


@app.callback(
    Output('intermediate-data', 'children'),
    [Input('time-range', 'value'),
     Input('custom-date-range', 'start_date'),
     Input('custom-date-range', 'end_date'),
     Input('data-refresh', 'n_intervals')]
)
def load_data(time_range, start_date, end_date, n):
    session = Session()

    try:
        # Calculate time filter
        if time_range == 'custom':
            start_date = datetime.strptime(start_date[:10], '%Y-%m-%d')
            end_date = datetime.strptime(
                end_date[:10], '%Y-%m-%d') + timedelta(days=1)
            time_filter = (EndpointMetrics.timestamp >= start_date) & (
                EndpointMetrics.timestamp <= end_date)
        else:
            hours = int(time_range)
            time_filter = EndpointMetrics.timestamp >= datetime.now() - timedelta(hours=hours)

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
        total_requests = endpoint_df['request_count'].sum()
        total_errors = (endpoint_df['request_count']
                        * endpoint_df['error_rate']).sum()
        total_error_rate = total_errors / total_requests if total_requests > 0 else 0

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

# Update summary cards


@app.callback(
    [Output('total-requests', 'children'),
     Output('error-rate', 'children')],
    Input('intermediate-data', 'children')
)
def update_summary_cards(json_data):
    try:
        data = json.loads(json_data) if json_data else {}
        total_requests = data.get('total_requests', 0)
        error_rate = data.get('error_rate', 0)

        return f"{total_requests:,}", f"{error_rate:.1%} errors"
    except:
        return "0", "0% errors"

# Tab content callback


@app.callback(
    Output('tab-content', 'children'),
    [Input('tabs', 'active_tab'),
     Input('intermediate-data', 'children')]
)
def render_tab_content(active_tab, json_data):
    try:
        data = json.loads(json_data) if json_data else {}

        if not data:
            return dbc.Alert("No data available", color="warning")

        if active_tab == "endpoint-tab":
            return render_endpoint_tab(data)
        elif active_tab == "model-tab":
            return render_model_tab(data)
        elif active_tab == "system-tab":
            return render_system_tab(data)
        elif active_tab == "anomaly-tab":
            return render_anomaly_tab(data)
    except Exception as e:
        return dbc.Alert(f"Error rendering tab: {str(e)}", color="danger")


def render_endpoint_tab(data):
    try:
        endpoint_df = pd.read_json(StringIO(data['endpoints']), orient='split')

        if endpoint_df.empty:
            return dbc.Alert("No endpoint metrics available", color="warning")

        # Rest of your endpoint tab rendering code...
        # (Keep all the existing visualization code the same)

    except Exception as e:
        return dbc.Alert(f"Error rendering endpoint metrics: {str(e)}", color="danger")
    # Aggregate by endpoint
    endpoint_agg = endpoint_df.groupby('endpoint').agg({
        'avg_response_time': 'mean',
        'request_count': 'sum',
        'error_rate': 'mean'
    }).reset_index()

    # Time series data
    time_series = endpoint_df.groupby(['time_bucket', 'endpoint']).agg({
        'request_count': 'sum',
        'avg_response_time': 'mean'
    }).reset_index()

    # Create figures
    fig1 = px.bar(
        endpoint_agg.sort_values('request_count', ascending=False),
        x='endpoint', y='request_count',
        title='Total Requests by Endpoint',
        color='endpoint',
        color_discrete_sequence=px.colors.qualitative.Plotly
    )

    fig2 = px.bar(
        endpoint_agg.sort_values('avg_response_time', ascending=False),
        x='endpoint', y='avg_response_time',
        title='Average Response Time (ms) by Endpoint',
        color='endpoint',
        color_discrete_sequence=px.colors.qualitative.Plotly
    )

    fig3 = px.line(
        time_series,
        x='time_bucket', y='request_count',
        color='endpoint',
        title='Request Volume Over Time',
        markers=True
    )

    fig4 = px.line(
        time_series,
        x='time_bucket', y='avg_response_time',
        color='endpoint',
        title='Response Time Over Time',
        markers=True
    )

    # Update layout for all figures
    for fig in [fig1, fig2, fig3, fig4]:
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font={'color': colors['text']},
            xaxis={'showgrid': False},
            yaxis={'showgrid': True, 'gridcolor': '#444'},
            legend={'bgcolor': 'rgba(0,0,0,0)'}
        )

    return dbc.Row([
        dbc.Col(dcc.Graph(figure=fig1), md=6),
        dbc.Col(dcc.Graph(figure=fig2), md=6),
        dbc.Col(dcc.Graph(figure=fig3), md=6),
        dbc.Col(dcc.Graph(figure=fig4), md=6)
    ])


def render_model_tab(data):
    try:
        if not data or 'models' not in data:
            return dbc.Alert("No model metrics data received", color="warning")

        model_df = pd.read_json(StringIO(data['models']), orient='split')

        if model_df.empty:
            return dbc.Card([
                dbc.CardHeader("Model Performance Metrics",
                               className="text-center"),
                dbc.CardBody([
                    html.H4("No model metrics recorded yet",
                            className="text-center"),
                    html.P("Model metrics will appear here once your models start processing requests",
                           className="text-muted text-center"),
                    html.Img(src="https://via.placeholder.com/400x200?text=No+Model+Metrics+Yet",
                             className="img-fluid d-block mx-auto")
                ])
            ], className="my-4")

        # Get unique models and metrics
        models = model_df['model_name'].unique()
        metrics = model_df['metric_name'].unique()

        # Create tabs for each model
        model_tabs = []
        for model in models:
            model_data = model_df[model_df['model_name'] == model]

            # Create a card for each metric
            metric_cards = []
            for metric in metrics:
                metric_data = model_data[model_data['metric_name'] == metric]

                if not metric_data.empty:
                    fig = px.line(
                        metric_data,
                        x='time_bucket',
                        y='metric_value',
                        title=f"{metric} Over Time",
                        markers=True
                    )
                    fig.update_layout(
                        plot_bgcolor='rgba(0,0,0,0)',
                        paper_bgcolor='rgba(0,0,0,0)',
                        font={'color': colors['text']}
                    )

                    metric_cards.append(
                        dbc.Col(
                            dbc.Card([
                                dbc.CardHeader(
                                    metric, className="text-center"),
                                dbc.CardBody(dcc.Graph(figure=fig))
                            ], className="mb-4"),
                            md=6
                        )
                    )

            model_tabs.append(
                dbc.Tab(
                    dbc.Row(metric_cards),
                    label=model,
                    tab_id=f"model-{model}"
                )
            )

        return dbc.Tabs(model_tabs)

    except Exception as e:
        return dbc.Alert([
            html.H4("Error displaying model metrics",
                    className="alert-heading"),
            html.Hr(),
            html.P(f"Technical details: {str(e)}")
        ], color="danger")


def render_system_tab(data):
    try:
        system_df = pd.read_json(data['system'], orient='split')

        if system_df.empty:
            return dbc.Alert("No system metrics available", color="warning")

        # Create figures
        fig1 = px.line(
            system_df,
            x='time_bucket', y=['cpu_usage', 'memory_usage'],
            title='CPU and Memory Usage Over Time',
            labels={'value': 'Usage %', 'variable': 'Metric'},
            markers=True
        )

        fig2 = px.density_heatmap(
            system_df,
            x='time_bucket',
            y='cpu_usage',
            title='CPU Usage Heatmap',
            nbinsx=24,
            nbinsy=20
        )

        fig3 = px.density_heatmap(
            system_df,
            x='time_bucket',
            y='memory_usage',
            title='Memory Usage Heatmap',
            nbinsx=24,
            nbinsy=20
        )

        # Use regular scatter plot instead of statsmodels-dependent one
        fig4 = px.scatter(
            system_df,
            x='cpu_usage', y='memory_usage',
            title='CPU vs Memory Usage',
            trendline='ols'  # Using Plotly's built-in OLS trendline
        )

        # Update layout for all figures
        for fig in [fig1, fig2, fig3, fig4]:
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font={'color': colors['text']},
                xaxis={'showgrid': False},
                yaxis={'showgrid': True, 'gridcolor': '#444'},
                legend={'bgcolor': 'rgba(0,0,0,0)'}
            )

        return dbc.Row([
            dbc.Col(dcc.Graph(figure=fig1), width=12),
            dbc.Col(dcc.Graph(figure=fig2), md=6),
            dbc.Col(dcc.Graph(figure=fig3), md=6),
            dbc.Col(dcc.Graph(figure=fig4), width=12)
        ])

    except Exception as e:
        return dbc.Alert(f"Error rendering system metrics: {str(e)}", color="danger")


def render_anomaly_tab(data):
    return dbc.Row([
        dbc.Col([
            html.H4("Anomaly Detection", className="mb-3"),
            html.P(
                "This feature is under development and will detect unusual patterns in:"),
            html.Ul([
                html.Li("Response times"),
                html.Li("Error rates"),
                html.Li("System resource usage")
            ]),
            dbc.Alert(
                "Coming soon - machine learning based anomaly detection", color="info")
        ])
    ])


if __name__ == '__main__':
    app.run(debug=True, port=8050)
