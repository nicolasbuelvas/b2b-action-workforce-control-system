import { Repository, EntityManager } from 'typeorm';
import { CooldownRecord } from './entities/cooldown-record.entity';
import { CategoriesService } from '../categories/categories.service';
export declare class CooldownService {
    private readonly cooldownRepo;
    private readonly categoriesService;
    constructor(cooldownRepo: Repository<CooldownRecord>, categoriesService: CategoriesService);
    enforceCooldown(params: {
        userId: string;
        targetId: string;
        categoryId: string;
        actionType: string;
    }): Promise<void>;
    recordAction(params: {
        userId: string;
        targetId: string;
        categoryId: string;
        actionType: string;
        manager?: EntityManager;
    }): Promise<void>;
}
