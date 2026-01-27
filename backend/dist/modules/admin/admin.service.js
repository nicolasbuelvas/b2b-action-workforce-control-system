"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const user_role_entity_1 = require("../roles/entities/user-role.entity");
const inquiry_action_entity_1 = require("../inquiry/entities/inquiry-action.entity");
const research_task_entity_1 = require("../research/entities/research-task.entity");
const research_audit_entity_1 = require("../audit/entities/research-audit.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const sub_admin_category_entity_1 = require("../categories/entities/sub-admin-category.entity");
const user_category_entity_1 = require("../categories/entities/user-category.entity");
let AdminService = class AdminService {
    constructor(userRepo, roleRepo, userRoleRepo, inquiryActionRepo, researchTaskRepo, researchAuditRepo, categoryRepo, subAdminCategoryRepo, userCategoryRepo) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.userRoleRepo = userRoleRepo;
        this.inquiryActionRepo = inquiryActionRepo;
        this.researchTaskRepo = researchTaskRepo;
        this.researchAuditRepo = researchAuditRepo;
        this.categoryRepo = categoryRepo;
        this.subAdminCategoryRepo = subAdminCategoryRepo;
        this.userCategoryRepo = userCategoryRepo;
    }
    async getDashboard() {
        const totalUsers = await this.userRepo.count();
        const totalResearchers = await this.userRoleRepo
            .createQueryBuilder('ur')
            .innerJoin('ur.role', 'role')
            .where('role.name LIKE :researcher', { researcher: '%researcher%' })
            .getCount();
        const totalInquirers = await this.userRoleRepo
            .createQueryBuilder('ur')
            .innerJoin('ur.role', 'role')
            .where('role.name LIKE :inquirer', { inquirer: '%inquirer%' })
            .getCount();
        const totalAuditors = await this.userRoleRepo
            .createQueryBuilder('ur')
            .innerJoin('ur.role', 'role')
            .where('role.name LIKE :auditor', { auditor: '%auditor%' })
            .getCount();
        const totalActionsSubmitted = await this.inquiryActionRepo.count({
            where: { status: inquiry_action_entity_1.InquiryActionStatus.SUBMITTED },
        });
        const totalActionsApproved = await this.inquiryActionRepo.count({
            where: { status: inquiry_action_entity_1.InquiryActionStatus.APPROVED },
        });
        const totalActionsRejected = await this.inquiryActionRepo.count({
            where: { status: inquiry_action_entity_1.InquiryActionStatus.REJECTED },
        });
        const approvalRate = totalActionsSubmitted > 0 ? (totalActionsApproved / totalActionsSubmitted) * 100 : 0;
        return {
            totalUsers,
            totalResearchers,
            totalInquirers,
            totalAuditors,
            totalActionsSubmitted,
            totalActionsApproved,
            totalActionsRejected,
            approvalRate: Math.round(approvalRate * 100) / 100,
        };
    }
    async createSubAdmin(dto) {
        const user = await this.userRepo.findOne({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const role = await this.roleRepo.findOne({
            where: { name: 'sub_admin' },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role sub_admin not found');
        }
        await this.userRoleRepo.save({
            userId: user.id,
            roleId: role.id,
        });
        return {
            userId: user.id,
            role: role.name,
            categories: dto.categoryIds,
        };
    }
    async getSystemLogs() {
        const recentActions = await this.inquiryActionRepo
            .createQueryBuilder('ia')
            .select(['ia.id', 'ia.status', 'ia.createdat', 'ia.performedbyuserid'])
            .orderBy('ia.createdat', 'DESC')
            .limit(10)
            .getMany();
        const recentAudits = await this.researchAuditRepo
            .createQueryBuilder('ra')
            .select(['ra.id', 'ra.decision', 'ra.createdAt', 'ra.auditorUserId'])
            .orderBy('ra.createdAt', 'DESC')
            .limit(10)
            .getMany();
        const logs = [
            ...recentActions.map(a => ({ type: 'action', ...a })),
            ...recentAudits.map(a => ({ type: 'audit', ...a })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);
        return logs;
    }
    async getCategories() {
        const categories = await this.categoryRepo.find({
            relations: ['config', 'subAdminCategories', 'subAdminCategories.user']
        });
        const result = await Promise.all(categories.map(async (cat) => {
            const totalActions = await this.inquiryActionRepo
                .createQueryBuilder('ia')
                .innerJoin('inquiry_tasks', 'it', 'ia.taskid = it.id')
                .where('it.categoryId = :catId', { catId: cat.id })
                .getCount();
            const approvedActions = await this.inquiryActionRepo
                .createQueryBuilder('ia')
                .innerJoin('inquiry_tasks', 'it', 'ia.taskid = it.id')
                .where('it.categoryId = :catId AND ia.status = :status', { catId: cat.id, status: inquiry_action_entity_1.InquiryActionStatus.APPROVED })
                .getCount();
            const rejectedActions = await this.inquiryActionRepo
                .createQueryBuilder('ia')
                .innerJoin('inquiry_tasks', 'it', 'ia.taskid = it.id')
                .where('it.categoryId = :catId AND ia.status = :status', { catId: cat.id, status: inquiry_action_entity_1.InquiryActionStatus.REJECTED })
                .getCount();
            const totalResearchers = await this.userRoleRepo
                .createQueryBuilder('ur')
                .innerJoin('ur.role', 'role')
                .innerJoin('category_sub_admins', 'sac', 'sac.user_id = ur.userId')
                .where('role.name LIKE :researcher AND sac.category_id = :catId', { researcher: '%researcher%', catId: cat.id })
                .getCount();
            const totalInquirers = await this.userRoleRepo
                .createQueryBuilder('ur')
                .innerJoin('ur.role', 'role')
                .innerJoin('category_sub_admins', 'sac', 'sac.user_id = ur.userId')
                .where('role.name LIKE :inquirer AND sac.category_id = :catId', { inquirer: '%inquirer%', catId: cat.id })
                .getCount();
            const totalAuditors = await this.userRoleRepo
                .createQueryBuilder('ur')
                .innerJoin('ur.role', 'role')
                .innerJoin('category_sub_admins', 'sac', 'sac.user_id = ur.userId')
                .where('role.name LIKE :auditor AND sac.category_id = :catId', { auditor: '%auditor%', catId: cat.id })
                .getCount();
            const approvalRate = totalActions > 0 ? (approvedActions / totalActions) * 100 : 0;
            return {
                id: cat.id,
                name: cat.name,
                isActive: cat.isActive,
                config: {
                    cooldownRules: cat.config ? cat.config.cooldownRules : {
                        cooldownDays: 30,
                        dailyLimits: { researcher: 200, inquirer: 50, auditor: 300 },
                    },
                },
                subAdminCategories: cat.subAdminCategories,
                metrics: {
                    totalResearchers,
                    totalInquirers,
                    totalAuditors,
                    approvalRate: Math.round(approvalRate * 100) / 100,
                    totalApprovedActions: approvedActions,
                },
            };
        }));
        return result;
    }
    async getTopWorkers() {
        const topResearchers = await this.researchTaskRepo
            .createQueryBuilder('rt')
            .select('rt.assignedToUserId', 'userId')
            .addSelect('COUNT(*)', 'count')
            .where('rt.status = :status', { status: 'COMPLETED' })
            .groupBy('rt.assignedToUserId')
            .orderBy('count', 'DESC')
            .limit(3)
            .getRawMany();
        const topInquirers = await this.inquiryActionRepo
            .createQueryBuilder('ia')
            .select('ia.performedbyuserid', 'userId')
            .addSelect('COUNT(*)', 'count')
            .where('ia.status = :status', { status: inquiry_action_entity_1.InquiryActionStatus.APPROVED })
            .groupBy('ia.performedbyuserid')
            .orderBy('count', 'DESC')
            .limit(3)
            .getRawMany();
        const topAuditors = await this.researchAuditRepo
            .createQueryBuilder('ra')
            .select('ra.auditorUserId', 'userId')
            .addSelect('COUNT(*)', 'count')
            .where('ra.decision = :decision', { decision: 'APPROVED' })
            .groupBy('ra.auditorUserId')
            .orderBy('count', 'DESC')
            .limit(3)
            .getRawMany();
        return {
            researchers: topResearchers,
            inquirers: topInquirers,
            auditors: topAuditors,
        };
    }
    async getSubAdmins() {
        return this.userRoleRepo
            .createQueryBuilder('ur')
            .innerJoin('ur.user', 'user')
            .innerJoin('ur.role', 'role')
            .where('role.name = :role', { role: 'sub_admin' })
            .select([
            'user.id',
            'user.email',
            'user.name',
            'role.name',
        ])
            .getMany();
    }
    async getUsers(options) {
        const { page, limit, search, role, status } = options;
        const skip = (page - 1) * limit;
        let query = this.userRepo
            .createQueryBuilder('u')
            .leftJoinAndSelect('u.roles', 'ur')
            .leftJoinAndSelect('ur.role', 'r');
        if (search) {
            query = query.where('u.name ILIKE :search OR u.email ILIKE :search OR u.id::text ILIKE :search', { search: `%${search}%` });
        }
        if (role) {
            query = query.andWhere('r.name = :role', { role });
        }
        if (status) {
            query = query.andWhere('u.status = :status', { status });
        }
        const [users, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.roles?.[0]?.role?.name || 'No Role',
            status: user.status || 'active',
            createdAt: user.createdAt,
            updatedAt: user.createdAt,
        }));
        return {
            users: formattedUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getUsersStats() {
        const totalUsers = await this.userRepo.count();
        const activeUsers = await this.userRepo.count({ where: { status: 'active' } });
        const suspendedUsers = await this.userRepo.count({ where: { status: 'suspended' } });
        const subAdmins = await this.userRoleRepo
            .createQueryBuilder('ur')
            .innerJoin('ur.role', 'role')
            .where('role.name = :role', { role: 'sub_admin' })
            .getCount();
        return {
            totalUsers,
            activeUsers,
            suspendedUsers,
            subAdmins,
        };
    }
    async updateUserStatus(id, status) {
        await this.userRepo.update(id, { status: status });
        return { success: true };
    }
    async updateUserProfile(id, payload) {
        const user = await this.userRepo.findOne({ where: { id }, relations: ['roles', 'roles.role'] });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (payload.name && payload.name.trim().length > 0) {
            user.name = payload.name.trim();
        }
        if (payload.role) {
            const roleEntity = await this.roleRepo.findOne({ where: { name: payload.role } });
            if (!roleEntity) {
                throw new common_1.BadRequestException('Invalid role');
            }
            await this.userRoleRepo.delete({ userId: user.id });
            await this.userRoleRepo.save({ userId: user.id, roleId: roleEntity.id });
        }
        await this.userRepo.save(user);
        return { success: true };
    }
    async resetUserPassword(id, newPassword) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new Error('User not found');
        if (newPassword) {
            user.password_hash = await bcrypt.hash(newPassword, 10);
            await this.userRepo.save(user);
            return { success: true, message: 'Password updated successfully' };
        }
        else {
            return { success: true, message: 'Password reset email sent' };
        }
    }
    async deleteUser(id) {
        await this.userRepo.delete(id);
        return { success: true };
    }
    async assignUserToCategories(dto) {
        const user = await this.userRepo.findOne({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const categories = await this.categoryRepo.find({
            where: { id: (0, typeorm_2.In)(dto.categoryIds) },
        });
        if (categories.length !== dto.categoryIds.length) {
            throw new common_1.NotFoundException('One or more categories not found');
        }
        await this.userCategoryRepo.delete({ userId: dto.userId });
        const assignments = dto.categoryIds.map(categoryId => ({
            userId: dto.userId,
            categoryId,
        }));
        await this.userCategoryRepo.save(assignments);
        return {
            userId: user.id,
            categories: dto.categoryIds,
            message: 'User assigned to categories successfully',
        };
    }
    async removeUserFromCategory(dto) {
        await this.userCategoryRepo.delete({
            userId: dto.userId,
            categoryId: dto.categoryId,
        });
        return {
            message: 'User removed from category successfully',
        };
    }
    async getUserCategories(userId) {
        const userCategories = await this.userCategoryRepo.find({
            where: { userId },
            relations: ['category'],
        });
        return userCategories.map(uc => ({
            id: uc.category.id,
            name: uc.category.name,
            assignedAt: uc.createdAt,
        }));
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(3, (0, typeorm_1.InjectRepository)(inquiry_action_entity_1.InquiryAction)),
    __param(4, (0, typeorm_1.InjectRepository)(research_task_entity_1.ResearchTask)),
    __param(5, (0, typeorm_1.InjectRepository)(research_audit_entity_1.ResearchAudit)),
    __param(6, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(7, (0, typeorm_1.InjectRepository)(sub_admin_category_entity_1.SubAdminCategory)),
    __param(8, (0, typeorm_1.InjectRepository)(user_category_entity_1.UserCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map