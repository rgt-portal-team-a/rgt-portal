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

# Get server for WSGI deployment
server = app.server

if __name__ == '__main__':
    # Get host and port from environment variables or use defaults
    host = os.environ.get("HOST", "0.0.0.0")  # Default to all interfaces
    port = int(os.environ.get("PORT", 10000))  # Default to port 10000
    
    print(f"Starting server on {host}:{port}")
    app.run(debug=False, host=host, port=port)
