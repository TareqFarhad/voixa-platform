import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { AssetType } from '@prisma/client';

const ALLOWED_MIME = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/webm',
  'audio/ogg',
]);

const MAX_BYTES = 60 * 1024 * 1024; // 60 MB soft cap for MVP uploads

@Injectable()
export class UploadsService {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService) {}

  async uploadAsset(
    userId: string,
    projectId: string,
    type: AssetType,
    file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('A file is required to bring your audio into Voixa');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('File is larger than the 60 MB MVP limit');
    }
    if (file.mimetype && !ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(`Unsupported audio format: ${file.mimetype}`);
    }
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Clean up previous asset of the same type so the create flow stays
    // single-source: one raw_vocal and one instrumental per project.
    const previous = await this.prisma.asset.findFirst({
      where: { projectId, type },
    });
    if (previous) {
      await this.storage.remove(previous.storageKey).catch(() => undefined);
      await this.prisma.asset.delete({ where: { id: previous.id } });
    }

    const key = this.storage.buildKey(`projects/${projectId}/${type.toLowerCase()}`, file.originalname);
    const stored = await this.storage.putBuffer(key, file.buffer, file.mimetype);

    const asset = await this.prisma.asset.create({
      data: {
        projectId,
        type,
        storageKey: stored.key,
        format: file.mimetype,
        sizeBytes: stored.sizeBytes,
      },
    });

    return {
      id: asset.id,
      type: asset.type,
      url: stored.url,
      sizeBytes: asset.sizeBytes,
      format: asset.format,
    };
  }
}
