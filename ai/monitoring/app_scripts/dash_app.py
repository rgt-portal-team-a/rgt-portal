from callbacks import register_callbacks
from layouts import create_layout
import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import components

# Initialize the Dash app with dark theme
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.DARKLY])
app.title = "API Metrics Dashboard"

# Set up the app layout
app.layout = create_layout()

# Register all callbacks
register_callbacks(app)

if __name__ == '__main__':
    app.run(debug=True, port=8050)
