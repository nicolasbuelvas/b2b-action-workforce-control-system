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
const research_audit_entity_1 = require("./entities/research-audit.entity");
const flagged_action_entity_1 = require("./entities/flagged-action.entity");
let AuditService = class AuditService {
    constructor(researchRepo, auditRepo, flaggedRepo) {
        this.researchRepo = researchRepo;
        this.auditRepo = auditRepo;
        this.flaggedRepo = flaggedRepo;
    }
    async auditResearch(researchTaskId, dto, auditorUserId) {
        const task = await this.researchRepo.findOne({
            where: { id: researchTaskId },
        });
        if (!task) {
            throw new common_1.BadRequestException('Research task not found');
        }
        if (task.status !== research_task_entity_1.ResearchStatus.PENDING) {
            throw new common_1.BadRequestException('Research task already audited');
        }
        if (task.assignedToUserId === auditorUserId) {
            throw new common_1.ForbiddenException('Auditor cannot audit own submission');
        }
        await this.auditRepo.save({
            researchTaskId,
            auditorUserId,
            decision: dto.decision,
        });
        task.status =
            dto.decision === 'APPROVED'
                ? research_task_entity_1.ResearchStatus.COMPLETED
                : research_task_entity_1.ResearchStatus.REJECTED;
        if (dto.decision === 'REJECTED') {
            await this.flaggedRepo.save({
                userId: task.assignedToUserId,
                targetId: researchTaskId,
                actionType: 'RESEARCH',
                reason: 'MANUAL_REJECTION',
            });
        }
        return this.researchRepo.save(task);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(research_task_entity_1.ResearchTask)),
    __param(1, (0, typeorm_1.InjectRepository)(research_audit_entity_1.ResearchAudit)),
    __param(2, (0, typeorm_1.InjectRepository)(flagged_action_entity_1.FlaggedAction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map