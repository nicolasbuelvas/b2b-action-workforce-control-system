import { AdminService } from './admin.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createSubAdmin(dto: CreateSubAdminDto): Promise<{
        userId: string;
        role: string;
        categories: string[];
    }>;
    assignCategory(dto: AssignCategoryDto): Promise<{
        userId: string;
        categories: string[];
    }>;
    getSubAdmins(): Promise<import("../roles/entities/user-role.entity").UserRole[]>;
}
