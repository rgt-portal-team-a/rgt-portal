from callbacks import register_callbacks
from layouts import create_layout
import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import sys
import os

# Enable better path resolution for local development
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Initialize the Dash app with dark theme
app = dash.Dash(
    __name__, 
    external_stylesheets=[dbc.themes.DARKLY],
    # Development settings - suppress callback exceptions for easier debugging
    suppress_callback_exceptions=True
)
app.title = "API Metrics Dashboard"

# Set up the app layout
app.layout = create_layout()

# Register all callbacks
register_callbacks(app)

# Get server for WSGI deployment
server = app.server

if __name__ == '__main__':
    # Development mode configuration
    host = os.environ.get("HOST", "127.0.0.1")  # Default to localhost for development
    port = int(os.environ.get("PORT", 8050))    # Default to Dash's standard port
    
    print(f"Starting development server on {host}:{port}")
    print("Debug mode: ON")
    print("Hot reloading: ON")
    app.run(
        debug=True,               # Enable debug mode for development
        dev_tools_hot_reload=True, # Enable hot reloading
        dev_tools_ui=True,        # Show dev tools UI
        host=host, 
        port=port
    )