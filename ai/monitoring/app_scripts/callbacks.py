from dash import Input, Output, callback
import json
import pandas as pd
from io import StringIO
import dash_bootstrap_components as dbc
import psutil

# Import dashboard components
from live_metrics import update_live_metrics
from data_loader import load_data
from tab_renderers import (
    render_endpoint_tab,
    render_model_tab,
    render_system_tab,
    render_anomaly_tab
)


def register_callbacks(app):
    """Register all callbacks with the app"""

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
    def update_live_metrics_callback(n):
        return update_live_metrics()

    # Callback to load and cache data
    @app.callback(
        Output('intermediate-data', 'children'),
        [Input('time-range', 'value'),
         Input('custom-date-range', 'start_date'),
         Input('custom-date-range', 'end_date'),
         Input('data-refresh', 'n_intervals')]
    )
    def load_data_callback(time_range, start_date, end_date, n):
        return load_data(time_range, start_date, end_date)

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
