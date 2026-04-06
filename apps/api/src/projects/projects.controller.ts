import { Controller, Get } from '@nestjs/common';

@Controller('projects')
export class ProjectsController {
  @Get('health')
  getHealth() {
    return { status: 'ok', module: 'projects' };
  }
}
