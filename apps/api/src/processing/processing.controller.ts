import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { ProcessingService } from './processing.service';
import { ProcessingCallbackDto, StartProcessingDto } from './dto/processing.dto';

@Controller('processing')
export class ProcessingController {
  constructor(private readonly processing: ProcessingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('start')
  start(@CurrentUser() user: CurrentUserPayload, @Body() dto: StartProcessingDto) {
    return this.processing.startJob(user.id, dto.projectId, dto.settings);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:jobId')
  status(@CurrentUser() user: CurrentUserPayload, @Param('jobId') jobId: string) {
    return this.processing.status(user.id, jobId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('retry/:jobId')
  retry(@CurrentUser() user: CurrentUserPayload, @Param('jobId') jobId: string) {
    return this.processing.retry(user.id, jobId);
  }

  /**
   * Internal callback hit by the Python worker as it progresses through the
   * pipeline stages. In production this endpoint would be restricted via a
   * shared secret header; the MVP keeps it open for easier local iteration.
   */
  @Post('callback')
  callback(@Body() dto: ProcessingCallbackDto) {
    return this.processing.ingestCallback(dto);
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', module: 'processing' };
  }
}
