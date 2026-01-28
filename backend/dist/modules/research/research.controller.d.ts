import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { SubmitResearchDto } from './dto/submit-research.dto';
export declare class ResearchController {
    private readonly researchService;
    constructor(researchService: ResearchService);
    getWebsiteTasks(userId: string, categoryId?: string): Promise<any[]>;
    getLinkedInTasks(userId: string, categoryId?: string): Promise<any[]>;
    claimTask(taskId: string, userId: string): Promise<import("./entities/research-task.entity").ResearchTask>;
    submitTask(dto: SubmitResearchDto, userId: string, roles: string[]): Promise<{
        taskId: string;
        submissionId: string;
        message: string;
    }>;
    submit(dto: CreateResearchDto, userId: string): Promise<import("./entities/research-task.entity").ResearchTask>;
}
