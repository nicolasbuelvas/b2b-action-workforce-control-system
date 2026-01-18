import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryConfig } from './entities/category-config.entity';
import { SubAdminCategory } from './entities/sub-admin-category.entity';
export declare class CategoriesService {
    private readonly categoryRepo;
    private readonly categoryConfigRepo;
    private readonly subAdminCategoryRepo;
    constructor(categoryRepo: Repository<Category>, categoryConfigRepo: Repository<CategoryConfig>, subAdminCategoryRepo: Repository<SubAdminCategory>);
    findAll(): Promise<Category[]>;
    getById(id: string): Promise<Category>;
    create(name: string, config?: any): Promise<Category>;
    update(id: string, data: any): Promise<Category>;
    updateConfig(categoryId: string, configData: Partial<CategoryConfig>): Promise<Category>;
    assignSubAdmins(categoryId: string, userIds: string[]): Promise<Category>;
    delete(id: string): Promise<void>;
    getMetrics(categoryId: string): Promise<{
        totalResearchers: number;
        totalInquirers: number;
        totalAuditors: number;
        approvalRate: number;
        totalApprovedActions: number;
    }>;
}
