import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { ExportsService } from './exports.service';

@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private readonly exports: ExportsService) {}

  @Get(':projectId')
  export(@CurrentUser() user: CurrentUserPayload, @Param('projectId') projectId: string) {
    return this.exports.getExport(user.id, projectId);
  }
}
