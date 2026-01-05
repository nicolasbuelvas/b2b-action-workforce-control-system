import { Repository, DataSource } from 'typeorm';
import { Company } from './entities/company.entity';
import { ResearchTask } from './entities/research-task.entity';
import { CreateResearchDto } from './dto/create-research.dto';
export declare class ResearchService {
    private readonly dataSource;
    private readonly companyRepo;
    private readonly researchRepo;
    constructor(dataSource: DataSource, companyRepo: Repository<Company>, researchRepo: Repository<ResearchTask>);
    submit(dto: CreateResearchDto, userId: string): Promise<ResearchTask>;
}
