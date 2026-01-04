import { Injectable, BadRequestException } from '@nestjs/common';
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
  ): Promise<string> {
    const hash = generateFileHash(buffer);

    const exists = await this.hashRepo.findOne({
      where: { hash },
    });

    if (exists) {
      throw new BadRequestException(
        'Duplicate screenshot detected',
      );
    }

    await this.hashRepo.save({
      hash,
      uploadedByUserId: userId,
    });

    return hash;
  }
}
