import { CategoryConfig } from './category-config.entity';
export declare class Category {
    id: string;
    name: string;
    isActive: boolean;
    config: CategoryConfig;
    createdAt: Date;
}
