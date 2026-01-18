import { User } from '../../users/entities/user.entity';
import { Category } from './category.entity';
export declare class SubAdminCategory {
    categoryId: string;
    userId: string;
    user: User;
    category: Category;
}
