import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService) {}

  async getExport(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { assets: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }
    const output = project.assets.find((a) => a.type === AssetType.PROCESSED_OUTPUT);
    if (!output) {
      throw new NotFoundException('Final track is not ready yet');
    }
    return {
      projectId: project.id,
      title: project.songTitle ?? project.title,
      url: this.storage.publicUrl(output.storageKey),
      format: output.format,
    };
  }
}
