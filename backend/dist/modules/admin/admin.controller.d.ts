import { AdminService } from './admin.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboard(): Promise<{
        totalUsers: number;
        totalResearchers: number;
        totalInquirers: number;
        totalAuditors: number;
        totalActionsSubmitted: number;
        totalActionsApproved: number;
        totalActionsRejected: number;
        approvalRate: number;
    }>;
    getCategories(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        config: {
            cooldownRules: import("../categories/entities/category-config.entity").CooldownRules;
        };
        subAdminCategories: import("../categories/entities/sub-admin-category.entity").SubAdminCategory[];
        metrics: {
            totalResearchers: number;
            totalInquirers: number;
            totalAuditors: number;
            approvalRate: number;
            totalApprovedActions: number;
        };
    }[]>;
    getTopWorkers(): Promise<{
        researchers: any[];
        inquirers: any[];
        auditors: any[];
    }>;
    getSystemLogs(): Promise<({
        id: string;
        taskId: string;
        actionIndex: number;
        performedByUserId: string;
        status: import("../inquiry/entities/inquiry-action.entity").InquiryActionStatus;
        createdAt: Date;
        reviewedAt: Date | null;
        type: string;
    } | {
        id: string;
        researchTaskId: string;
        auditorUserId: string;
        decision: "APPROVED" | "REJECTED";
        rejectionReasonId?: string;
        createdAt: Date;
        type: string;
    })[]>;
    getUsers(page?: string, limit?: string, search?: string, role?: string, status?: string): Promise<{
        users: {
            id: string;
            name: string;
            email: string;
            role: string;
            status: "active" | "suspended";
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUsersStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        suspendedUsers: number;
        subAdmins: number;
    }>;
    updateUserStatus(id: string, body: {
        status: string;
    }): Promise<{
        success: boolean;
    }>;
    resetUserPassword(id: string, body?: {
        password?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        success: boolean;
    }>;
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
