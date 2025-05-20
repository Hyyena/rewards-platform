import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';

@Catch(HttpException, AxiosError)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException | AxiosError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        message = (errorResponse as any).message || exception.message;
        error = (errorResponse as any).error || 'Http Exception';
      } else {
        message = exception.message;
        error = 'Http Exception';
      }
    } else if (exception.isAxiosError) {
      const axiosError = exception as AxiosError;
      status = axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      if (
        axiosError.response?.data &&
        typeof axiosError.response.data === 'object'
      ) {
        message =
          (axiosError.response.data as any).message || axiosError.message;
        error = (axiosError.response.data as any).error || 'Microservice Error';
      } else {
        message = axiosError.message;
        error = 'Microservice Error';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status}, Error: ${error}, Message: ${message}`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }
}
