import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { createReadStream, ReadStream } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface StoredObject {
  key: string;
  url: string;
  sizeBytes: number;
  format: string;
}

/**
 * Voixa storage abstraction.
 *
 * The MVP uses a local filesystem driver so everything runs on a single
 * machine without external dependencies. In production the same API is
 * intended to be backed by Cloudflare R2 or AWS S3 via signed URLs - the
 * StorageService interface stays identical; only the driver implementation
 * changes.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: 'local' | 's3';
  private readonly localDir: string;
  private readonly publicBase: string;

  constructor(private readonly config: ConfigService) {
    this.driver = (this.config.get<string>('STORAGE_DRIVER') ?? 'local') as 'local' | 's3';
    this.localDir = path.resolve(this.config.get<string>('LOCAL_STORAGE_DIR') ?? './.storage');
    this.publicBase =
      this.config.get<string>('PUBLIC_STORAGE_URL') ?? 'http://localhost:4000/api/storage';
    if (this.driver === 'local') {
      fs.mkdir(this.localDir, { recursive: true }).catch((err) =>
        this.logger.error(`Failed to prepare local storage: ${(err as Error).message}`),
      );
    }
  }

  /** Build a deterministic key for uploads inside a project scope. */
  buildKey(prefix: string, originalName: string): string {
    const safe = originalName.replace(/[^a-zA-Z0-9._-]+/g, '_');
    return `${prefix}/${Date.now()}-${randomUUID().slice(0, 8)}-${safe}`;
  }

  /** Persist an in-memory buffer and return a storage record. */
  async putBuffer(key: string, buffer: Buffer, mimeType = 'application/octet-stream'): Promise<StoredObject> {
    if (this.driver === 'local') {
      const fullPath = this.toFsPath(key);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, buffer);
      return {
        key,
        url: this.publicUrl(key),
        sizeBytes: buffer.byteLength,
        format: mimeType,
      };
    }
    throw new Error('S3 driver not implemented in MVP scaffold');
  }

  async readBuffer(key: string): Promise<Buffer> {
    if (this.driver === 'local') {
      return fs.readFile(this.toFsPath(key));
    }
    throw new Error('S3 driver not implemented in MVP scaffold');
  }

  async stream(key: string): Promise<ReadStream> {
    if (this.driver === 'local') {
      return createReadStream(this.toFsPath(key));
    }
    throw new Error('S3 driver not implemented in MVP scaffold');
  }

  async exists(key: string): Promise<boolean> {
    if (this.driver === 'local') {
      try {
        await fs.access(this.toFsPath(key));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  async remove(key: string): Promise<void> {
    if (this.driver === 'local') {
      try {
        await fs.unlink(this.toFsPath(key));
      } catch {
        /* ignore */
      }
    }
  }

  /** Return a publicly reachable URL for the given storage key. */
  publicUrl(key: string): string {
    return `${this.publicBase.replace(/\/$/, '')}/${encodeURI(key)}`;
  }

  /** Absolute filesystem path used by the local driver (also used by the worker). */
  toFsPath(key: string): string {
    const clean = key.replace(/^\/+/, '').replace(/\.\.(\/|$)/g, '');
    return path.join(this.localDir, clean);
  }

  getLocalRoot(): string {
    return this.localDir;
  }
}
