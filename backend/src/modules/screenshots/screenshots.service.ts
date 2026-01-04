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
  ): Promise<string> {
    if (!buffer || !buffer.length) {
      throw new BadRequestException({
        code: 'INVALID_SCREENSHOT',
        message: 'Screenshot buffer is empty',
      });
    }

    const hash = generateFileHash(buffer);

    const exists = await this.hashRepo.findOne({
      where: { hash },
    });

    if (exists) {
      throw new BadRequestException({
        code: 'DUPLICATE_SCREENSHOT',
        message: 'Duplicate screenshot detected',
      });
    }

    await this.hashRepo.save({
      hash,
      uploadedByUserId: userId,
      fileSize: buffer.length,
      mimeType: mimeType ?? 'unknown',
    });

    return hash;
  }
}