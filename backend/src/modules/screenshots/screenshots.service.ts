import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScreenshotHash } from './entities/screenshot-hash.entity';
import { generateFileHash } from '../../common/utils/hash.util';

@Injectable()
export class ScreenshotsService {
  constructor(
    @InjectRepository(ScreenshotHash)
    private readonly hashRepo: Repository<ScreenshotHash>,
  ) {}

  async processScreenshot(
    buffer: Buffer,
    userId: string,
    mimeType?: string,
  ): Promise<{ screenshotId: string; isDuplicate: boolean; existingScreenshotId?: string }> {
    if (!buffer || !buffer.length) {
      throw new BadRequestException({
        code: 'INVALID_SCREENSHOT',
        message: 'Screenshot buffer is empty',
      });
    }

    const hash = generateFileHash(buffer);

    const existing = await this.hashRepo.findOne({
      where: { hash },
    });

    if (existing) {
      // Duplicate detected - return info about existing screenshot
      console.log('[SCREENSHOTS] Duplicate screenshot detected:', existing.id);
      return {
        screenshotId: existing.id,
        isDuplicate: true,
        existingScreenshotId: existing.id,
      };
    }

    const saved = await this.hashRepo.save({
      hash,
      uploadedByUserId: userId,
      fileSize: buffer.length,
      mimeType: mimeType ?? 'unknown',
    });

    console.log('[SCREENSHOTS] New screenshot saved:', saved.id);

    return {
      screenshotId: saved.id,
      isDuplicate: false,
    };
  }
}