import { Repository } from 'typeorm';
import { CategoryRule } from './entities/category-rule.entity';
import { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';
import { Category } from '../categories/entities/category.entity';
export declare class CategoryRulesService {
    private readonly categoryRuleRepo;
    private readonly categoryRepo;
    constructor(categoryRuleRepo: Repository<CategoryRule>, categoryRepo: Repository<Category>);
    findAll(): Promise<CategoryRule[]>;
    findOne(id: string): Promise<CategoryRule>;
    create(dto: CreateCategoryRuleDto): Promise<CategoryRule>;
    update(id: string, dto: UpdateCategoryRuleDto): Promise<CategoryRule>;
    remove(id: string): Promise<CategoryRule>;
    toggleStatus(id: string): Promise<CategoryRule>;
    seedInitialRules(): Promise<void>;
    getEffectiveConfig(categoryId: string, actionType: string, role: string): Promise<{
        dailyLimit: number | null;
        cooldownDays: number | null;
        requiredActions: number;
        screenshotRequired: boolean;
    }>;
    getApplicableRules(categoryId: string, actionType: string, role: string): Promise<CategoryRule[]>;
}
