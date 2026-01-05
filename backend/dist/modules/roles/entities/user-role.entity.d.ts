import { User } from '../../users/entities/user.entity';
export declare class UserRole {
    id: string;
    userId: string;
    roleId: string;
    user: User;
    createdAt: Date;
}
