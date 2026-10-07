import { INestApplication, ValidationPipe } from '@nestjs/common';

/** Global configuration shared by main.ts AND the test suite. */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
}
