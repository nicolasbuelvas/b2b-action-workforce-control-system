import { Category } from './category.entity';
export interface CooldownRules {
    cooldownDays: number;
    dailyLimits: {
        researcher: number;
        inquirer: number;
        auditor: number;
    };
}
export declare class CategoryConfig {
    id: string;
    category: Category;
    categoryId: string;
    cooldownRules: CooldownRules;
}
