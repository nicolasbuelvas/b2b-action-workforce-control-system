import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<import("./entities/category.entity").Category[]>;
    create(data: {
        name: string;
        config?: any;
    }): Promise<import("./entities/category.entity").Category>;
    update(id: string, data: any): Promise<import("./entities/category.entity").Category>;
    assignSubAdmins(categoryId: string, userIds: string[]): Promise<import("./entities/category.entity").Category>;
    delete(id: string): Promise<void>;
}
