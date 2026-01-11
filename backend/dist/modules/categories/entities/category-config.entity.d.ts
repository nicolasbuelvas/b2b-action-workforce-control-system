import { Category } from './category.entity';
export interface CooldownRule {
    actionsRequired: number;
    cooldownMs: number;
    dailyLimit?: number;
}
export declare class CategoryConfig {
    id: string;
    category: Category;
    cooldownRules: Record<string, CooldownRule>;
}
