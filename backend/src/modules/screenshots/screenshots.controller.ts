import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Screenshot } from './entities/screenshot.entity';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/screenshots')
export class ScreenshotsController {
  constructor(
    @InjectRepository(Screenshot)
    private readonly screenshotRepo: Repository<Screenshot>,
  ) {}

  @Get(':actionId')
  async getScreenshot(
    @Param('actionId') actionId: string,
    @Res() res: Response,
  ) {
    try {
      const screenshot = await this.screenshotRepo.findOne({
        where: { actionId },
      });

      if (!screenshot) {
        console.error('[SCREENSHOTS-CTRL] Screenshot not found for actionId:', actionId);
        throw new NotFoundException('Screenshot not found');
      }

      const filePath = path.join(process.cwd(), screenshot.filePath);

      console.log('[SCREENSHOTS-CTRL] Retrieving screenshot:', {
        actionId,
        filePath,
        mimeType: screenshot.mimeType,
      });

      if (!fs.existsSync(filePath)) {
        console.error('[SCREENSHOTS-CTRL] File not found on disk:', filePath);
        throw new NotFoundException('Screenshot file not found on disk');
      }

      res.setHeader('Content-Type', screenshot.mimeType || 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (err) => {
        console.error('[SCREENSHOTS-CTRL] Stream error:', err);
        res.status(500).send('Error reading file');
      });
      fileStream.pipe(res);
    } catch (err) {
      console.error('[SCREENSHOTS-CTRL] Error:', err);
      throw err;
    }
  }
}
