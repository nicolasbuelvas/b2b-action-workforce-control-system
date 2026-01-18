import { RuleStatus } from '../entities/category-rule.entity';
export declare class CreateCategoryRuleDto {
    categoryId: string;
    actionType: string;
    role: string;
    dailyLimitOverride?: number;
    cooldownDaysOverride?: number;
    requiredActions?: number;
    screenshotRequired?: boolean;
    status?: RuleStatus;
    priority?: number;
}
