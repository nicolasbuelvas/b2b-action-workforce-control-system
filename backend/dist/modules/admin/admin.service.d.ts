import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';
export declare class AdminService {
    private subAdmins;
    createSubAdmin(dto: CreateSubAdminDto): {
        userId: string;
        categories: string[];
        role: string;
    };
    assignCategories(dto: AssignCategoryDto): {
        userId: string;
        categories: string[];
    };
    getSubAdmins(): {
        userId: string;
        categories: string[];
    }[];
}
