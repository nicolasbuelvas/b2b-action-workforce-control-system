import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';
export declare class AdminService {
    private readonly userRepo;
    private readonly roleRepo;
    private readonly userRoleRepo;
    constructor(userRepo: Repository<User>, roleRepo: Repository<Role>, userRoleRepo: Repository<UserRole>);
    getDashboard(): Promise<{
        usersCount: number;
        subAdminsCount: number;
        status: string;
    }>;
    createSubAdmin(dto: CreateSubAdminDto): Promise<{
        userId: string;
        role: string;
        categories: string[];
    }>;
    assignCategories(dto: AssignCategoryDto): Promise<{
        userId: string;
        categories: string[];
    }>;
    getSubAdmins(): Promise<UserRole[]>;
}
