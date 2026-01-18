import { Category } from '../../categories/entities/category.entity';
export declare enum RuleStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare class CategoryRule {
    id: string;
    categoryId: string;
    category: Category;
    actionType: string;
    role: string;
    dailyLimitOverride: number;
    cooldownDaysOverride: number;
    requiredActions: number;
    screenshotRequired: boolean;
    status: RuleStatus;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}
