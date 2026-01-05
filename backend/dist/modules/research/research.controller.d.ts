import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
export declare class ResearchController {
    private readonly researchService;
    constructor(researchService: ResearchService);
    submit(dto: CreateResearchDto, userId: string): Promise<import("./entities/research-task.entity").ResearchTask>;
}
