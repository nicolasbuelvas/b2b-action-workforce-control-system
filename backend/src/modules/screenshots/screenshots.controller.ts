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
    const screenshot = await this.screenshotRepo.findOne({
      where: { actionId },
    });

    if (!screenshot) {
      throw new NotFoundException('Screenshot not found');
    }

    const filePath = path.join(process.cwd(), screenshot.filePath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Screenshot file not found on disk');
    }

    res.setHeader('Content-Type', screenshot.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
