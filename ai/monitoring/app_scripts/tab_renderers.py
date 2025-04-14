import pandas as pd
import plotly.express as px
import dash_bootstrap_components as dbc
from dash import html, dcc
from io import StringIO
from constants import colors


def render_endpoint_tab(data):
    """Render the content for the Endpoint Metrics tab"""
    try:
        # Import colors here to ensure they're available
        from constants import colors
        
        endpoint_df = pd.read_json(StringIO(data['endpoints']), orient='split')

        if endpoint_df.empty:
            return dbc.Alert("No endpoint metrics available", color="warning")

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

        # Create a summary table with key metrics for each endpoint
        summary_data = endpoint_agg.copy()
        summary_data['avg_response_time'] = summary_data['avg_response_time'].round(2)
        summary_data['error_rate'] = (summary_data['error_rate'] * 100).round(2).astype(str) + '%'
        
        summary_table = dbc.Table.from_dataframe(
            summary_data, 
            striped=True, 
            bordered=True,
            hover=True,
            responsive=True,
            className="table-dark"
        )

        # Card background style - use a safe fallback if card_bg isn't available
        card_bg_color = colors.get('card_bg', '#5A3A7E')  # Use default if key doesn't exist
        text_color = colors.get('text', '#FFFFFF')
        secondary_color = colors.get('secondary', '#FF6B6B')
        accent_color = colors.get('accent', '#FF9E64')
        highlight_color = colors.get('highlight', '#F06292')
        primary_color = colors.get('primary', '#452764')

        # Create a well-organized layout with visual separation
        return dbc.Container([
            # Top row - Summary stats card (optional)
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader([
                            html.I(className="fas fa-chart-line me-2"),
                            "Endpoint Performance Overview"
                        ], className="d-flex align-items-center fw-bold"),
                        dbc.CardBody([
                            dbc.Row([
                                dbc.Col([
                                    html.H4(f"{len(endpoint_agg)} Active Endpoints"),
                                    html.P(f"Total Requests: {endpoint_agg['request_count'].sum():,}")
                                ], md=4),
                                dbc.Col([
                                    html.H4(f"{endpoint_agg['avg_response_time'].mean():.2f}ms"),
                                    html.P("Average Response Time")
                                ], md=4),
                                dbc.Col([
                                    html.H4(f"{(endpoint_agg['error_rate'].mean() * 100):.2f}%"),
                                    html.P("Overall Error Rate")
                                ], md=4)
                            ])
                        ])
                    ], style={
                        'backgroundColor': card_bg_color,
                        'color': text_color,
                        'borderRadius': '8px',
                        'boxShadow': '0 4px 8px rgba(0,0,0,0.2)',
                        'marginBottom': '20px'
                    })
                ], width=12)
            ]),
            
            # First section - Summary charts
            dbc.Row([
                dbc.Col([
                    html.H4("Endpoint Summary Statistics", className="section-header", 
                            style={
                                'color': text_color,
                                'marginBottom': '15px',
                                'paddingLeft': '10px',
                                'borderLeft': f'4px solid {secondary_color}',
                            })
                ], width=12)
            ], style={'marginTop': '10px', 'marginBottom': '15px'}),
            
            # Charts in cards - First row
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("Total Requests by Endpoint", className="fw-bold"),
                        dbc.CardBody(dcc.Graph(figure=fig1))
                    ], style={
                        'backgroundColor': card_bg_color,
                        'color': text_color,
                        'borderRadius': '8px',
                        'boxShadow': '0 4px 8px rgba(0,0,0,0.2)',
                        'height': '100%'
                    })
                ], md=6),
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("Average Response Time by Endpoint (ms)", className="fw-bold"),
                        dbc.CardBody(dcc.Graph(figure=fig2))
                    ], style={
                        'backgroundColor': card_bg_color,
                        'color': text_color,
                        'borderRadius': '8px',
                        'boxShadow': '0 4px 8px rgba(0,0,0,0.2)',
                        'height': '100%'
                    })
                ], md=6)
            ], className="mb-4"),
            
            # Divider
            dbc.Row([
                dbc.Col([
                    html.Div([
                        html.Hr(style={'backgroundColor': accent_color, 'opacity': '0.5'}),
                        html.Div([
                            html.I(className="fas fa-clock me-2"),
                            html.Span("Time-Based Analysis", className="fw-bold")
                        ], style={
                            'position': 'absolute',
                            'top': '-12px',
                            'left': '50%',
                            'transform': 'translateX(-50%)',
                            'backgroundColor': primary_color,
                            'padding': '0 20px',
                            'color': text_color
                        })
                    ], style={'position': 'relative', 'margin': '30px 0'})
                ], width=12)
            ]),
            
            # Charts in cards - Second row
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("Request Volume Over Time", className="fw-bold"),
                        dbc.CardBody(dcc.Graph(figure=fig3))
                    ], style={
                        'backgroundColor': card_bg_color,
                        'color': text_color,
                        'borderRadius': '8px',
                        'boxShadow': '0 4px 8px rgba(0,0,0,0.2)',
                        'height': '100%'
                    })
                ], md=6),
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader("Response Time Over Time (ms)", className="fw-bold"),
                        dbc.CardBody(dcc.Graph(figure=fig4))
                    ], style={
                        'backgroundColor': card_bg_color,
                        'color': text_color,
                        'borderRadius': '8px',
                        'boxShadow': '0 4px 8px rgba(0,0,0,0.2)',
                        'height': '100%'
                    })
                ], md=6)
            ], className="mb-4"),
            
            # Endpoint details table section
            dbc.Row([
                dbc.Col([
                    html.Div([
                        html.Hr(style={'backgroundColor': highlight_color, 'opacity': '0.5'}),
                        html.Div([
                            html.I(className="fas fa-table me-2"),
                            html.Span("Detailed Metrics", className="fw-bold")
                        ], style={
                            'position': 'absolute',
                            'top': '-12px',
                            'left': '50%',
                            'transform': 'translateX(-50%)',
                            'backgroundColor': primary_color,
                            'padding': '0 20px',
                            'color': text_color
                        })
                    ], style={'position': 'relative', 'margin': '30px 0'})
                ], width=12)
            ]),
            
            # Table section
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader([
                            html.I(className="fas fa-table me-2"),
                            "Endpoint Performance Details"
                        ], className="d-flex align-items-center fw-bold"),
                        dbc.CardBody([
                            summary_table
                        ])
                    ], style={
                        'backgroundColor': card_bg_color,
                        'color': text_color,
                        'borderRadius': '8px',
                        'boxShadow': '0 4px 8px rgba(0,0,0,0.2)'
                    })
                ], width=12)
            ], className="mb-4")
        ], fluid=True)

    except Exception as e:
        return dbc.Alert(f"Error rendering endpoint metrics: {str(e)}", color="danger")

def render_model_tab(data):
    """Render the content for the Model Performance tab with improved styling"""
    try:
        # Import colors here to ensure they're available
        from constants import colors
        
        if not data or 'models' not in data:
            return dbc.Alert("No model metrics data received", color="warning")

        model_df = pd.read_json(StringIO(data['models']), orient='split')

        if model_df.empty:
            return dbc.Card([
                dbc.CardHeader("Model Performance Metrics", className="fw-bold"),
                dbc.CardBody([
                    html.H4("No model metrics recorded yet", className="text-center"),
                    html.P("Model metrics will appear here once your models start processing requests", 
                           className="text-muted text-center"),
                    html.Img(src="https://via.placeholder.com/400x200?text=No+Model+Metrics+Yet",
                             className="img-fluid d-block mx-auto")
                ])
            ], style={
                'backgroundColor': colors.get('card_bg', '#5A3A7E'),
                'color': colors.get('text', '#FFFFFF'),
                'borderRadius': '8px',
                'boxShadow': '0 4px 8px rgba(0,0,0,0.2)',
                'marginBottom': '20px'
            })

        # Get unique models and metrics
        models = model_df['model_name'].unique()
        metrics = model_df['metric_name'].unique()
        
        # Get color references for consistent styling
        card_bg_color = colors.get('card_bg', '#5A3A7E')
        text_color = colors.get('text', '#FFFFFF')
        secondary_color = colors.get('secondary', '#FF6B6B')
        accent_color = colors.get('accent', '#FF9E64')
        primary_color = colors.get('primary', '#452764')

        # Create tabs for each model
        model_tabs = []
        for model in models:
            model_data = model_df[model_df['model_name'] == model]
            
            # Create rows of metric cards (2 per row)
            metric_rows = []
            current_row = []
            
            for i, metric in enumerate(metrics):
                metric_data = model_data[model_data['metric_name'] == metric]

                if not metric_data.empty:
                    fig = px.line(
                        metric_data,
                        x='time_bucket',
                        y='metric_value',
                        title=f"{metric} Over Time",
                        markers=True,
                        color_discrete_sequence=[secondary_color]
                    )
                    
                    # Update layout to match endpoint tab styling
                    fig.update_layout(
                        plot_bgcolor='rgba(0,0,0,0)',
                        paper_bgcolor='rgba(0,0,0,0)',
                        font={'color': text_color},
                        xaxis={'showgrid': False},
                        yaxis={'showgrid': True, 'gridcolor': '#444'},
                        legend={'bgcolor': 'rgba(0,0,0,0)'},
                        margin=dict(l=40, r=40, t=60, b=40)
                    )

                    card = dbc.Col([
                        dbc.Card([
                            dbc.CardHeader(metric, className="fw-bold"),
                            dbc.CardBody(dcc.Graph(figure=fig))
                        ], style={
                            'backgroundColor': card_bg_color,
                            'color': text_color,
                            'borderRadius': '8px',
                            'boxShadow': '0 4px 8px rgba(0,0,0,0.2)',
                            'height': '100%',
                            'marginBottom': '20px'
                        })
                    ], md=6)
                    
                    current_row.append(card)
                    
                    # Create a new row after every 2 cards or at the end
                    if len(current_row) == 2 or i == len(metrics) - 1:
                        # If we have an odd number of metrics at the end, ensure proper layout
                        if len(current_row) == 1:
                            current_row.append(dbc.Col(md=6))  # Empty column for balance
                            
                        metric_rows.append(dbc.Row(current_row, className="mb-4"))
                        current_row = []
            
            # Add a divider and summary section if we have metrics
            if metric_rows:
                # Add divider
                divider_row = dbc.Row([
                    dbc.Col([
                        html.Div([
                            html.Hr(style={'backgroundColor': accent_color, 'opacity': '0.5'}),
                            html.Div([
                                html.I(className="fas fa-chart-line me-2"),
                                html.Span("Model Analysis Summary", className="fw-bold")
                            ], style={
                                'position': 'absolute',
                                'top': '-12px',
                                'left': '50%',
                                'transform': 'translateX(-50%)',
                                'backgroundColor': primary_color,
                                'padding': '0 20px',
                                'color': text_color
                            })
                        ], style={'position': 'relative', 'margin': '30px 0'})
                    ], width=12)
                ])
                metric_rows.append(divider_row)
                
                # Add a summary card at the bottom (similar to endpoint table)
                summary_stats = model_data.groupby('metric_name')['metric_value'].agg(['mean', 'min', 'max']).reset_index()
                summary_stats = summary_stats.round(3)
                
                summary_table = dbc.Table.from_dataframe(
                    summary_stats, 
                    striped=True, 
                    bordered=True,
                    hover=True,
                    responsive=True,
                    className="table-dark"
                )
                
                summary_row = dbc.Row([
                    dbc.Col([
                        dbc.Card([
                            dbc.CardHeader([
                                html.I(className="fas fa-table me-2"),
                                f"{model} - Summary Statistics"
                            ], className="d-flex align-items-center fw-bold"),
                            dbc.CardBody(summary_table)
                        ], style={
                            'backgroundColor': card_bg_color,
                            'color': text_color,
                            'borderRadius': '8px',
                            'boxShadow': '0 4px 8px rgba(0,0,0,0.2)'
                        })
                    ], width=12)
                ], className="mb-4")
                metric_rows.append(summary_row)
            
            # Combine all rows into a container for this model tab
            model_content = html.Div(children=[
                # Top section header
                dbc.Row([
                    dbc.Col([
                        dbc.Card([
                            dbc.CardHeader([
                                html.I(className="fas fa-brain me-2"),
                                f"Model: {model} - Performance Overview"
                            ], className="d-flex align-items-center fw-bold"),
                            dbc.CardBody([
                                html.H5(f"Analyzing {len(metrics)} metrics for {model}"),
                                html.P("View detailed performance data below")
                            ])
                        ], style={
                            'backgroundColor': card_bg_color,
                            'color': text_color,
                            'borderRadius': '8px',
                            'boxShadow': '0 4px 8px rgba(0,0,0,0.2)',
                            'marginBottom': '20px'
                        })
                    ], width=12)
                ]),
                # Metric charts - add all rows to the container
                *metric_rows
            ])
                
            # Create the tab for this model
            model_tabs.append(
                dbc.Tab(
                    model_content,
                    label=model,
                    tab_id=f"model-{model}",
                    label_style={
                        'color': text_color,
                        'fontWeight': 'bold'
                    },
                    active_label_style={
                        'backgroundColor': accent_color,
                        'borderColor': accent_color,
                        'color': primary_color
                    }
                )
            )
        
        # Create the tabs component with custom styling
        tabs = dbc.Tabs(
            model_tabs,
            className="mb-3",
            style={
                'borderBottom': f'1px solid {accent_color}'
            }
        )
        
        # Create the full content container
        full_content = dbc.Container([
            # Header section
            dbc.Row([
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader([
                            html.I(className="fas fa-brain me-2"),
                            "Model Performance Overview"
                        ], className="d-flex align-items-center fw-bold"),
                        dbc.CardBody([
                            dbc.Row([
                                dbc.Col([
                                    html.H4(f"{len(models)} Active Models"),
                                    html.P(f"Tracking {len(metrics)} metrics per model")
                                ], md=6),
                                dbc.Col([
                                    html.H4("Performance Analysis"),
                                    html.P("View detailed metrics for each model below")
                                ], md=6)
                            ])
                        ])
                    ], style={
                        'backgroundColor': card_bg_color,
                        'color': text_color,
                        'borderRadius': '8px',
                        'boxShadow': '0 4px 8px rgba(0,0,0,0.2)',
                        'marginBottom': '20px'
                    })
                ], width=12)
            ]),
            
            # Model tabs section
            dbc.Row([
                dbc.Col([
                    html.H4("Model Metrics by Type", className="section-header", 
                            style={
                                'color': text_color,
                                'marginBottom': '15px',
                                'paddingLeft': '10px',
                                'borderLeft': f'4px solid {secondary_color}',
                            })
                ], width=12)
            ], style={'marginTop': '10px', 'marginBottom': '15px'}),
            
            # Tabs component
            dbc.Row([
                dbc.Col(tabs, width=12)
            ])
        ], fluid=True)
        
        return full_content

    except Exception as e:
        return dbc.Alert([
            html.H4("Error displaying model metrics", className="alert-heading"),
            html.Hr(),
            html.P(f"Technical details: {str(e)}")
        ], color="danger")
    

def render_system_tab(data):    
    """Render the content for the System Metrics tab"""
    try:
        system_df = pd.read_json(StringIO(data['system']), orient='split')

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
    """Render the content for the Anomaly Detection tab"""
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
    