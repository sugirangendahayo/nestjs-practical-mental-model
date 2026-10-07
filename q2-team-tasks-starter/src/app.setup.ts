import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Global configuration shared by main.ts AND the test suite.
 * (Guards that need dependency injection are usually registered in a module
 *  with the APP_GUARD token rather than here.)
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}
