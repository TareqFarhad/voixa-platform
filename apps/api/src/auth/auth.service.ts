import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

export interface AuthTokenPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const normalized = email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      throw new ConflictException('An account with that email already exists');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: normalized,
        name: name?.trim() || null,
        passwordHash,
        profile: {
          create: {
            displayName: name?.trim() || null,
            consentVoiceProcessing: false,
            consentMarketing: false,
            subscriptionStatus: 'free',
          },
        },
      },
      include: { profile: true },
    });
    return this.buildSession(user.id, user.email, user.name ?? undefined, user.plan);
  }

  async login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildSession(user.id, user.email, user.name ?? undefined, user.plan);
  }

  async requestPasswordReset(email: string) {
    // NOTE: MVP stub. Production builds should issue a short lived signed
    // reset token and dispatch an email with a link to the /reset page.
    this.logger.log(`Password reset requested for ${email}`);
    return { ok: true };
  }

  async confirmPasswordReset(token: string, password: string) {
    // NOTE: MVP stub. The token would be validated here and the user record
    // updated with a freshly hashed password.
    this.logger.log(`Password reset confirmed (stub) for token ${token.slice(0, 6)}`);
    return { ok: true, passwordLength: password.length };
  }

  async currentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, voiceProfile: true },
    });
    if (!user) {
      throw new UnauthorizedException('Session is no longer valid');
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

  private async buildSession(id: string, email: string, name: string | undefined, plan: string) {
    const payload: AuthTokenPayload = { sub: id, email };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: { id, email, name: name ?? null, plan },
    };
  }
}
