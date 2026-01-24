import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScreenshotHash } from './entities/screenshot-hash.entity';
import { Screenshot } from './entities/screenshot.entity';
import { generateFileHash } from '../../common/utils/hash.util';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ScreenshotsService {
  private readonly uploadsDir = 'uploads/screenshots';

  constructor(
    @InjectRepository(ScreenshotHash)
    private readonly hashRepo: Repository<ScreenshotHash>,
    @InjectRepository(Screenshot)
    private readonly screenshotRepo: Repository<Screenshot>,
  ) {
    // Ensure uploads directory exists
    this.ensureUploadsDirExists();
  }

  private ensureUploadsDirExists() {
    const fullPath = path.join(process.cwd(), this.uploadsDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log('[SCREENSHOTS] Created uploads directory:', fullPath);
    }
  }

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

  async saveScreenshotFile(
    buffer: Buffer,
    actionId: string,
    userId: string,
    mimeType: string,
  ): Promise<Screenshot> {
    const hash = generateFileHash(buffer);
    
    // Check for duplicate
    const existingHash = await this.hashRepo.findOne({
      where: { hash },
    });

    const isDuplicate = !!existingHash;

    // Determine file extension from mime type
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const filename = `${actionId}.${ext}`;
    const relativePath = `${this.uploadsDir}/${filename}`;
    const fullPath = path.join(process.cwd(), relativePath);

    // Write file to disk
    fs.writeFileSync(fullPath, buffer);
    console.log('[SCREENSHOTS] File saved:', fullPath);

    // Save hash if new
    if (!existingHash) {
      await this.hashRepo.save({
        hash,
        uploadedByUserId: userId,
        fileSize: buffer.length,
        mimeType,
      });
    }

    // Save screenshot metadata
    const screenshot = await this.screenshotRepo.save({
      actionId,
      filePath: relativePath,
      mimeType,
      fileSize: buffer.length,
      hash,
      isDuplicate,
      uploadedByUserId: userId,
    });

    console.log('[SCREENSHOTS] Screenshot metadata saved:', screenshot.id);
    return screenshot;
  }

  async getScreenshotByActionId(actionId: string): Promise<Screenshot | null> {
    return this.screenshotRepo.findOne({ where: { actionId } });
  }
}