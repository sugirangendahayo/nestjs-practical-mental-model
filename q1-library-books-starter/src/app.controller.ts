import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  info() {
    return {
      name: 'Library Books API',
      tryThese: [
        'GET /books',
        'GET /books?page=2&limit=5',
        'GET /books?author=adichie',
        'GET /books?genre=programming&available=true',
        'GET /books/1',
      ],
      hint: 'Open a new terminal and run "npm test" to check your solution.',
    };
  }
}
