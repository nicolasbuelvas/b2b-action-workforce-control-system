import { UserRole } from '../../roles/entities/user-role.entity';
export declare class User {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    country: string;
    profile_picture: string;
    trust_score: number;
    status: 'active' | 'suspended';
    createdAt: Date;
    roles: UserRole[];
}
