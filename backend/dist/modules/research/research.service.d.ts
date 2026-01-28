import { Repository, DataSource } from 'typeorm';
import { DailyLimitValidationService } from '../../common/services/daily-limit-validation.service';
import { Company } from './entities/company.entity';
import { ResearchTask } from './entities/research-task.entity';
import { ResearchSubmission } from './entities/research-submission.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { CreateResearchDto } from './dto/create-research.dto';
import { SubmitResearchDto } from './dto/submit-research.dto';
import { LinkedInProfile } from './entities/linkedin-profile.entity';
export declare class ResearchService {
    private readonly dataSource;
    private readonly dailyLimitValidationService;
    private readonly companyRepo;
    private readonly researchRepo;
    private readonly submissionRepo;
    private readonly userCategoryRepo;
    private readonly linkedinProfileRepo;
    constructor(dataSource: DataSource, dailyLimitValidationService: DailyLimitValidationService, companyRepo: Repository<Company>, researchRepo: Repository<ResearchTask>, submissionRepo: Repository<ResearchSubmission>, userCategoryRepo: Repository<UserCategory>, linkedinProfileRepo: Repository<LinkedInProfile>);
    private isUuid;
    getAvailableTasks(userId: string, targetTypes: Array<'COMPANY' | 'LINKEDIN' | 'LINKEDIN_PROFILE'>, categoryId?: string): Promise<any[]>;
    claimTask(taskId: string, userId: string): Promise<ResearchTask>;
    submitTaskData(dto: SubmitResearchDto, userId: string, roles?: string[]): Promise<{
        taskId: string;
        submissionId: string;
        message: string;
    }>;
    private resolveUserRole;
    submit(dto: CreateResearchDto, userId: string): Promise<ResearchTask>;
}
