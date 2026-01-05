import { User } from '../../users/entities/user.entity';
import { Role } from './role.entity';
export declare class UserRole {
    id: string;
    userId: string;
    roleId: string;
    user: User;
    role: Role;
    createdAt: Date;
}
