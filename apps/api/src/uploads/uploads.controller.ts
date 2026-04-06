import { Controller, Get } from '@nestjs/common';

@Controller('uploads')
export class UploadsController {
  @Get('health')
  getHealth() {
    return { status: 'ok', module: 'uploads' };
  }
}
