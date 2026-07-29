import logging
import time
import uuid


logger = logging.getLogger("request")


class RequestIdLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.request_id = request_id
        start = time.perf_counter()

        response = self.get_response(request)

        duration_ms = int((time.perf_counter() - start) * 1000)
        user_id = (
            getattr(request.user, "id", None)
            if hasattr(request, "user") and getattr(request.user, "is_authenticated", False)
            else None
        )

        response["X-Request-ID"] = request_id
        logger.info(
            "request_id=%s method=%s path=%s status=%s duration_ms=%s user_id=%s",
            request_id,
            request.method,
            request.path,
            response.status_code,
            duration_ms,
            user_id,
        )

        return response
