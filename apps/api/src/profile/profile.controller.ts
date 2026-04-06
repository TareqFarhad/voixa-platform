import { Controller, Get } from '@nestjs/common';

@Controller('profile')
export class ProfileController {
  @Get('health')
  getHealth() {
    return { status: 'ok', module: 'profile' };
  }
}
