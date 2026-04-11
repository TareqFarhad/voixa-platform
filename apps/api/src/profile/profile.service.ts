import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, voiceProfile: true },
    });
    if (!user) {
      throw new NotFoundException('Profile not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      profile: user.profile,
      voiceProfile: user.voiceProfile,
    };
  }

  async update(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: dto.displayName ?? null,
        consentVoiceProcessing: dto.consentVoiceProcessing ?? false,
        consentMarketing: dto.consentMarketing ?? false,
      },
      update: {
        displayName: dto.displayName,
        consentVoiceProcessing: dto.consentVoiceProcessing,
        consentMarketing: dto.consentMarketing,
      },
    });
    return profile;
  }

  async deleteVoiceModel(userId: string) {
    await this.prisma.voiceProfile.deleteMany({ where: { userId } });
    return { ok: true };
  }
}
