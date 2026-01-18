"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const user_role_entity_1 = require("../roles/entities/user-role.entity");
const inquiry_action_entity_1 = require("../inquiry/entities/inquiry-action.entity");
const research_task_entity_1 = require("../research/entities/research-task.entity");
const research_audit_entity_1 = require("../audit/entities/research-audit.entity");
const category_entity_1 = require("../categories/entities/category.entity");
let AdminService = class AdminService {
    constructor(userRepo, roleRepo, userRoleRepo, inquiryActionRepo, researchTaskRepo, researchAuditRepo, categoryRepo) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.userRoleRepo = userRoleRepo;
        this.inquiryActionRepo = inquiryActionRepo;
        this.researchTaskRepo = researchTaskRepo;
        this.researchAuditRepo = researchAuditRepo;
        this.categoryRepo = categoryRepo;
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
    async assignCategories(dto) {
        const user = await this.userRepo.findOne({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            userId: user.id,
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
        const categories = await this.categoryRepo.find({ relations: ['config'] });
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
            return {
                id: cat.id,
                name: cat.name,
                totalActions,
                approvedActions,
                rejectedActions,
                cooldownDays: 30,
                dailyLimits: {},
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map