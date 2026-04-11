import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get(@CurrentUser() user: CurrentUserPayload) {
    return this.profile.get(user.id);
  }

  @Put()
  update(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateProfileDto) {
    return this.profile.update(user.id, dto);
  }

  @Delete('voice-model')
  deleteVoiceModel(@CurrentUser() user: CurrentUserPayload) {
    return this.profile.deleteVoiceModel(user.id);
  }
}
