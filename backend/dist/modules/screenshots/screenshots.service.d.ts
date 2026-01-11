import { Repository } from 'typeorm';
import { ScreenshotHash } from './entities/screenshot-hash.entity';
export declare class ScreenshotsService {
    private readonly hashRepo;
    constructor(hashRepo: Repository<ScreenshotHash>);
    processScreenshot(buffer: Buffer, userId: string, mimeType?: string): Promise<string>;
}
