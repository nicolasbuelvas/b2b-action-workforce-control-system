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
let ResearchService = class ResearchService {
    constructor(dataSource, companyRepo, researchRepo) {
        this.dataSource = dataSource;
        this.companyRepo = companyRepo;
        this.researchRepo = researchRepo;
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
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ResearchService);
//# sourceMappingURL=research.service.js.map