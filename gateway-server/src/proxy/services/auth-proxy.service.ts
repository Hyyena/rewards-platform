import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class AuthProxyService {
  private authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get<string>('AUTH_SERVICE_HOST');
    const port = this.configService.get<string>('AUTH_SERVICE_PORT');
    this.authServiceUrl = `http://${host}:${port}`;
  }

  request<T>(
    method: string,
    url: string,
    data?: any,
    headers?: any,
  ): Observable<AxiosResponse<T>> {
    const fullUrl = `${this.authServiceUrl}${url}`;
    const config: AxiosRequestConfig = {
      method,
      url: fullUrl,
      data,
      headers,
    };

    return this.httpService.request<T>(config).pipe(
      map((response) => response),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }
}
