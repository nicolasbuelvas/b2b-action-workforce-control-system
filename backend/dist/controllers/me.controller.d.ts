import { Repository } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { SubAdminCategory } from '../modules/categories/entities/sub-admin-category.entity';
export declare class MeController {
    private readonly userRepo;
    private readonly subAdminCategoryRepo;
    constructor(userRepo: Repository<User>, subAdminCategoryRepo: Repository<SubAdminCategory>);
    getMe(user: any): Promise<{
        id: any;
        role: any;
        categories: string[];
    }>;
}
