import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { StorageService } from './storage.service';

/**
 * Serves files from the local storage driver so the web app can play audio
 * directly during development. In production this route should be replaced
 * by signed URLs pointing at the object store.
 */
@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Get(':folder/:file')
  async serveTwo(@Param('folder') folder: string, @Param('file') file: string, @Res() res: Response) {
    return this.serve(`${folder}/${file}`, res);
  }

  @Get(':folder/:sub/:file')
  async serveThree(
    @Param('folder') folder: string,
    @Param('sub') sub: string,
    @Param('file') file: string,
    @Res() res: Response,
  ) {
    return this.serve(`${folder}/${sub}/${file}`, res);
  }

  private async serve(key: string, res: Response) {
    const exists = await this.storage.exists(key);
    if (!exists) {
      throw new NotFoundException('Asset not found');
    }
    const stream = await this.storage.stream(key);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=60');
    stream.pipe(res);
  }
}
