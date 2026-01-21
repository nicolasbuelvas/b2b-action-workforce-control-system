import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { SubmitResearchDto } from './dto/submit-research.dto';
export declare class ResearchController {
    private readonly researchService;
    constructor(researchService: ResearchService);
    getWebsiteTasks(userId: string): Promise<any[]>;
    getLinkedInTasks(userId: string): Promise<any[]>;
    claimTask(taskId: string, userId: string): Promise<import("./entities/research-task.entity").ResearchTask>;
    submitTask(dto: SubmitResearchDto, userId: string): Promise<{
        taskId: string;
        submissionId: string;
        message: string;
    }>;
    submit(dto: CreateResearchDto, userId: string): Promise<import("./entities/research-task.entity").ResearchTask>;
}
