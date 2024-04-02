import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: ClassConstructor<T>) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<T> | Promise<Observable<T>> {
    // run something before a request is handled
    // by the request handler

    return next.handle().pipe(
      map((data: T) => {
        // run something before the response is sent out
        return instanceToPlain(
          plainToInstance(this.dto, data, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
          }),
        ) as T;
      }),
    );
  }
}
