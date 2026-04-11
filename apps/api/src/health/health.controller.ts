import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    let db: 'up' | 'down' = 'down';
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      db = 'up';
    } catch {
      db = 'down';
    }
    return {
      status: 'ok',
      service: 'api',
      dependencies: { database: db },
      timestamp: new Date().toISOString(),
    };
  }
}
