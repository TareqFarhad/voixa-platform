import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssetType, JobStatus, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { ProcessingCallbackDto } from './dto/processing.dto';

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);
  private readonly callbackUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
    private readonly config: ConfigService,
  ) {
    const port = this.config.get<string>('PORT') ?? '4000';
    this.callbackUrl = `http://localhost:${port}/api/processing/callback`;
  }

  async startJob(userId: string, projectId: string, settingsOverride?: Record<string, unknown>) {
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

    const vocal = project.assets.find((a) => a.type === AssetType.RAW_VOCAL);
    const instrumental = project.assets.find((a) => a.type === AssetType.INSTRUMENTAL);
    if (!vocal || !instrumental) {
      throw new BadRequestException('Both a vocal and an instrumental asset are required');
    }

    const settings = {
      ...((project.settings as Record<string, unknown>) ?? {}),
      ...(settingsOverride ?? {}),
    };

    const job = await this.prisma.job.create({
      data: {
        projectId: project.id,
        status: JobStatus.QUEUED,
        stage: 'queued',
        payload: settings as object,
      },
    });

    await this.prisma.project.update({
      where: { id: project.id },
      data: { status: ProjectStatus.PROCESSING, settings: settings as object },
    });

    try {
      await this.queue.publishProcessingJob({
        jobId: job.id,
        projectId: project.id,
        userId,
        vocal: { key: vocal.storageKey, format: vocal.format ?? undefined },
        instrumental: { key: instrumental.storageKey, format: instrumental.format ?? undefined },
        lyrics: project.lyrics,
        settings,
        callbackUrl: this.callbackUrl,
      });
    } catch (err) {
      this.logger.error(`Failed to enqueue job: ${(err as Error).message}`);
      await this.prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          errorMessage: 'Processing queue is unavailable. Please try again shortly.',
          endedAt: new Date(),
        },
      });
      await this.prisma.project.update({
        where: { id: project.id },
        data: { status: ProjectStatus.FAILED },
      });
      throw err;
    }

    return { jobId: job.id, projectId: project.id, status: job.status };
  }

  async status(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { project: { include: { assets: true } } },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this job');
    }
    return {
      jobId: job.id,
      projectId: job.projectId,
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      startedAt: job.startedAt,
      endedAt: job.endedAt,
      errorMessage: job.errorMessage,
      assets: job.project.assets.map((a) => ({
        id: a.id,
        type: a.type,
        storageKey: a.storageKey,
      })),
    };
  }

  async retry(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { project: true },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this job');
    }
    return this.startJob(userId, job.projectId);
  }

  async ingestCallback(dto: ProcessingCallbackDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
      include: { project: true },
    });
    if (!job) {
      throw new NotFoundException('Unknown job');
    }

    const updates: Record<string, unknown> = {
      status: dto.status as JobStatus,
      stage: dto.stage ?? job.stage,
      progress: dto.progress ?? job.progress,
      errorMessage: dto.errorMessage ?? null,
    };
    if (dto.status === 'RUNNING' && !job.startedAt) {
      updates.startedAt = new Date();
    }
    if (dto.status === 'COMPLETED' || dto.status === 'FAILED') {
      updates.endedAt = new Date();
    }

    await this.prisma.job.update({ where: { id: job.id }, data: updates });

    if (dto.status === 'COMPLETED' && dto.outputKey) {
      // Replace any previous processed output
      await this.prisma.asset.deleteMany({
        where: { projectId: job.projectId, type: AssetType.PROCESSED_OUTPUT },
      });
      await this.prisma.asset.create({
        data: {
          projectId: job.projectId,
          type: AssetType.PROCESSED_OUTPUT,
          storageKey: dto.outputKey,
          format: 'audio/mpeg',
        },
      });
      if (dto.previewKey) {
        await this.prisma.asset.deleteMany({
          where: { projectId: job.projectId, type: AssetType.PREVIEW },
        });
        await this.prisma.asset.create({
          data: {
            projectId: job.projectId,
            type: AssetType.PREVIEW,
            storageKey: dto.previewKey,
            format: 'audio/mpeg',
          },
        });
      }
      await this.prisma.project.update({
        where: { id: job.projectId },
        data: { status: ProjectStatus.COMPLETED },
      });
    }

    if (dto.status === 'FAILED') {
      await this.prisma.project.update({
        where: { id: job.projectId },
        data: { status: ProjectStatus.FAILED },
      });
    }

    return { ok: true };
  }
}
