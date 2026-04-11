import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

/**
 * Default creative control values exposed on the create flow. The web UI
 * uses premium, emotive labels (warmth, clarity, polish...) while the
 * worker translates these into DSP parameters.
 */
const DEFAULT_SETTINGS = {
  style: 'Studio',
  pitchCorrection: 0.55,
  smoothness: 0.5,
  clarity: 0.6,
  warmth: 0.5,
  reverb: 0.3,
  vocalVolume: 0.85,
  instrumentalVolume: 0.75,
  naturalVsPolished: 0.5,
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        assets: true,
        jobs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        userId,
        title: dto.title,
        songTitle: dto.songTitle ?? null,
        genre: dto.genre ?? null,
        style: dto.style ?? 'Studio',
        lyrics: dto.lyrics ?? null,
        settings: DEFAULT_SETTINGS as object,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        assets: true,
        jobs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }
    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    const current = await this.findOne(userId, id);
    return this.prisma.project.update({
      where: { id: current.id },
      data: {
        title: dto.title ?? current.title,
        songTitle: dto.songTitle ?? current.songTitle,
        genre: dto.genre ?? current.genre,
        style: dto.style ?? current.style,
        lyrics: dto.lyrics ?? current.lyrics,
        settings: (dto.settings ?? (current.settings as object | null)) as object,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.project.delete({ where: { id } });
    return { ok: true };
  }

  defaultSettings() {
    return { ...DEFAULT_SETTINGS };
  }
}
