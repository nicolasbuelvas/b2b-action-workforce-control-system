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
exports.SubAdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const ensureCategoryAccess_1 = require("../middleware/ensureCategoryAccess");
const subAdmin_service_1 = require("../services/subAdmin.service");
let SubAdminController = class SubAdminController {
    constructor(subAdminService) {
        this.subAdminService = subAdminService;
    }
    getDashboard(query, user) {
        return this.subAdminService.getDashboard(query, user);
    }
    getCategories(user) {
        return this.subAdminService.getCategories(user);
    }
    getCategoryRules(categoryId, user) {
        return this.subAdminService.getCategoryRules(categoryId, user);
    }
    updateCategoryRules(categoryId, body, user) {
        return this.subAdminService.updateCategoryRules(categoryId, body, user);
    }
    getPerformance(categoryId, query, user) {
        return this.subAdminService.getPerformance(categoryId, query, user);
    }
    getAlerts(query, user) {
        return this.subAdminService.getAlerts(query, user);
    }
    getLogs(query, user) {
        return this.subAdminService.getLogs(query, user);
    }
    flagAction(body, user) {
        return this.subAdminService.flagAction(body, user);
    }
};
exports.SubAdminController = SubAdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Body)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SubAdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Body)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubAdminController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('categories/:categoryId/rules'),
    (0, common_1.UseGuards)(ensureCategoryAccess_1.EnsureCategoryAccess),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Body)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubAdminController.prototype, "getCategoryRules", null);
__decorate([
    (0, common_1.Put)('categories/:categoryId/rules'),
    (0, common_1.UseGuards)(ensureCategoryAccess_1.EnsureCategoryAccess),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Body)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SubAdminController.prototype, "updateCategoryRules", null);
__decorate([
    (0, common_1.Get)('categories/:categoryId/performance'),
    (0, common_1.UseGuards)(ensureCategoryAccess_1.EnsureCategoryAccess),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Body)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SubAdminController.prototype, "getPerformance", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Body)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SubAdminController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Body)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SubAdminController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Post)('actions/flag'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SubAdminController.prototype, "flagAction", null);
exports.SubAdminController = SubAdminController = __decorate([
    (0, common_1.Controller)('sub-admin'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUB_ADMIN'),
    __metadata("design:paramtypes", [subAdmin_service_1.SubAdminService])
], SubAdminController);
//# sourceMappingURL=subAdmin.controller.js.map