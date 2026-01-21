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
exports.ResearchController = void 0;
const common_1 = require("@nestjs/common");
const research_service_1 = require("./research.service");
const create_research_dto_1 = require("./dto/create-research.dto");
const submit_research_dto_1 = require("./dto/submit-research.dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let ResearchController = class ResearchController {
    constructor(researchService) {
        this.researchService = researchService;
    }
    getWebsiteTasks(userId) {
        return this.researchService.getAvailableTasks(userId, 'COMPANY');
    }
    getLinkedInTasks(userId) {
        return this.researchService.getAvailableTasks(userId, 'LINKEDIN');
    }
    claimTask(taskId, userId) {
        return this.researchService.claimTask(taskId, userId);
    }
    submitTask(dto, userId) {
        return this.researchService.submitTaskData(dto, userId);
    }
    submit(dto, userId) {
        return this.researchService.submit(dto, userId);
    }
};
exports.ResearchController = ResearchController;
__decorate([
    (0, common_1.Get)('tasks/website'),
    (0, roles_decorator_1.Roles)('website_researcher'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ResearchController.prototype, "getWebsiteTasks", null);
__decorate([
    (0, common_1.Get)('tasks/linkedin'),
    (0, roles_decorator_1.Roles)('linkedin_researcher'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ResearchController.prototype, "getLinkedInTasks", null);
__decorate([
    (0, common_1.Post)('tasks/:taskId/claim'),
    (0, roles_decorator_1.Roles)('website_researcher', 'linkedin_researcher'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ResearchController.prototype, "claimTask", null);
__decorate([
    (0, common_1.Post)('tasks/submit'),
    (0, roles_decorator_1.Roles)('website_researcher', 'linkedin_researcher'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_research_dto_1.SubmitResearchDto, String]),
    __metadata("design:returntype", void 0)
], ResearchController.prototype, "submitTask", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('website_researcher', 'linkedin_researcher'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_research_dto_1.CreateResearchDto, String]),
    __metadata("design:returntype", void 0)
], ResearchController.prototype, "submit", null);
exports.ResearchController = ResearchController = __decorate([
    (0, common_1.Controller)('research'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [research_service_1.ResearchService])
], ResearchController);
//# sourceMappingURL=research.controller.js.map