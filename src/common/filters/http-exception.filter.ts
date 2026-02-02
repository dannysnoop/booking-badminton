import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Đã xảy ra lỗi không mong muốn',
      },
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        // Check if it's already formatted
        if ('success' in exceptionResponse) {
          errorResponse = exceptionResponse;
        } else if ('message' in exceptionResponse) {
          const message = (exceptionResponse as any).message;
          errorResponse = {
            success: false,
            error: {
              code: this.getErrorCode(status),
              message: Array.isArray(message) ? message[0] : message,
              ...(typeof message === 'object' && !Array.isArray(message)
                ? message
                : {}),
            },
          };
        }
      } else {
        errorResponse = {
          success: false,
          error: {
            code: this.getErrorCode(status),
            message: exceptionResponse,
          },
        };
      }
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const codes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }
}
