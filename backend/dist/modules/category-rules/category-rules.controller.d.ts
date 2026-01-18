import { CategoryRulesService } from './category-rules.service';
import { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';
export declare class CategoryRulesController {
    private readonly categoryRulesService;
    constructor(categoryRulesService: CategoryRulesService);
    findAll(): Promise<import("./entities/category-rule.entity").CategoryRule[]>;
    create(createCategoryRuleDto: CreateCategoryRuleDto): Promise<import("./entities/category-rule.entity").CategoryRule>;
    update(id: string, updateCategoryRuleDto: UpdateCategoryRuleDto): Promise<import("./entities/category-rule.entity").CategoryRule>;
    toggleStatus(id: string): Promise<import("./entities/category-rule.entity").CategoryRule>;
    remove(id: string): Promise<import("./entities/category-rule.entity").CategoryRule>;
}
