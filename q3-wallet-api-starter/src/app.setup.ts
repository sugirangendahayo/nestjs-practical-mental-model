import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import { ResponseEnvelopeInterceptor } from "./common/response-envelope.interceptor";
import { ResponseTimeInterceptor } from "./common/response-time.interceptor";

/**
 * Global configuration shared by main.ts AND the test suite.
 * Register your global interceptors / filters here (or with APP_INTERCEPTOR /
 * APP_FILTER in a module - both are fine).
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor(new Reflector()));
  app.useGlobalInterceptors(new ResponseTimeInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
}
