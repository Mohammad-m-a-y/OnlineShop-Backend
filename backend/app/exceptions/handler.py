import uuid
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.exceptions.custom import AppException
from app.core.logging_handler import logger





def build_error_response(
    *,
    error: str,
    message: str,
    path: str,
    trace_id: str,
):
    return {
        "error": error,
        "message": message,
        "path": path,
        "trace_id": trace_id,
    }





#  custom app exception
async def app_exception_handler(request: Request, exc: AppException):
    trace_id = str(uuid.uuid4())

    logger.warning(
        f"[{trace_id}] AppException: {exc.error_code} - {exc.message}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=build_error_response(
            error=exc.error_code,
            message=exc.message,
            path=request.url.path,
            trace_id=trace_id,
        ),
    )





#  validation error
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    trace_id = str(uuid.uuid4())

    logger.warning(f"[{trace_id}] Validation error: {exc.errors()}")

    return JSONResponse(
        status_code=422,
        content=build_error_response(
            error="ValidationError",
            message="Invalid request data",
            path=request.url.path,
            trace_id=trace_id,
        ),
    )


#  unhandled error
async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
):
    trace_id = str(uuid.uuid4())

    logger.exception(f"[{trace_id}] Unhandled exception: {exc}")

    return JSONResponse(
        status_code=500,
        content=build_error_response(
            error="InternalServerError",
            message="Something went wrong",
            path=request.url.path,
            trace_id=trace_id,
        ),
    )
