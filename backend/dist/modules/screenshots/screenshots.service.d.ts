import { Repository } from 'typeorm';
import { ScreenshotHash } from './entities/screenshot-hash.entity';
import { Screenshot } from './entities/screenshot.entity';
export declare class ScreenshotsService {
    private readonly hashRepo;
    private readonly screenshotRepo;
    private readonly uploadsDir;
    constructor(hashRepo: Repository<ScreenshotHash>, screenshotRepo: Repository<Screenshot>);
    private ensureUploadsDirExists;
    processScreenshot(buffer: Buffer, userId: string, mimeType?: string): Promise<{
        screenshotId: string;
        isDuplicate: boolean;
        existingScreenshotId?: string;
    }>;
    saveScreenshotFile(buffer: Buffer, actionId: string, userId: string, mimeType: string, isDuplicateFromProcessing: boolean): Promise<Screenshot>;
    getScreenshotByActionId(actionId: string): Promise<Screenshot | null>;
    deleteScreenshotByActionId(actionId: string): Promise<void>;
    deleteScreenshotsForInquiryActions(actionIds: string[]): Promise<void>;
}
