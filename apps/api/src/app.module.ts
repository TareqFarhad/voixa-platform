import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { UploadsModule } from './uploads/uploads.module';
import { ProcessingModule } from './processing/processing.module';
import { ProfileModule } from './profile/profile.module';
import { ExportsModule } from './exports/exports.module';
import { StorageModule } from './storage/storage.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    QueueModule,
    HealthModule,
    AuthModule,
    ProjectsModule,
    UploadsModule,
    ProcessingModule,
    ProfileModule,
    ExportsModule,
  ],
})
export class AppModule {}
