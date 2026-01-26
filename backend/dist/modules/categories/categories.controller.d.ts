import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        subAdminCategories: any[];
        id: string;
        name: string;
        isActive: boolean;
        config: import("./entities/category-config.entity").CategoryConfig;
        createdAt: Date;
    }[]>;
    create(data: {
        name: string;
        config?: any;
    }): Promise<import("./entities/category.entity").Category>;
    update(id: string, data: any): Promise<import("./entities/category.entity").Category>;
    assignSubAdmins(categoryId: string, body: any): Promise<import("./entities/category.entity").Category>;
    delete(id: string): Promise<void>;
}
