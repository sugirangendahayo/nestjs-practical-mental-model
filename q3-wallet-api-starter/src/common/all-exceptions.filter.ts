import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

const statusCodeToCode = (status: HttpStatus): string => {
  const map: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: "BAD_REQUEST",
    [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
    [HttpStatus.FORBIDDEN]: "FORBIDDEN",
    [HttpStatus.NOT_FOUND]: "NOT_FOUND",
    [HttpStatus.METHOD_NOT_ALLOWED]: "METHOD_NOT_ALLOWED",
    [HttpStatus.CONFLICT]: "CONFLICT",
    [HttpStatus.UNPROCESSABLE_ENTITY]: "UNPROCESSABLE_ENTITY",
    [HttpStatus.INTERNAL_SERVER_ERROR]: "INTERNAL_SERVER_ERROR",
  };

  return map[status] ?? "INTERNAL_SERVER_ERROR";
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const code =
        typeof payload === "object" &&
        payload !== null &&
        "code" in payload &&
        typeof (payload as any).code === "string"
          ? (payload as any).code
          : statusCodeToCode(status);
      const message =
        typeof payload === "string"
          ? payload
          : typeof payload === "object" &&
              payload !== null &&
              "message" in payload
            ? (payload as any).message
            : "Internal server error";

      response.status(status).json({
        success: false,
        error: {
          statusCode: status,
          code,
          message,
        },
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    this.logger.error(
      exception instanceof Error
        ? (exception.stack ?? exception.message)
        : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
