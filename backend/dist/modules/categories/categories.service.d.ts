import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryConfig } from './entities/category-config.entity';
import { UserCategory } from './entities/user-category.entity';
import { User } from '../users/entities/user.entity';
export declare class CategoriesService {
    private readonly categoryRepo;
    private readonly categoryConfigRepo;
    private readonly userCategoryRepo;
    private readonly userRepo;
    constructor(categoryRepo: Repository<Category>, categoryConfigRepo: Repository<CategoryConfig>, userCategoryRepo: Repository<UserCategory>, userRepo: Repository<User>);
    findAll(): Promise<{
        subAdminCategories: any[];
        id: string;
        name: string;
        isActive: boolean;
        config: CategoryConfig;
        createdAt: Date;
    }[]>;
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
