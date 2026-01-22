import { Repository, DataSource } from 'typeorm';
import { Company } from './entities/company.entity';
import { ResearchTask } from './entities/research-task.entity';
import { ResearchSubmission } from './entities/research-submission.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { CreateResearchDto } from './dto/create-research.dto';
import { SubmitResearchDto } from './dto/submit-research.dto';
export declare class ResearchService {
    private readonly dataSource;
    private readonly companyRepo;
    private readonly researchRepo;
    private readonly submissionRepo;
    private readonly userCategoryRepo;
    constructor(dataSource: DataSource, companyRepo: Repository<Company>, researchRepo: Repository<ResearchTask>, submissionRepo: Repository<ResearchSubmission>, userCategoryRepo: Repository<UserCategory>);
    getAvailableTasks(userId: string, targetType: 'COMPANY' | 'LINKEDIN', categoryId?: string): Promise<any[]>;
    claimTask(taskId: string, userId: string): Promise<ResearchTask>;
    submitTaskData(dto: SubmitResearchDto, userId: string): Promise<{
        taskId: string;
        submissionId: string;
        message: string;
    }>;
    submit(dto: CreateResearchDto, userId: string): Promise<ResearchTask>;
}
