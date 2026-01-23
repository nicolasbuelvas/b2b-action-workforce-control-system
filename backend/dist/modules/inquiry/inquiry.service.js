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
let InquiryService = class InquiryService {
    constructor(actionRepo, taskRepo, outreachRepo, researchRepo, submissionRepo, companyRepo, categoryRepo, screenshotsService, cooldownService) {
        this.actionRepo = actionRepo;
        this.taskRepo = taskRepo;
        this.outreachRepo = outreachRepo;
        this.researchRepo = researchRepo;
        this.submissionRepo = submissionRepo;
        this.companyRepo = companyRepo;
        this.categoryRepo = categoryRepo;
        this.screenshotsService = screenshotsService;
        this.cooldownService = cooldownService;
    }
    async getAvailableTasks(userId, type) {
        const targetType = type === 'website' ? 'COMPANY' : 'LINKEDIN';
        const completedResearch = await this.researchRepo.find({
            where: {
                status: research_task_entity_1.ResearchStatus.COMPLETED,
                targetType: targetType,
            },
            order: { createdAt: 'ASC' },
            take: 50,
        });
        const tasksWithDetails = await Promise.all(completedResearch.map(async (task) => {
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
            return {
                id: task.id,
                targetId: task.targetId,
                categoryId: task.categoryId,
                categoryName: category?.name || '',
                status: 'available',
                type: type,
                companyName,
                companyDomain,
                companyCountry,
                ...submissionData,
                createdAt: task.createdAt,
            };
        }));
        return tasksWithDetails;
    }
    async takeInquiry(targetId, categoryId, userId) {
        const active = await this.taskRepo.findOne({
            where: {
                assignedToUserId: userId,
                status: inquiry_task_entity_1.InquiryStatus.IN_PROGRESS,
            },
        });
        if (active) {
            throw new common_1.BadRequestException('User already has an active inquiry');
        }
        const task = this.taskRepo.create({
            targetId,
            categoryId,
            assignedToUserId: userId,
            status: inquiry_task_entity_1.InquiryStatus.IN_PROGRESS,
        });
        return this.taskRepo.save(task);
    }
    async submitInquiry(dto, screenshotBuffer, userId) {
        const task = await this.taskRepo.findOne({
            where: { id: dto.inquiryTaskId },
        });
        if (!task) {
            throw new common_1.BadRequestException('Inquiry task not found');
        }
        if (task.assignedToUserId !== userId) {
            throw new common_1.BadRequestException('Not your inquiry task');
        }
        if (task.status !== inquiry_task_entity_1.InquiryStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Inquiry is not in progress');
        }
        const pending = await this.actionRepo.findOne({
            where: {
                taskId: task.id,
                status: inquiry_action_entity_1.InquiryActionStatus.PENDING,
            },
        });
        if (pending) {
            throw new common_1.BadRequestException('There is already a pending action');
        }
        const lastApproved = await this.actionRepo.findOne({
            where: {
                taskId: task.id,
                status: inquiry_action_entity_1.InquiryActionStatus.APPROVED,
            },
            order: { actionIndex: 'DESC' },
        });
        const nextIndex = lastApproved
            ? lastApproved.actionIndex + 1
            : 1;
        await this.cooldownService.enforceCooldown({
            userId,
            targetId: task.targetId,
            categoryId: task.categoryId,
            actionType: dto.actionType,
        });
        const screenshotHash = await this.screenshotsService.processScreenshot(screenshotBuffer, userId);
        const action = await this.actionRepo.save({
            taskId: task.id,
            actionIndex: nextIndex,
            performedByUserId: userId,
            status: inquiry_action_entity_1.InquiryActionStatus.PENDING,
        });
        await this.outreachRepo.save({
            inquiryTaskId: task.id,
            userId,
            actionType: dto.actionType,
            inquiryActionId: action.id,
        });
        await this.cooldownService.recordAction({
            userId,
            targetId: task.targetId,
            categoryId: task.categoryId,
            actionType: dto.actionType,
        });
        return action;
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        screenshots_service_1.ScreenshotsService,
        cooldown_service_1.CooldownService])
], InquiryService);
//# sourceMappingURL=inquiry.service.js.map