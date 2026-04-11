import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface ProcessingJobPayload {
  jobId: string;
  projectId: string;
  userId: string;
  vocal: { key: string; format?: string };
  instrumental: { key: string; format?: string };
  lyrics?: string | null;
  settings: Record<string, unknown>;
  callbackUrl: string;
}

/**
 * Lightweight Redis-backed job queue used to communicate with the Python
 * worker. BullMQ is intentionally avoided on the worker side so the Python
 * process can consume the queue with a simple BLPOP; this keeps the cross
 * language contract small and explicit.
 */
@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private redis: Redis | null = null;
  private readonly queueName: string;
  private readonly redisUrl: string;

  constructor(private readonly config: ConfigService) {
    this.queueName = this.config.get<string>('PROCESSING_QUEUE') ?? 'voixa.processing';
    this.redisUrl = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
  }

  async onModuleInit() {
    try {
      this.redis = new Redis(this.redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
      });
      await this.redis.connect();
      this.logger.log(`Queue connected to ${this.redisUrl} (${this.queueName})`);
    } catch (err) {
      this.logger.warn(
        `Queue could not connect to Redis: ${(err as Error).message}. Jobs will be rejected until Redis is available.`,
      );
      this.redis = null;
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit().catch(() => {
        /* ignore */
      });
    }
  }

  async publishProcessingJob(payload: ProcessingJobPayload): Promise<void> {
    if (!this.redis) {
      throw new Error('Queue unavailable: Redis connection is not ready');
    }
    await this.redis.rpush(this.queueName, JSON.stringify(payload));
    this.logger.log(`Enqueued processing job ${payload.jobId} for project ${payload.projectId}`);
  }

  getQueueName(): string {
    return this.queueName;
  }
}
