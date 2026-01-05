import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
export declare class CategoriesService {
    private readonly categoryRepo;
    constructor(categoryRepo: Repository<Category>);
    findAll(): Promise<Category[]>;
    getById(id: string): Promise<Category>;
    create(name: string): Promise<Category>;
    updateConfig(categoryId: string, cooldownRules: Record<string, any>): Promise<Category>;
}
