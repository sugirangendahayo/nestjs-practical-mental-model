import { INestApplication, ValidationPipe } from "@nestjs/common";

/**
 * Global configuration shared by main.ts AND the test suite.
 * Anything you register here (pipes, filters, interceptors...) is also
 * applied when the tests boot the application.
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
}
