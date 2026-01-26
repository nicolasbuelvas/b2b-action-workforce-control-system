import { Repository, DataSource } from 'typeorm';
import { Company } from './entities/company.entity';
import { ResearchTask } from './entities/research-task.entity';
import { ResearchSubmission } from './entities/research-submission.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { CreateResearchDto } from './dto/create-research.dto';
import { SubmitResearchDto } from './dto/submit-research.dto';
import { LinkedInProfile } from './entities/linkedin-profile.entity';
export declare class ResearchService {
    private readonly dataSource;
    private readonly companyRepo;
    private readonly researchRepo;
    private readonly submissionRepo;
    private readonly userCategoryRepo;
    private readonly linkedinProfileRepo;
    constructor(dataSource: DataSource, companyRepo: Repository<Company>, researchRepo: Repository<ResearchTask>, submissionRepo: Repository<ResearchSubmission>, userCategoryRepo: Repository<UserCategory>, linkedinProfileRepo: Repository<LinkedInProfile>);
    getAvailableTasks(userId: string, targetTypes: Array<'COMPANY' | 'LINKEDIN' | 'LINKEDIN_PROFILE'>, categoryId?: string): Promise<any[]>;
    claimTask(taskId: string, userId: string): Promise<ResearchTask>;
    submitTaskData(dto: SubmitResearchDto, userId: string): Promise<{
        taskId: string;
        submissionId: string;
        message: string;
    }>;
    submit(dto: CreateResearchDto, userId: string): Promise<ResearchTask>;
}
