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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const research_task_entity_1 = require("../research/entities/research-task.entity");
const research_submission_entity_1 = require("../research/entities/research-submission.entity");
const research_audit_entity_1 = require("./entities/research-audit.entity");
const flagged_action_entity_1 = require("./entities/flagged-action.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const user_category_entity_1 = require("../categories/entities/user-category.entity");
const company_entity_1 = require("../research/entities/company.entity");
const user_entity_1 = require("../users/entities/user.entity");
const inquiry_task_entity_1 = require("../inquiry/entities/inquiry-task.entity");
const inquiry_action_entity_1 = require("../inquiry/entities/inquiry-action.entity");
const outreach_record_entity_1 = require("../inquiry/entities/outreach-record.entity");
const inquiry_submission_snapshot_entity_1 = require("../inquiry/entities/inquiry-submission-snapshot.entity");
const screenshots_service_1 = require("../screenshots/screenshots.service");
const linkedin_profile_entity_1 = require("../research/entities/linkedin-profile.entity");
const disapproval_reason_entity_1 = require("../subadmin/entities/disapproval-reason.entity");
const user_role_entity_1 = require("../roles/entities/user-role.entity");
const role_entity_1 = require("../roles/entities/role.entity");
let AuditService = class AuditService {
    constructor(researchRepo, auditRepo, submissionRepo, flaggedRepo, categoryRepo, userCategoryRepo, companyRepo, userRepo, inquiryTaskRepo, inquiryActionRepo, outreachRepo, snapshotRepo, linkedinProfileRepo, disapprovalReasonRepo, userRoleRepo, roleRepo, screenshotsService) {
        this.researchRepo = researchRepo;
        this.auditRepo = auditRepo;
        this.submissionRepo = submissionRepo;
        this.flaggedRepo = flaggedRepo;
        this.categoryRepo = categoryRepo;
        this.userCategoryRepo = userCategoryRepo;
        this.companyRepo = companyRepo;
        this.userRepo = userRepo;
        this.inquiryTaskRepo = inquiryTaskRepo;
        this.inquiryActionRepo = inquiryActionRepo;
        this.outreachRepo = outreachRepo;
        this.snapshotRepo = snapshotRepo;
        this.linkedinProfileRepo = linkedinProfileRepo;
        this.disapprovalReasonRepo = disapprovalReasonRepo;
        this.userRoleRepo = userRoleRepo;
        this.roleRepo = roleRepo;
        this.screenshotsService = screenshotsService;
    }
    async getUserRoleNames(userId) {
        const roles = await this.userRoleRepo.find({ where: { userId } });
        return roles.map(r => r.role?.name).filter(Boolean);
    }
    async getAuditorCategoryIds(userId) {
        const userCategories = await this.userCategoryRepo.find({
            where: { userId },
            select: ['categoryId'],
        });
        return userCategories.map(uc => uc.categoryId);
    }
    async validateDisapprovalReason(reasonId, options) {
        const reason = await this.disapprovalReasonRepo.findOne({ where: { id: reasonId } });
        if (!reason) {
            throw new common_1.BadRequestException('Invalid disapproval reason');
        }
        if (!reason.isActive) {
            throw new common_1.BadRequestException('Disapproval reason is inactive');
        }
        if (reason.reasonType !== options.expectedType) {
            throw new common_1.BadRequestException(`Reason must be of type ${options.expectedType}`);
        }
        if (reason.categoryIds?.length && !reason.categoryIds.includes(options.categoryId)) {
            throw new common_1.ForbiddenException('Reason not allowed for this category');
        }
        if (reason.applicableRoles?.length) {
            const allowed = reason.applicableRoles.some(role => options.userRoles.includes(role));
            if (!allowed) {
                throw new common_1.ForbiddenException('Reason not allowed for your role');
            }
        }
        return reason;
    }
    async getDisapprovalReasonsForAuditor(auditorUserId, filters) {
        const userRoles = await this.getUserRoleNames(auditorUserId);
        if (userRoles.length === 0) {
            return [];
        }
        const categoryIds = await this.getAuditorCategoryIds(auditorUserId);
        if (categoryIds.length === 0) {
            return [];
        }
        const targetCategories = filters.categoryId ? [filters.categoryId] : categoryIds;
        if (filters.categoryId && !categoryIds.includes(filters.categoryId)) {
            throw new common_1.ForbiddenException('Category not assigned to you');
        }
        try {
            const qb = this.disapprovalReasonRepo
                .createQueryBuilder('dr')
                .where('dr.isActive = true')
                .andWhere('dr.reasonType = :reasonType', { reasonType: filters.reasonType })
                .andWhere('(dr."categoryIds" = :emptyArray OR dr."categoryIds" && :categoryIds)', {
                emptyArray: '{}',
                categoryIds: targetCategories,
            })
                .andWhere('(dr."applicableRoles" && :roles)', { roles: filters.role ? [filters.role] : userRoles });
            if (filters.search) {
                qb.andWhere('(dr.description ILIKE :search)', {
                    search: `%${filters.search}%`,
                });
            }
            qb.orderBy('dr.description', 'ASC');
            return await qb.getMany();
        }
        catch (err) {
            console.warn('New schema columns not found, using fallback:', err.message);
            const qb = this.disapprovalReasonRepo
                .createQueryBuilder('dr')
                .select(['dr.id', 'dr.reason', 'dr.description', 'dr.isActive'])
                .where('dr.isActive = true');
            if (filters.search) {
                qb.andWhere('(dr.description ILIKE :search)', {
                    search: `%${filters.search}%`,
                });
            }
            qb.orderBy('dr.description', 'ASC');
            const rows = await qb.getMany();
            return rows.map(r => ({
                ...r,
                reasonType: r.reasonType ?? 'rejection',
                applicableRoles: r.applicableRoles ?? [],
                categoryIds: r.categoryIds ?? [],
            }));
        }
    }
    async getPendingResearch(auditorUserId) {
        const userCategories = await this.userCategoryRepo.find({
            where: { userId: auditorUserId },
            select: ['categoryId'],
        });
        const categoryIds = userCategories.map(uc => uc.categoryId);
        if (categoryIds.length === 0) {
            return [];
        }
        const tasks = await this.researchRepo
            .createQueryBuilder('task')
            .where('task.status = :status', { status: research_task_entity_1.ResearchStatus.SUBMITTED })
            .andWhere('task.categoryId IN (:...categoryIds)', { categoryIds })
            .orderBy('task.createdAt', 'ASC')
            .getMany();
        const enriched = await Promise.all(tasks.map(async (task) => {
            const [submission, category, worker] = await Promise.all([
                this.submissionRepo.findOne({
                    where: { researchTaskId: task.id },
                    order: { createdAt: 'DESC' },
                }),
                this.categoryRepo.findOne({ where: { id: task.categoryId } }),
                this.userRepo.findOne({ where: { id: task.assignedToUserId } }),
            ]);
            let company = null;
            if (task.targetType === 'COMPANY') {
                company = await this.companyRepo.findOne({ where: { id: task.targetId } });
            }
            let linkedInProfile = null;
            if (task.targetType === 'LINKEDIN_PROFILE') {
                linkedInProfile = await this.linkedinProfileRepo.findOne({ where: { id: task.targetId } });
            }
            return {
                task,
                submission,
                category,
                company,
                worker,
                linkedInProfile,
            };
        }));
        return enriched.map(item => ({
            id: item.task.id,
            categoryId: item.task.categoryId,
            categoryName: item.category?.name || '',
            assignedToUserId: item.task.assignedToUserId,
            workerName: item.worker?.name || '',
            workerEmail: item.worker?.email || '',
            targetId: item.task.targetId,
            companyName: item.company?.name || '',
            companyDomain: item.company?.domain || '',
            companyCountry: item.company?.country || '',
            linkedInUrl: item.linkedInProfile?.url || (item.task.targetType === 'LINKEDIN' ? item.task.targetId : ''),
            linkedInContactName: item.linkedInProfile?.contactName || item.submission?.contactName || '',
            linkedInCountry: item.linkedInProfile?.country || item.submission?.country || '',
            linkedInLanguage: item.linkedInProfile?.language || item.submission?.language || '',
            targetType: item.task.targetType,
            createdAt: item.task.createdAt,
            submission: item.submission,
        }));
    }
    async auditResearch(researchTaskId, dto, auditorUserId) {
        const task = await this.researchRepo.findOne({
            where: { id: researchTaskId },
        });
        if (!task) {
            throw new common_1.BadRequestException('Research task not found');
        }
        if (task.status !== research_task_entity_1.ResearchStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Research task not ready for audit');
        }
        if (task.assignedToUserId === auditorUserId) {
            throw new common_1.ForbiddenException('Auditor cannot audit own submission');
        }
        const userRoles = await this.getUserRoleNames(auditorUserId);
        const expectedType = dto.decision === 'REJECTED' ? 'rejection' : dto.decision === 'FLAGGED' ? 'flag' : null;
        let reason = null;
        if (expectedType) {
            if (!dto.reasonId) {
                throw new common_1.BadRequestException('reasonId is required for this decision');
            }
            reason = await this.validateDisapprovalReason(dto.reasonId, {
                categoryId: task.categoryId,
                expectedType,
                userRoles,
            });
        }
        await this.auditRepo.save({
            researchTaskId,
            auditorUserId,
            decision: dto.decision,
            disapprovalReasonId: reason?.id,
        });
        if (dto.decision === 'APPROVED') {
            task.status = research_task_entity_1.ResearchStatus.COMPLETED;
        }
        else {
            task.status = research_task_entity_1.ResearchStatus.REJECTED;
            await this.flaggedRepo.save({
                userId: task.assignedToUserId,
                targetId: researchTaskId,
                actionType: dto.decision === 'FLAGGED' ? 'RESEARCH_FLAG' : 'RESEARCH',
                reason: reason?.reason || 'Manual review required',
            });
        }
        return this.researchRepo.save(task);
    }
    async getPendingInquiry(auditorUserId) {
        const userCategories = await this.userCategoryRepo.find({
            where: { userId: auditorUserId },
            select: ['categoryId'],
        });
        const categoryIds = userCategories.map(uc => uc.categoryId);
        if (categoryIds.length === 0) {
            return [];
        }
        const tasks = await this.inquiryTaskRepo
            .createQueryBuilder('task')
            .where('task.status = :status', { status: inquiry_task_entity_1.InquiryStatus.COMPLETED })
            .andWhere('task.categoryId IN (:...categoryIds)', { categoryIds })
            .orderBy('task.createdAt', 'ASC')
            .getMany();
        const enriched = await Promise.all(tasks.map(async (task) => {
            const snapshot = await this.snapshotRepo.findOne({
                where: { inquiryTaskId: task.id },
                order: { createdAt: 'DESC' },
            });
            const [action, category, worker] = await Promise.all([
                this.inquiryActionRepo.findOne({
                    where: { inquiryTaskId: task.id },
                    order: { createdAt: 'DESC' },
                }),
                this.categoryRepo.findOne({ where: { id: task.categoryId } }),
                this.userRepo.findOne({ where: { id: task.assignedToUserId } }),
            ]);
            const outreach = action
                ? await this.outreachRepo.findOne({
                    where: { inquiryActionId: action.id },
                })
                : null;
            return {
                task,
                action,
                outreach,
                category,
                worker,
                snapshot,
            };
        }));
        return enriched.map(item => ({
            id: item.task.id,
            categoryId: item.task.categoryId,
            categoryName: item.category?.name || '',
            assignedToUserId: item.task.assignedToUserId,
            workerName: item.worker?.name || '',
            workerEmail: item.worker?.email || '',
            targetId: item.task.targetId,
            companyName: item.snapshot?.companyName || '',
            companyDomain: item.snapshot?.companyUrl || '',
            companyCountry: item.snapshot?.country || '',
            language: item.snapshot?.language || '',
            actionType: item.outreach?.actionType || 'UNKNOWN',
            createdAt: item.task.createdAt,
            actionCreatedAt: item.action?.createdAt || null,
            action: item.action,
            outreach: item.outreach,
            screenshotUrl: item.snapshot?.screenshotPath ? `/api/screenshots/${item.action?.id}` : null,
            isDuplicate: item.snapshot?.isDuplicate || false,
        }));
    }
    async auditInquiry(inquiryTaskId, dto, auditorUserId) {
        const task = await this.inquiryTaskRepo.findOne({
            where: { id: inquiryTaskId },
        });
        if (!task) {
            throw new common_1.BadRequestException('Inquiry task not found');
        }
        if (task.status !== inquiry_task_entity_1.InquiryStatus.COMPLETED) {
            throw new common_1.BadRequestException('Inquiry task not ready for audit');
        }
        if (task.assignedToUserId === auditorUserId) {
            throw new common_1.ForbiddenException('Auditor cannot audit own submission');
        }
        const userRoles = await this.getUserRoleNames(auditorUserId);
        const snapshot = await this.snapshotRepo.findOne({
            where: { inquiryTaskId: task.id },
            order: { createdAt: 'DESC' },
        });
        if (snapshot?.isDuplicate && dto.decision === 'APPROVED') {
            throw new common_1.BadRequestException('Cannot approve submission with duplicate screenshot. Please reject with reason "Duplicate Screenshot".');
        }
        const expectedType = dto.decision === 'REJECTED' ? 'rejection' : dto.decision === 'FLAGGED' ? 'flag' : null;
        let reason = null;
        if (expectedType) {
            if (!dto.reasonId) {
                throw new common_1.BadRequestException('reasonId is required for this decision');
            }
            reason = await this.validateDisapprovalReason(dto.reasonId, {
                categoryId: task.categoryId,
                expectedType,
                userRoles,
            });
        }
        task.status =
            dto.decision === 'APPROVED'
                ? inquiry_task_entity_1.InquiryStatus.APPROVED
                : dto.decision === 'FLAGGED'
                    ? inquiry_task_entity_1.InquiryStatus.FLAGGED
                    : inquiry_task_entity_1.InquiryStatus.REJECTED;
        if (dto.decision === 'REJECTED' || dto.decision === 'FLAGGED') {
            await this.flaggedRepo.save({
                userId: task.assignedToUserId,
                targetId: inquiryTaskId,
                actionType: dto.decision === 'FLAGGED' ? 'INQUIRY_FLAG' : 'INQUIRY',
                reason: reason?.reason || (snapshot?.isDuplicate ? 'Duplicate (System Detected)' : 'Manual review required'),
            });
        }
        await this.inquiryTaskRepo.save(task);
        if (snapshot?.inquiryActionId) {
            await this.screenshotsService.deleteScreenshotByActionId(snapshot.inquiryActionId);
            console.log('[AUDIT] Screenshot deleted for inquiry action:', snapshot.inquiryActionId);
        }
        return task;
    }
    async getPendingLinkedInInquiry(auditorUserId) {
        const userCategories = await this.userCategoryRepo.find({
            where: { userId: auditorUserId },
            select: ['categoryId'],
        });
        const categoryIds = userCategories.map(uc => uc.categoryId);
        if (categoryIds.length === 0) {
            return [];
        }
        const tasks = await this.inquiryTaskRepo
            .createQueryBuilder('task')
            .where('task.status = :status', { status: inquiry_task_entity_1.InquiryStatus.COMPLETED })
            .andWhere('task.platform = :platform', { platform: 'LINKEDIN' })
            .andWhere('task.categoryId IN (:...categoryIds)', { categoryIds })
            .orderBy('task.createdAt', 'ASC')
            .getMany();
        const actionRepo = this.inquiryTaskRepo.manager.getRepository(inquiry_action_entity_1.InquiryAction);
        const snapshotRepo = this.inquiryTaskRepo.manager.getRepository(inquiry_submission_snapshot_entity_1.InquirySubmissionSnapshot);
        const enriched = await Promise.all(tasks.map(async (task) => {
            const actions = await actionRepo.find({
                where: { inquiryTaskId: task.id },
                order: { createdAt: 'ASC' },
            });
            const snapshots = await snapshotRepo.find({
                where: { inquiryTaskId: task.id },
                order: { createdAt: 'ASC' },
            });
            const category = await this.categoryRepo.findOne({
                where: { id: task.categoryId },
            });
            const worker = await this.userRepo.findOne({
                where: { id: task.assignedToUserId },
            });
            return { task, actions, snapshots, category, worker };
        }));
        const actionTypeMap = {
            1: 'LINKEDIN_OUTREACH',
            2: 'LINKEDIN_EMAIL_REQUEST',
            3: 'LINKEDIN_CATALOGUE',
        };
        return enriched.map(item => ({
            id: item.task.id,
            categoryId: item.task.categoryId,
            categoryName: item.category?.name || '',
            assignedToUserId: item.task.assignedToUserId,
            workerName: item.worker?.name || '',
            workerEmail: item.worker?.email || '',
            targetId: item.task.targetId,
            status: item.task.status,
            createdAt: item.task.createdAt,
            actions: item.actions.map(action => {
                const snapshot = item.snapshots.find(s => s.inquiryActionId === action.id);
                return {
                    id: action.id,
                    actionType: actionTypeMap[action.actionIndex] || `STEP_${action.actionIndex}`,
                    status: action.status,
                    screenshotUrl: snapshot?.screenshotPath ? `/api/screenshots/${action.id}` : null,
                    isDuplicate: snapshot?.isDuplicate || false,
                };
            }),
        }));
    }
    async auditLinkedInInquiry(inquiryTaskId, actionId, dto, auditorUserId) {
        const actionRepo = this.inquiryTaskRepo.manager.getRepository(inquiry_action_entity_1.InquiryAction);
        const snapshotRepo = this.inquiryTaskRepo.manager.getRepository(inquiry_submission_snapshot_entity_1.InquirySubmissionSnapshot);
        const task = await this.inquiryTaskRepo.findOne({ where: { id: inquiryTaskId } });
        if (!task) {
            throw new common_1.BadRequestException('Inquiry task not found');
        }
        if (task.platform !== 'LINKEDIN') {
            throw new common_1.BadRequestException('Task is not a LinkedIn inquiry task');
        }
        const action = await actionRepo.findOne({ where: { id: actionId } });
        if (!action) {
            throw new common_1.BadRequestException('Action not found');
        }
        if (action.inquiryTaskId !== inquiryTaskId) {
            throw new common_1.BadRequestException('Action does not belong to this task');
        }
        const snapshot = await snapshotRepo.findOne({ where: { inquiryActionId: actionId } });
        if (!snapshot) {
            throw new common_1.BadRequestException('Snapshot not found');
        }
        const userRoles = await this.getUserRoleNames(auditorUserId);
        const expectedType = dto.decision === 'REJECTED' ? 'rejection' : dto.decision === 'FLAGGED' ? 'flag' : null;
        let reason = null;
        if (expectedType) {
            if (!dto.reasonId) {
                throw new common_1.BadRequestException('reasonId is required for this decision');
            }
            reason = await this.validateDisapprovalReason(dto.reasonId, {
                categoryId: task.categoryId,
                expectedType,
                userRoles,
            });
        }
        if (snapshot?.isDuplicate && dto.decision === 'APPROVED') {
            console.log('[LINKEDIN-AUDIT] Warning: Approving action with duplicate screenshot', {
                actionId,
                taskId: inquiryTaskId,
            });
        }
        action.status =
            dto.decision === 'APPROVED' ? inquiry_action_entity_1.InquiryActionStatus.APPROVED : inquiry_action_entity_1.InquiryActionStatus.REJECTED;
        action.reviewedAt = new Date();
        await actionRepo.save(action);
        if (dto.decision === 'REJECTED' || dto.decision === 'FLAGGED') {
            await this.flaggedRepo.save({
                userId: task.assignedToUserId,
                targetId: inquiryTaskId,
                actionType: dto.decision === 'FLAGGED' ? 'LINKEDIN_INQUIRY_FLAG' : 'LINKEDIN_INQUIRY',
                reason: reason?.reason || (snapshot?.isDuplicate ? 'Duplicate (System Detected)' : 'Manual review required'),
            });
        }
        const allActions = await actionRepo.find({
            where: { inquiryTaskId },
        });
        const allApproved = allActions.every(a => a.status === inquiry_action_entity_1.InquiryActionStatus.APPROVED);
        const anyRejected = allActions.some(a => a.status === inquiry_action_entity_1.InquiryActionStatus.REJECTED);
        const hasFlag = dto.decision === 'FLAGGED' || (await this.flaggedRepo.count({
            where: { targetId: inquiryTaskId, actionType: 'LINKEDIN_INQUIRY_FLAG' },
        })) > 0;
        if (hasFlag) {
            task.status = inquiry_task_entity_1.InquiryStatus.FLAGGED;
        }
        else if (allApproved) {
            task.status = inquiry_task_entity_1.InquiryStatus.APPROVED;
        }
        else if (anyRejected) {
            task.status = inquiry_task_entity_1.InquiryStatus.REJECTED;
        }
        await this.inquiryTaskRepo.save(task);
        await this.screenshotsService.deleteScreenshotByActionId(actionId);
        console.log('[LINKEDIN-AUDIT] Screenshot deleted for action:', actionId);
        return task;
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(research_task_entity_1.ResearchTask)),
    __param(1, (0, typeorm_1.InjectRepository)(research_audit_entity_1.ResearchAudit)),
    __param(2, (0, typeorm_1.InjectRepository)(research_submission_entity_1.ResearchSubmission)),
    __param(3, (0, typeorm_1.InjectRepository)(flagged_action_entity_1.FlaggedAction)),
    __param(4, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(5, (0, typeorm_1.InjectRepository)(user_category_entity_1.UserCategory)),
    __param(6, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(7, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(8, (0, typeorm_1.InjectRepository)(inquiry_task_entity_1.InquiryTask)),
    __param(9, (0, typeorm_1.InjectRepository)(inquiry_action_entity_1.InquiryAction)),
    __param(10, (0, typeorm_1.InjectRepository)(outreach_record_entity_1.OutreachRecord)),
    __param(11, (0, typeorm_1.InjectRepository)(inquiry_submission_snapshot_entity_1.InquirySubmissionSnapshot)),
    __param(12, (0, typeorm_1.InjectRepository)(linkedin_profile_entity_1.LinkedInProfile)),
    __param(13, (0, typeorm_1.InjectRepository)(disapproval_reason_entity_1.DisapprovalReason)),
    __param(14, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(15, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        screenshots_service_1.ScreenshotsService])
], AuditService);
//# sourceMappingURL=audit.service.js.map