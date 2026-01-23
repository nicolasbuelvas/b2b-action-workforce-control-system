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
exports.ResearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const normalization_util_1 = require("../../common/utils/normalization.util");
const company_entity_1 = require("./entities/company.entity");
const research_task_entity_1 = require("./entities/research-task.entity");
const research_submission_entity_1 = require("./entities/research-submission.entity");
const user_category_entity_1 = require("../categories/entities/user-category.entity");
const linkedin_profile_entity_1 = require("./entities/linkedin-profile.entity");
let ResearchService = class ResearchService {
    constructor(dataSource, companyRepo, researchRepo, submissionRepo, userCategoryRepo, linkedinProfileRepo) {
        this.dataSource = dataSource;
        this.companyRepo = companyRepo;
        this.researchRepo = researchRepo;
        this.submissionRepo = submissionRepo;
        this.userCategoryRepo = userCategoryRepo;
        this.linkedinProfileRepo = linkedinProfileRepo;
    }
    async getAvailableTasks(userId, targetType, categoryId) {
        const userCategories = await this.userCategoryRepo.find({
            where: { userId },
            select: ['categoryId'],
        });
        if (userCategories.length === 0) {
            return [];
        }
        const categoryIds = userCategories.map(uc => uc.categoryId);
        if (categoryId && !categoryIds.includes(categoryId)) {
            return [];
        }
        let query = this.researchRepo
            .createQueryBuilder('task')
            .where('task.targettype = :targetType', { targetType })
            .andWhere('task.status IN (:...statuses)', {
            statuses: [research_task_entity_1.ResearchStatus.PENDING, research_task_entity_1.ResearchStatus.IN_PROGRESS],
        })
            .andWhere('(task.assignedToUserId IS NULL OR task.assignedToUserId = :userId)', { userId });
        if (categoryId) {
            query = query.andWhere('task.categoryId = :categoryId', { categoryId });
        }
        else {
            query = query.andWhere('task.categoryId IN (:...categoryIds)', { categoryIds });
        }
        const tasks = await query
            .orderBy('task.createdAt', 'ASC')
            .limit(50)
            .getMany();
        const tasksWithDetails = await Promise.all(tasks.map(async (task) => {
            let targetInfo = {};
            if (task.targetType === 'COMPANY') {
                const company = await this.companyRepo.findOne({
                    where: { id: task.targetId },
                });
                if (company) {
                    targetInfo = {
                        domain: company.domain,
                        name: company.name,
                        country: company.country,
                    };
                }
            }
            else if (task.targetType === 'LINKEDIN') {
                targetInfo = {
                    domain: task.targetId,
                    name: task.targetId,
                    country: '',
                };
            }
            return {
                id: task.id,
                categoryId: task.categoryId,
                assignedToUserId: task.assignedToUserId,
                status: task.assignedToUserId === userId
                    ? 'in_progress'
                    : 'unassigned',
                priority: 'medium',
                ...targetInfo,
            };
        }));
        return tasksWithDetails;
    }
    async claimTask(taskId, userId) {
        console.log('[claimTask] START - taskId:', taskId, 'userId:', userId);
        console.log('[claimTask] userId TYPE:', typeof userId, 'VALUE:', JSON.stringify(userId));
        return this.dataSource.transaction(async (manager) => {
            const task = await manager.findOne(research_task_entity_1.ResearchTask, {
                where: { id: taskId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!task) {
                console.log('[claimTask] ERROR - Task not found');
                throw new common_1.NotFoundException('Task not found');
            }
            console.log('[claimTask] Task found - currentAssignedTo:', task.assignedToUserId, 'status:', task.status);
            if (task.status !== research_task_entity_1.ResearchStatus.PENDING &&
                !(task.status === research_task_entity_1.ResearchStatus.IN_PROGRESS && task.assignedToUserId === userId)) {
                console.log('[claimTask] ERROR - Task not claimable');
                throw new common_1.BadRequestException('Task is not available for claiming');
            }
            if (task.assignedToUserId && task.assignedToUserId !== userId) {
                console.log('[claimTask] ERROR - Task claimed by another user:', task.assignedToUserId);
                throw new common_1.ConflictException('Task already claimed by another user');
            }
            if (task.assignedToUserId === userId) {
                console.log('[claimTask] Task already claimed by this user - returning');
                return task;
            }
            console.log('[claimTask] Assigning task to user:', userId);
            task.assignedToUserId = userId;
            task.status = research_task_entity_1.ResearchStatus.IN_PROGRESS;
            const savedTask = await manager.save(research_task_entity_1.ResearchTask, task);
            console.log('[claimTask] SUCCESS - Task assigned to:', savedTask.assignedToUserId);
            console.log('[claimTask] assignedToUserId TYPE:', typeof savedTask.assignedToUserId, 'userId TYPE:', typeof userId);
            return savedTask;
        });
    }
    async submitTaskData(dto, userId) {
        console.log('[submitTaskData] START - dto:', JSON.stringify(dto), 'userId:', userId);
        console.log('[submitTaskData] userId TYPE:', typeof userId, 'VALUE:', JSON.stringify(userId));
        return this.dataSource.transaction(async (manager) => {
            const task = await manager.findOne(research_task_entity_1.ResearchTask, {
                where: { id: dto.taskId },
            });
            if (!task) {
                console.log('[submitTaskData] ERROR - Task not found');
                throw new common_1.NotFoundException('Task not found');
            }
            console.log('[submitTaskData] Task found - assignedToUserId:', task.assignedToUserId, 'requestingUserId:', userId);
            console.log('[submitTaskData] assignedToUserId TYPE:', typeof task.assignedToUserId, 'VALUE:', JSON.stringify(task.assignedToUserId));
            console.log('[submitTaskData] Strict comparison:', task.assignedToUserId, '!==', userId, '=', task.assignedToUserId !== userId);
            console.log('[submitTaskData] String comparison:', String(task.assignedToUserId), '!==', String(userId), '=', String(task.assignedToUserId) !== String(userId));
            if (task.assignedToUserId !== userId) {
                console.log('[submitTaskData] ERROR - User not assigned to task');
                console.log('[submitTaskData] Expected:', userId, 'Actual:', task.assignedToUserId);
                throw new common_1.BadRequestException('You are not assigned to this task');
            }
            if (task.status !== research_task_entity_1.ResearchStatus.IN_PROGRESS) {
                throw new common_1.BadRequestException('Task must be claimed before submission');
            }
            if (task.targetType === 'LINKEDIN') {
                if (!dto.contactName || !dto.contactName.trim()) {
                    throw new common_1.BadRequestException('Contact name is required');
                }
                if (!dto.contactLinkedinUrl || !dto.contactLinkedinUrl.trim()) {
                    throw new common_1.BadRequestException('Contact LinkedIn link is required');
                }
                if (!dto.country || !dto.country.trim()) {
                    throw new common_1.BadRequestException('Country is required');
                }
                if (!dto.language || !dto.language.trim()) {
                    throw new common_1.BadRequestException('Language is required');
                }
            }
            else {
                if (dto.language && !dto.language.trim()) {
                    throw new common_1.BadRequestException('Language is required');
                }
            }
            const submission = manager.create(research_submission_entity_1.ResearchSubmission, {
                researchTaskId: task.id,
                language: dto.language,
                contactName: dto.contactName,
                contactLinkedinUrl: dto.contactLinkedinUrl,
                country: dto.country,
                email: dto.email,
                phone: dto.phone,
                techStack: dto.techStack,
                notes: dto.notes,
            });
            await manager.save(research_submission_entity_1.ResearchSubmission, submission);
            task.status = research_task_entity_1.ResearchStatus.SUBMITTED;
            await manager.save(research_task_entity_1.ResearchTask, task);
            return {
                taskId: task.id,
                submissionId: submission.id,
                message: 'Research submitted successfully and awaiting audit',
            };
        });
    }
    async submit(dto, userId) {
        if (dto.targetType !== 'COMPANY') {
            throw new common_1.NotImplementedException('LinkedIn research not enabled in phase 2');
        }
        return this.dataSource.transaction(async (manager) => {
            const normalizedDomain = (0, normalization_util_1.normalizeDomain)(dto.domainOrProfile);
            let company = await manager.findOne(company_entity_1.Company, {
                where: { normalizedDomain },
            });
            if (!company) {
                company = manager.create(company_entity_1.Company, {
                    name: dto.nameOrUrl,
                    domain: dto.domainOrProfile,
                    normalizedDomain,
                    country: dto.country,
                });
                await manager.save(company);
            }
            const completed = await manager.findOne(research_task_entity_1.ResearchTask, {
                where: {
                    categoryId: dto.categoryId,
                    targetId: company.id,
                    status: research_task_entity_1.ResearchStatus.COMPLETED,
                },
            });
            if (completed) {
                throw new common_1.ConflictException('Research already completed for this company');
            }
            const existingPending = await manager.findOne(research_task_entity_1.ResearchTask, {
                where: {
                    categoryId: dto.categoryId,
                    targetId: company.id,
                    status: research_task_entity_1.ResearchStatus.PENDING,
                },
            });
            if (existingPending) {
                throw new common_1.ConflictException('Research already pending for this company');
            }
            const task = manager.create(research_task_entity_1.ResearchTask, {
                categoryId: dto.categoryId,
                assignedToUserId: userId,
                targetType: 'COMPANY',
                targetId: company.id,
                status: research_task_entity_1.ResearchStatus.PENDING,
            });
            return manager.save(task);
        });
    }
};
exports.ResearchService = ResearchService;
exports.ResearchService = ResearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(2, (0, typeorm_1.InjectRepository)(research_task_entity_1.ResearchTask)),
    __param(3, (0, typeorm_1.InjectRepository)(research_submission_entity_1.ResearchSubmission)),
    __param(4, (0, typeorm_1.InjectRepository)(user_category_entity_1.UserCategory)),
    __param(5, (0, typeorm_1.InjectRepository)(linkedin_profile_entity_1.LinkedInProfile)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ResearchService);
//# sourceMappingURL=research.service.js.map