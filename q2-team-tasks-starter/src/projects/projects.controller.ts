import { Controller, Get } from '@nestjs/common';

// You do NOT need to modify this controller.
// It exists to check that your auth is "secure by default": a controller nobody
// remembered to decorate must still require a valid token.
@Controller('projects')
export class ProjectsController {
  @Get()
  findAll() {
    return [
      { id: 1, name: 'Mobile app' },
      { id: 2, name: 'Public website' },
    ];
  }
}
