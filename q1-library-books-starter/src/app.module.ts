import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BooksModule } from './books/books.module';

@Module({
  imports: [BooksModule],
  controllers: [AppController],
})
export class AppModule {}
