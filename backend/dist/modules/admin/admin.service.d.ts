import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { InquiryAction, InquiryActionStatus } from '../inquiry/entities/inquiry-action.entity';
import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchAudit } from '../audit/entities/research-audit.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';
export declare class AdminService {
    private readonly userRepo;
    private readonly roleRepo;
    private readonly userRoleRepo;
    private readonly inquiryActionRepo;
    private readonly researchTaskRepo;
    private readonly researchAuditRepo;
    private readonly categoryRepo;
    constructor(userRepo: Repository<User>, roleRepo: Repository<Role>, userRoleRepo: Repository<UserRole>, inquiryActionRepo: Repository<InquiryAction>, researchTaskRepo: Repository<ResearchTask>, researchAuditRepo: Repository<ResearchAudit>, categoryRepo: Repository<Category>);
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
    assignCategories(dto: AssignCategoryDto): Promise<{
        userId: string;
        categories: string[];
    }>;
    getSystemLogs(): Promise<({
        id: string;
        taskId: string;
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
        decision: "APPROVED" | "REJECTED";
        rejectionReasonId?: string;
        createdAt: Date;
        type: string;
    })[]>;
    getCategories(): Promise<{
        id: string;
        name: string;
        totalActions: number;
        approvedActions: number;
        rejectedActions: number;
        cooldownDays: number;
        dailyLimits: {};
    }[]>;
    getTopWorkers(): Promise<{
        researchers: any[];
        inquirers: any[];
        auditors: any[];
    }>;
    getSubAdmins(): Promise<UserRole[]>;
}
