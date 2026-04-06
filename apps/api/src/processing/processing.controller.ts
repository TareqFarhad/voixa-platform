import { Controller, Get } from '@nestjs/common';

@Controller('processing')
export class ProcessingController {
  @Get('health')
  getHealth() {
    return { status: 'ok', module: 'processing' };
  }
}
