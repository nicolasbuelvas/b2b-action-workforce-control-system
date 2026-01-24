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
exports.InquiryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inquiry_action_entity_1 = require("./entities/inquiry-action.entity");
const inquiry_task_entity_1 = require("./entities/inquiry-task.entity");
const outreach_record_entity_1 = require("./entities/outreach-record.entity");
const screenshots_service_1 = require("../screenshots/screenshots.service");
const cooldown_service_1 = require("../cooldown/cooldown.service");
const research_task_entity_1 = require("../research/entities/research-task.entity");
const research_submission_entity_1 = require("../research/entities/research-submission.entity");
const company_entity_1 = require("../research/entities/company.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const user_category_entity_1 = require("../categories/entities/user-category.entity");
let InquiryService = class InquiryService {
    constructor(actionRepo, taskRepo, outreachRepo, researchRepo, submissionRepo, companyRepo, categoryRepo, userCategoryRepo, screenshotsService, cooldownService, dataSource) {
        this.actionRepo = actionRepo;
        this.taskRepo = taskRepo;
        this.outreachRepo = outreachRepo;
        this.researchRepo = researchRepo;
        this.submissionRepo = submissionRepo;
        this.companyRepo = companyRepo;
        this.categoryRepo = categoryRepo;
        this.userCategoryRepo = userCategoryRepo;
        this.screenshotsService = screenshotsService;
        this.cooldownService = cooldownService;
        this.dataSource = dataSource;
    }
    async getAvailableTasks(userId, type) {
        const targetType = type === 'website' ? 'COMPANY' : 'LINKEDIN';
        const userCategories = await this.userCategoryRepo.find({
            where: { userId },
            select: ['categoryId'],
        });
        const categoryIds = userCategories.map(uc => uc.categoryId);
        if (categoryIds.length === 0) {
            return [];
        }
        const completedResearch = await this.researchRepo.find({
            where: {
                status: research_task_entity_1.ResearchStatus.COMPLETED,
                targetType: targetType,
            },
            order: { createdAt: 'ASC' },
            take: 50,
        });
        const tasksWithDetails = await Promise.all(completedResearch
            .filter(task => categoryIds.includes(task.categoryId))
            .map(async (task) => {
            let companyName = '';
            let companyDomain = '';
            let companyCountry = '';
            let submissionData = {};
            if (task.targetType === 'COMPANY') {
                const company = await this.companyRepo.findOne({
                    where: { id: task.targetId },
                });
                if (company) {
                    companyName = company.name;
                    companyDomain = company.domain;
                    companyCountry = company.country;
                }
            }
            else if (task.targetType === 'LINKEDIN') {
                companyDomain = task.targetId;
            }
            const submission = await this.submissionRepo.findOne({
                where: { researchTaskId: task.id },
            });
            if (submission) {
                submissionData = {
                    language: submission.language,
                    country: submission.country,
                    contactName: submission.contactName,
                    contactLinkedinUrl: submission.contactLinkedinUrl,
                    email: submission.email,
                    phone: submission.phone,
                    techStack: submission.techStack,
                    notes: submission.notes,
                };
            }
            const category = await this.categoryRepo.findOne({
                where: { id: task.categoryId },
            });
            const inquiryTask = await this.taskRepo.findOne({
                where: {
                    targetId: task.targetId,
                    categoryId: task.categoryId,
                },
            });
            let taskStatus = inquiry_task_entity_1.InquiryStatus.PENDING;
            let assignedToUserId = null;
            if (inquiryTask) {
                taskStatus = inquiryTask.status;
                assignedToUserId = inquiryTask.assignedToUserId;
            }
            if (inquiryTask && inquiryTask.assignedToUserId && inquiryTask.assignedToUserId !== userId) {
                return null;
            }
            if (inquiryTask && inquiryTask.status === inquiry_task_entity_1.InquiryStatus.COMPLETED) {
                return null;
            }
            return {
                id: task.id,
                targetId: task.targetId,
                categoryId: task.categoryId,
                categoryName: category?.name || '',
                status: taskStatus,
                assignedToUserId,
                type: type,
                companyName,
                companyDomain,
                companyCountry,
                ...submissionData,
                createdAt: task.createdAt,
            };
        }));
        return tasksWithDetails.filter(t => t !== null);
    }
    async takeInquiry(researchTaskId, userId) {
        const researchTask = await this.researchRepo.findOne({
            where: { id: researchTaskId },
        });
        if (!researchTask) {
            throw new common_1.BadRequestException('Research task not found');
        }
        let task = await this.taskRepo.findOne({
            where: {
                targetId: researchTask.targetId,
                categoryId: researchTask.categoryId,
            },
        });
        if (!task) {
            task = this.taskRepo.create({
                targetId: researchTask.targetId,
                categoryId: researchTask.categoryId,
                status: inquiry_task_entity_1.InquiryStatus.PENDING,
            });
        }
        if (task.assignedToUserId && task.assignedToUserId !== userId) {
            throw new common_1.BadRequestException('Task already claimed by another user');
        }
        if (task.assignedToUserId === userId && task.status === inquiry_task_entity_1.InquiryStatus.IN_PROGRESS) {
            return task;
        }
        task.assignedToUserId = userId;
        task.status = inquiry_task_entity_1.InquiryStatus.IN_PROGRESS;
        return this.taskRepo.save(task);
    }
    async submitInquiry(dto, screenshotBuffer, userId) {
        console.log('[SERVICE-SUBMIT] ========== START =========');
        console.log('[SERVICE-SUBMIT] User:', userId);
        console.log('[SERVICE-SUBMIT] Task:', dto.inquiryTaskId);
        console.log('[SERVICE-SUBMIT] Type:', dto.actionType);
        console.log('[SERVICE-SUBMIT] Buffer size:', screenshotBuffer?.length || 0);
        if (!dto.actionType) {
            console.error('[SERVICE-SUBMIT] ERROR: actionType is required');
            throw new common_1.BadRequestException('actionType is required');
        }
        const validActionTypes = ['EMAIL', 'LINKEDIN', 'CALL'];
        if (!validActionTypes.includes(dto.actionType)) {
            console.error('[SERVICE-SUBMIT] ERROR: Invalid actionType:', dto.actionType);
            throw new common_1.BadRequestException(`actionType must be one of: ${validActionTypes.join(', ')}`);
        }
        if (!screenshotBuffer || screenshotBuffer.length === 0) {
            console.error('[SERVICE-SUBMIT] ERROR: No buffer');
            throw new common_1.BadRequestException('Screenshot buffer required');
        }
        const result = await this.dataSource.transaction(async (manager) => {
            console.log('[SERVICE-SUBMIT] Transaction started');
            console.log('[SERVICE-SUBMIT] Fetching task...');
            const task = await manager.getRepository(inquiry_task_entity_1.InquiryTask).findOne({
                where: { id: dto.inquiryTaskId },
            });
            if (!task) {
                console.error('[SERVICE-SUBMIT] ERROR: Task not found');
                throw new common_1.BadRequestException('Inquiry task not found');
            }
            console.log('[SERVICE-SUBMIT] Task found. Status:', task.status, 'Owner:', task.assignedToUserId);
            if (task.assignedToUserId !== userId) {
                console.error('[SERVICE-SUBMIT] ERROR: Not owner. Assigned to:', task.assignedToUserId);
                throw new common_1.BadRequestException('Not your inquiry task');
            }
            if (task.status !== inquiry_task_entity_1.InquiryStatus.IN_PROGRESS) {
                console.error('[SERVICE-SUBMIT] ERROR: Wrong status:', task.status);
                throw new common_1.BadRequestException('Inquiry is not in progress');
            }
            console.log('[SERVICE-SUBMIT] Checking pending actions...');
            const pending = await manager.getRepository(inquiry_action_entity_1.InquiryAction).findOne({
                where: {
                    inquiryTaskId: task.id,
                    status: inquiry_action_entity_1.InquiryActionStatus.PENDING,
                },
            });
            if (pending) {
                console.error('[SERVICE-SUBMIT] ERROR: Pending action exists');
                throw new common_1.BadRequestException('There is already a pending action');
            }
            console.log('[SERVICE-SUBMIT] Enforcing cooldown...');
            try {
                await this.cooldownService.enforceCooldown({
                    userId,
                    targetId: task.targetId,
                    categoryId: task.categoryId,
                    actionType: dto.actionType,
                });
                console.log('[SERVICE-SUBMIT] Cooldown OK');
            }
            catch (err) {
                console.error('[SERVICE-SUBMIT] ERROR: Cooldown violation:', err.message);
                throw err;
            }
            console.log('[SERVICE-SUBMIT] Processing screenshot...');
            let screenshotResult;
            try {
                screenshotResult = await this.screenshotsService.processScreenshot(screenshotBuffer, userId);
                console.log('[SERVICE-SUBMIT] Screenshot result:', {
                    screenshotId: screenshotResult.screenshotId,
                    isDuplicate: screenshotResult.isDuplicate,
                });
            }
            catch (err) {
                console.error('[SERVICE-SUBMIT] ERROR: Screenshot processing failed:', err.message);
                throw err;
            }
            console.log('[SERVICE-SUBMIT] Creating action record...');
            const action = await manager.getRepository(inquiry_action_entity_1.InquiryAction).save({
                inquiryTaskId: task.id,
                actionIndex: 1,
                performedByUserId: userId,
                status: inquiry_action_entity_1.InquiryActionStatus.PENDING,
            });
            console.log('[SERVICE-SUBMIT] Action created:', action.id);
            console.log('[SERVICE-SUBMIT] Creating outreach record...');
            await manager.getRepository(outreach_record_entity_1.OutreachRecord).save({
                inquiryTaskId: task.id,
                userId,
                actionType: dto.actionType,
                inquiryActionId: action.id,
            });
            console.log('[SERVICE-SUBMIT] Outreach record created');
            console.log('[SERVICE-SUBMIT] Recording cooldown...');
            try {
                await this.cooldownService.recordAction({
                    userId,
                    targetId: task.targetId,
                    categoryId: task.categoryId,
                    actionType: dto.actionType,
                    manager,
                });
                console.log('[SERVICE-SUBMIT] Cooldown recorded');
            }
            catch (err) {
                console.error('[SERVICE-SUBMIT] ERROR: Cooldown recording failed:', err.message);
                throw err;
            }
            console.log('[SERVICE-SUBMIT] Finalizing task status...');
            task.status = inquiry_task_entity_1.InquiryStatus.COMPLETED;
            await manager.getRepository(inquiry_task_entity_1.InquiryTask).save(task);
            console.log('[SERVICE-SUBMIT] Task status updated to COMPLETED');
            console.log('[SERVICE-SUBMIT] Transaction completed successfully');
            return {
                action,
                screenshotDuplicate: screenshotResult.isDuplicate,
            };
        });
        console.log('[SERVICE-SUBMIT] ========== SUCCESS =========');
        return result;
    }
};
exports.InquiryService = InquiryService;
exports.InquiryService = InquiryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inquiry_action_entity_1.InquiryAction)),
    __param(1, (0, typeorm_1.InjectRepository)(inquiry_task_entity_1.InquiryTask)),
    __param(2, (0, typeorm_1.InjectRepository)(outreach_record_entity_1.OutreachRecord)),
    __param(3, (0, typeorm_1.InjectRepository)(research_task_entity_1.ResearchTask)),
    __param(4, (0, typeorm_1.InjectRepository)(research_submission_entity_1.ResearchSubmission)),
    __param(5, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(6, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(7, (0, typeorm_1.InjectRepository)(user_category_entity_1.UserCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        screenshots_service_1.ScreenshotsService,
        cooldown_service_1.CooldownService,
        typeorm_2.DataSource])
], InquiryService);
//# sourceMappingURL=inquiry.service.js.map