import { CategoryConfig } from './category-config.entity';
import { SubAdminCategory } from './sub-admin-category.entity';
export declare class Category {
    id: string;
    name: string;
    isActive: boolean;
    config: CategoryConfig;
    subAdminCategories: SubAdminCategory[];
    createdAt: Date;
}
