import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { InquiryAction, InquiryActionStatus } from '../inquiry/entities/inquiry-action.entity';
import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchAudit } from '../audit/entities/research-audit.entity';
import { Category } from '../categories/entities/category.entity';
import { SubAdminCategory } from '../categories/entities/sub-admin-category.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { DisapprovalReason } from '../subadmin/entities/disapproval-reason.entity';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignUserToCategoriesDto } from './dto/assign-user-categories.dto';
import { RemoveUserFromCategoryDto } from './dto/remove-user-category.dto';
export declare class AdminService {
    private readonly userRepo;
    private readonly roleRepo;
    private readonly userRoleRepo;
    private readonly inquiryActionRepo;
    private readonly researchTaskRepo;
    private readonly researchAuditRepo;
    private readonly categoryRepo;
    private readonly subAdminCategoryRepo;
    private readonly userCategoryRepo;
    private readonly disapprovalReasonRepo;
    constructor(userRepo: Repository<User>, roleRepo: Repository<Role>, userRoleRepo: Repository<UserRole>, inquiryActionRepo: Repository<InquiryAction>, researchTaskRepo: Repository<ResearchTask>, researchAuditRepo: Repository<ResearchAudit>, categoryRepo: Repository<Category>, subAdminCategoryRepo: Repository<SubAdminCategory>, userCategoryRepo: Repository<UserCategory>, disapprovalReasonRepo: Repository<DisapprovalReason>);
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
    createSubAdmin(dto: CreateSubAdminDto): Promise<{
        userId: string;
        role: string;
        categories: string[];
    }>;
    getSystemLogs(): Promise<({
        id: string;
        inquiryTaskId: string;
        actionIndex: number;
        performedByUserId: string;
        status: InquiryActionStatus;
        createdAt: Date;
        reviewedAt: Date | null;
        type: string;
    } | {
        id: string;
        researchTaskId: string;
        auditorUserId: string;
        decision: "APPROVED" | "REJECTED" | "FLAGGED";
        disapprovalReasonId?: string;
        createdAt: Date;
        type: string;
    })[]>;
    getCategories(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        config: {
            cooldownRules: import("../categories/entities/category-config.entity").CooldownRules;
        };
        subAdminCategories: SubAdminCategory[];
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
    getSubAdmins(): Promise<UserRole[]>;
    getUsers(options: {
        page: number;
        limit: number;
        search: string;
        role: string;
        status: string;
    }): Promise<{
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
    updateUserStatus(id: string, status: string): Promise<{
        success: boolean;
    }>;
    updateUserProfile(id: string, payload: {
        name?: string;
        role?: string;
    }): Promise<{
        success: boolean;
    }>;
    resetUserPassword(id: string, newPassword?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        success: boolean;
    }>;
    assignUserToCategories(dto: AssignUserToCategoriesDto): Promise<{
        userId: string;
        categories: string[];
        message: string;
    }>;
    removeUserFromCategory(dto: RemoveUserFromCategoryDto): Promise<{
        message: string;
    }>;
    getUserCategories(userId: string): Promise<{
        id: string;
        name: string;
        assignedAt: Date;
    }[]>;
    getDisapprovalReasons(filters?: {
        search?: string;
        role?: string;
        reasonType?: 'rejection' | 'flag';
        categoryId?: string;
        includeInactive?: boolean;
    }): Promise<{
        reasonType: any;
        applicableRoles: any;
        categoryIds: any;
        id: string;
        reason: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createDisapprovalReason(data: {
        reason: string;
        description?: string;
        reasonType: 'rejection' | 'flag';
        applicableRoles: string[];
        categoryIds?: string[];
        isActive?: boolean;
    }): Promise<DisapprovalReason>;
    updateDisapprovalReason(id: string, data: {
        reason?: string;
        description?: string;
        reasonType?: 'rejection' | 'flag';
        applicableRoles?: string[];
        categoryIds?: string[];
        isActive?: boolean;
    }): Promise<DisapprovalReason>;
}
