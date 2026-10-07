import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Library Books API is running on http://localhost:${port}`);
  console.log('Open a new terminal and run "npm test" to check your solution.');
}
bootstrap();
