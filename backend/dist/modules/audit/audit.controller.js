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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const audit_research_dto_1 = require("./dto/audit-research.dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    getPendingResearch() {
        return this.auditService.getPendingResearch();
    }
    auditResearch(researchTaskId, dto, auditorUserId) {
        return this.auditService.auditResearch(researchTaskId, dto, auditorUserId);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)('research/pending'),
    (0, roles_decorator_1.Roles)('website_inquirer_auditor', 'linkedin_inquirer_auditor', 'website_research_auditor', 'linkedin_research_auditor'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getPendingResearch", null);
__decorate([
    (0, common_1.Post)('research/:id'),
    (0, roles_decorator_1.Roles)('website_inquirer_auditor', 'linkedin_inquirer_auditor', 'website_research_auditor', 'linkedin_research_auditor'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, audit_research_dto_1.AuditResearchDto, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "auditResearch", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map