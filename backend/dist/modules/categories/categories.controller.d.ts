import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    updateConfig(categoryId: string, cooldownRules: Record<string, any>): Promise<import("./entities/category.entity").Category>;
}
