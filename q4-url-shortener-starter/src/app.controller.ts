import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  info() {
    return {
      name: 'URL Shortener',
      endpoints: ['POST /links', 'GET /:slug', 'GET /links/:slug/stats'],
      hint: 'Open a new terminal and run "npm test" to check your solution.',
    };
  }
}
