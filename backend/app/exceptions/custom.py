


class AppException(Exception):
    status_code = 400
    error_code = "APP_ERROR"
    message = "Application Error"

    def __init__(self, message:str | None = None):
        if message:
            self.message = message
            super().__init__(self.message)




class NotFoundError(AppException):
    status_code = 404
    error_code = "NOT_FOUND"

class ConflictError(AppException):
    status_code = 409
    error_code = "CONFLICT"

class BadRequestError(AppException):
    status_code = 400
    error_code = "BAD_REQUEST"

class ForbiddenError(AppException):
    status_code = 403
    error_code = "FORBIDDEN"


class UnauthorizedError(AppException):
    status_code = 401
    error_code = "UNAUTHORIZED"


class InternalServerError(AppException):
    status_code = 500
    error_code = "INTERNAL_SERVER"


class TooManyRequestsError(AppException):
    status_code = 429
    error_code = "TOO_MANY_REQUESTS"




