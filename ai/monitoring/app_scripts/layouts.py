from dash import dcc, html
import dash_bootstrap_components as dbc
from datetime import datetime, timedelta

# Colors from the Really Great Tech website
colors = {
    'primary': '#452764',  # Deep purple background
    'secondary': '#FF6B6B',  # Pinkish accent
    'accent': '#FF9E64',  # Orange accent
    'text': '#FFFFFF',  # White text
    'dark': '#1A1A1A',  # Black/dark elements
    'card_bg': '#5A3A7E',  # Lighter purple for cards
    'highlight': '#F06292',  # Pink highlight
    'gradient_start': '#452764',
    'gradient_end': '#E91E63'
}


def create_layout():
    """Create the main layout of the application"""
    return dbc.Container([
        # Header with logo-inspired styling
        dbc.Row([
            dbc.Col([
                html.Div([
                    html.H1("API Performance Dashboard",
                            className="display-4 fw-bold"),
                    html.P(
                        "Stay updated with real-time metrics and insights", className="lead")
                ], style={
                    'paddingTop': '20px',
                    'paddingBottom': '20px',
                    'borderRadius': '8px',
                    'marginBottom': '30px'
                })
            ], width=12)
        ], className="mb-4", style={'color': colors['text']}),

        # System Overview Cards with gradient styling
        create_system_cards(),

        # Time range selector with improved styling
        create_time_selector(),

        # Tabs with website's color scheme
        dbc.Tabs([
            dbc.Tab(label="Endpoint Metrics", tab_id="endpoint-tab"),
            dbc.Tab(label="Model Performance", tab_id="model-tab"),
            dbc.Tab(label="System Metrics", tab_id="system-tab"),
            dbc.Tab(label="Anomaly Detection", tab_id="anomaly-tab")
        ], id="tabs", active_tab="endpoint-tab", className="mb-4", style={
            'borderRadius': '8px',
            'overflow': 'hidden'
        }),

        # Tab content
        html.Div(id="tab-content", style={
            'padding': '20px',
            'backgroundColor': colors['card_bg'],
            'borderRadius': '8px',
            'color': colors['text']
        }),

        # Footer with website-inspired styling
        dbc.Row([
            dbc.Col(html.P("© " + str(datetime.now().year) + " | Dashboard Analytics",
                           className="text-center text-muted mt-4"),
                    width=12)
        ]),

        # Interval components for live updates
        dcc.Interval(id='live-update', interval=10*1000, n_intervals=0),
        dcc.Interval(id='data-refresh', interval=60*1000, n_intervals=0),

        # Hidden div for storing intermediate data
        html.Div(id='intermediate-data', style={'display': 'none'})
    ], fluid=True, style={
        'backgroundColor': colors['primary'],
        'minHeight': '100vh',
        'padding': '20px',
        'color': colors['text']
    })


def create_system_cards():
    """Create the system overview cards section with gradient styling"""
    return dbc.Row([
        dbc.Col(dbc.Card([
            dbc.CardHeader("Live CPU Usage", className="text-center fw-bold"),
            dbc.CardBody([
                html.H2("0%", id="live-cpu", className="text-center"),
                dcc.Graph(
                    id='cpu-gauge', config={'displayModeBar': False}, style={'height': '100px'})
            ])
        ], style={
            'backgroundColor': colors['card_bg'],
            'borderLeft': f'4px solid {colors["secondary"]}',
            'color': colors['text'],
            'borderRadius': '8px',
            'boxShadow': '0 4px 8px rgba(0,0,0,0.2)'
        }), width=4),

        dbc.Col(dbc.Card([
            dbc.CardHeader("Live Memory Usage",
                           className="text-center fw-bold"),
            dbc.CardBody([
                html.H2("0%", id="live-memory", className="text-center"),
                dcc.Graph(
                    id='memory-gauge', config={'displayModeBar': False}, style={'height': '100px'})
            ])
        ], style={
            'backgroundColor': colors['card_bg'],
            'borderLeft': f'4px solid {colors["accent"]}',
            'color': colors['text'],
            'borderRadius': '8px',
            'boxShadow': '0 4px 8px rgba(0,0,0,0.2)'
        }), width=4),

        dbc.Col(dbc.Card([
            dbc.CardHeader("Total Requests (24h)",
                           className="text-center fw-bold"),
            dbc.CardBody([
                html.H2("0", id="total-requests", className="text-center"),
                html.P("0% errors", id="error-rate",
                       className="text-center mb-0"),
                html.Div(style={
                    'height': '75px',
                    'display': 'flex',
                    'alignItems': 'center',
                    'justifyContent': 'center'
                })

            ])
        ], style={
            'backgroundColor': colors['card_bg'],
            'borderLeft': f'4px solid {colors["highlight"]}',
            'color': colors['text'],
            'borderRadius': '8px',
            'boxShadow': '0 4px 8px rgba(0,0,0,0.2)'
        }), width=4)
    ], className="mb-4")


def create_time_selector():
    """Create the time range selector component with improved styling and visibility"""
    return dbc.Row([
        dbc.Col([
            html.Div([
                html.Label("Select Time Range:", className="mb-2 fw-bold",
                           style={'color': colors['text']}),
                dcc.Dropdown(
                    id='time-range',
                    options=[
                        {'label': 'Last 1 hour', 'value': '1'},
                        {'label': 'Last 6 hours', 'value': '6'},
                        {'label': 'Last 24 hours', 'value': '24'},
                        {'label': 'Last 7 days', 'value': '168'},
                        {'label': 'Last Month', 'value': '720'},
                        {'label': 'Custom', 'value': 'custom'}
                    ],
                    value='24',
                    clearable=False,
                    className="mb-3",
                    style={
                        'borderRadius': '6px',
                        'color': '#000000',  
                    },
                    # Styling for the dropdown menu
                    optionHeight=50,
                ),
                dcc.DatePickerRange(
                    id='custom-date-range',
                    start_date=datetime.now() - timedelta(days=1),
                    end_date=datetime.now(),
                    display_format='YYYY-MM-DD',
                    className="mb-3",
                    style={'display': 'none'}
                )
            ], style={
                'backgroundColor': colors['card_bg'],
                'padding': '20px',
                'borderRadius': '8px',
                'marginBottom': '20px',
                'boxShadow': '0 4px 8px rgba(0,0,0,0.2)'
            })
        ], width=12)
    ])


# Add custom styling for our components
def get_custom_styles():
    """Return a dictionary of custom styles for various dashboard components"""
    return {
        'gauge_config': {
            'plotBackground': colors['card_bg'],
            'paper_bgcolor': colors['card_bg'],
            'font': {'color': colors['text']},
            'gauge': {
                'axis': {'range': [None, 100], 'tickcolor': colors['text']},
                'bar': {'color': colors['secondary']},
                'bgcolor': colors['dark'],
                'bordercolor': colors['text']
            }
        },
        'graph_config': {
            'layout': {
                'plot_bgcolor': colors['card_bg'],
                'paper_bgcolor': colors['card_bg'],
                'font': {'color': colors['text']},
                'xaxis': {'gridcolor': 'rgba(255,255,255,0.1)'},
                'yaxis': {'gridcolor': 'rgba(255,255,255,0.1)'},
                'colorway': [colors['secondary'], colors['highlight'], colors['accent']]
            }
        },
        'tab_selected_style': {
            'backgroundColor': colors['card_bg'],
            'color': colors['text'],
            'fontWeight': 'bold',
            'borderTop': f'3px solid {colors["highlight"]}'
        },
        'tab_style': {
            'backgroundColor': colors['primary'],
            'color': colors['text'],
            'borderColor': colors['dark']
        }
    }

