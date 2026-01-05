import { AdminService } from './admin.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createSubAdmin(dto: CreateSubAdminDto): {
        userId: string;
        categories: string[];
        role: string;
    };
    assignCategory(dto: AssignCategoryDto): {
        userId: string;
        categories: string[];
    };
    getSubAdmins(): {
        userId: string;
        categories: string[];
    }[];
}
