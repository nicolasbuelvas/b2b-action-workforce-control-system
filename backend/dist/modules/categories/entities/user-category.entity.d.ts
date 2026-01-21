import { User } from '../../users/entities/user.entity';
import { Category } from './category.entity';
export declare class UserCategory {
    id: string;
    userId: string;
    categoryId: string;
    user: User;
    category: Category;
    createdAt: Date;
}
