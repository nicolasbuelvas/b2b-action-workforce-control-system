import { Repository } from 'typeorm';
import { InquiryAction, InquiryActionStatus } from './entities/inquiry-action.entity';
import { InquiryTask } from './entities/inquiry-task.entity';
import { OutreachRecord } from './entities/outreach-record.entity';
import { ScreenshotsService } from '../screenshots/screenshots.service';
import { CooldownService } from '../cooldown/cooldown.service';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchSubmission } from '../research/entities/research-submission.entity';
import { Company } from '../research/entities/company.entity';
import { Category } from '../categories/entities/category.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
export declare class InquiryService {
    private readonly actionRepo;
    private readonly taskRepo;
    private readonly outreachRepo;
    private readonly researchRepo;
    private readonly submissionRepo;
    private readonly companyRepo;
    private readonly categoryRepo;
    private readonly userCategoryRepo;
    private readonly screenshotsService;
    private readonly cooldownService;
    constructor(actionRepo: Repository<InquiryAction>, taskRepo: Repository<InquiryTask>, outreachRepo: Repository<OutreachRecord>, researchRepo: Repository<ResearchTask>, submissionRepo: Repository<ResearchSubmission>, companyRepo: Repository<Company>, categoryRepo: Repository<Category>, userCategoryRepo: Repository<UserCategory>, screenshotsService: ScreenshotsService, cooldownService: CooldownService);
    getAvailableTasks(userId: string, type: 'website' | 'linkedin'): Promise<any[]>;
    takeInquiry(researchTaskId: string, userId: string): Promise<InquiryTask>;
    submitInquiry(dto: SubmitInquiryDto, screenshotBuffer: Buffer, userId: string): Promise<{
        inquiryTaskId: string;
        actionIndex: number;
        performedByUserId: string;
        status: InquiryActionStatus.PENDING;
    } & InquiryAction>;
}
