import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // If the data already has a success property, return it as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data as Response<T>;
        }

        // Otherwise, wrap it in a success response
        return {
          success: true,
          data: data as T,
        };
      }),
    );
  }
}
