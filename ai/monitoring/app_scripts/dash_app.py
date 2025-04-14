from callbacks import register_callbacks
from layouts import create_layout
import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import sys
import os

# Enable better path resolution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Initialize the Dash app with dark theme
app = dash.Dash(
    __name__, 
    external_stylesheets=[dbc.themes.DARKLY],
    # Disable callback exceptions in production
    suppress_callback_exceptions=False
)
app.title = "API Metrics Dashboard"

# Set up the app layout
app.layout = create_layout()

# Register all callbacks
register_callbacks(app)

# Get server for WSGI deployment
server = app.server

if __name__ == '__main__':
    # Production mode configuration
    host = os.environ.get("HOST", "0.0.0.0")  # Default to all interfaces for production
    port = int(os.environ.get("PORT", 10000))  # Default to PORT 10000 for production
    
    print(f"Starting production server on {host}:{port}")
    app.run(
        debug=False,             # Disable debug mode for production
        dev_tools_hot_reload=False, # Disable hot reloading
        dev_tools_ui=False,      # Hide dev tools UI
        host=host, 
        port=port
    )
