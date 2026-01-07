import { Repository } from 'typeorm';
import { InquiryAction } from './entities/inquiry-action.entity';
import { InquiryTask } from './entities/inquiry-task.entity';
import { OutreachRecord } from './entities/outreach-record.entity';
import { ScreenshotsService } from '../screenshots/screenshots.service';
import { CooldownService } from '../cooldown/cooldown.service';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
export declare class InquiryService {
    private readonly actionRepo;
    private readonly taskRepo;
    private readonly outreachRepo;
    private readonly screenshotsService;
    private readonly cooldownService;
    constructor(actionRepo: Repository<InquiryAction>, taskRepo: Repository<InquiryTask>, outreachRepo: Repository<OutreachRecord>, screenshotsService: ScreenshotsService, cooldownService: CooldownService);
    takeInquiry(targetId: string, categoryId: string, userId: string): Promise<InquiryTask>;
    submitInquiry(dto: SubmitInquiryDto, screenshotBuffer: Buffer, userId: string): Promise<{
        inquiryTaskId: string;
        performedByUserId: string;
        actionType: import("./dto/submit-inquiry.dto").InquiryActionType;
        screenshotHash: string;
    } & InquiryAction>;
}
