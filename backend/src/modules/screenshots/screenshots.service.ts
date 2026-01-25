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
    isDuplicateFromProcessing: boolean,
  ): Promise<Screenshot> {
    // Recompute hash for file metadata, but DO NOT re-evaluate duplicate here.
    // The only source of truth for duplicate is processScreenshot().
    const hash = generateFileHash(buffer);

    // Determine file extension from mime type
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';
    const filename = `${actionId}.${ext}`;
    const relativePath = `${this.uploadsDir}/${filename}`;
    const fullPath = path.join(process.cwd(), relativePath);

    // Ensure directory exists before writing file
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log('[SCREENSHOTS] Created directory:', dirPath);
    }

    // Write file to disk
    try {
      fs.writeFileSync(fullPath, buffer);
      console.log('[SCREENSHOTS] File saved:', fullPath);
    } catch (err) {
      console.error('[SCREENSHOTS] ERROR writing file:', fullPath, err);
      throw err;
    }

    // Do NOT write to ScreenshotHash here; processScreenshot() handled hash registry.

    // Save screenshot metadata
    const screenshot = await this.screenshotRepo.save({
      actionId,
      filePath: relativePath,
      mimeType, // Store actual mimeType
      fileSize: buffer.length,
      hash,
      // Use the duplicate value determined by processScreenshot()
      isDuplicate: isDuplicateFromProcessing,
      uploadedByUserId: userId,
    });
    console.log('[SCREENSHOTS] Screenshot metadata saved:', screenshot.id, 'isDuplicate:', isDuplicateFromProcessing);
    return screenshot;
  }

  async getScreenshotByActionId(actionId: string): Promise<Screenshot | null> {
    return this.screenshotRepo.findOne({ where: { actionId } });
  }
}