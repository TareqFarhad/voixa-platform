import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { UploadsService } from './uploads.service';
import { AssetType } from '@prisma/client';

const UPLOAD_OPTIONS = { storage: memoryStorage(), limits: { fileSize: 60 * 1024 * 1024 } };

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('vocal/:projectId')
  @UseInterceptors(FileInterceptor('file', UPLOAD_OPTIONS))
  uploadVocal(
    @CurrentUser() user: CurrentUserPayload,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploads.uploadAsset(user.id, projectId, AssetType.RAW_VOCAL, file);
  }

  @Post('instrumental/:projectId')
  @UseInterceptors(FileInterceptor('file', UPLOAD_OPTIONS))
  uploadInstrumental(
    @CurrentUser() user: CurrentUserPayload,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploads.uploadAsset(user.id, projectId, AssetType.INSTRUMENTAL, file);
  }

  @Post('voice-sample/:projectId')
  @UseInterceptors(FileInterceptor('file', UPLOAD_OPTIONS))
  uploadVoiceSample(
    @CurrentUser() user: CurrentUserPayload,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploads.uploadAsset(user.id, projectId, AssetType.VOICE_SAMPLE, file);
  }
}
