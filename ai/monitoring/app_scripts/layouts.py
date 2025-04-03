from dash import dcc, html
import dash_bootstrap_components as dbc
from datetime import datetime, timedelta
from constants import colors


def create_layout():
    """Create the main layout of the application"""
    return dbc.Container([
        dbc.Row([
            dbc.Col(html.H1("API Performance Dashboard",
                    className="text-center mb-4"), width=12)
        ]),

        # System Overview Cards
        create_system_cards(),

        # Time range selector
        create_time_selector(),

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


def create_system_cards():
    """Create the system overview cards section"""
    return dbc.Row([
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
    ], className="mb-4")


def create_time_selector():
    """Create the time range selector component"""
    return dbc.Row([
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
    ])
