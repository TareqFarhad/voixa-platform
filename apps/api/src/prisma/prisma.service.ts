import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected');
    } catch (err) {
      this.logger.warn(
        `Prisma connection failed at startup: ${(err as Error).message}. API will continue running; run migrations to initialize the database.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
