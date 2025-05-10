from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from .metrics import metrics_collector
import time


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()

        # Skip metrics for certain paths
        if request.url.path in ["/metrics", "/docs", "/redoc", "/favicon.ico"]:
            return await call_next(request)

        response = await call_next(request)
        process_time = time.time() - start_time

        # Track the request metrics
        metrics_collector.track_request(
            request.url.path,
            process_time,
            response.status_code
        )

        return response
