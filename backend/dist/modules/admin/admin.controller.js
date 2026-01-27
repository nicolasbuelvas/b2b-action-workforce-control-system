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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const create_sub_admin_dto_1 = require("./dto/create-sub-admin.dto");
const assign_user_categories_dto_1 = require("./dto/assign-user-categories.dto");
const remove_user_category_dto_1 = require("./dto/remove-user-category.dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    getDashboard() {
        return this.adminService.getDashboard();
    }
    getCategories() {
        return this.adminService.getCategories();
    }
    getTopWorkers() {
        return this.adminService.getTopWorkers();
    }
    getSystemLogs() {
        return this.adminService.getSystemLogs();
    }
    getUsers(page = '1', limit = '10', search = '', role = '', status = '') {
        return this.adminService.getUsers({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            role,
            status,
        });
    }
    getUsersStats() {
        return this.adminService.getUsersStats();
    }
    updateUserStatus(id, body) {
        return this.adminService.updateUserStatus(id, body.status);
    }
    updateUserProfile(id, body) {
        return this.adminService.updateUserProfile(id, body);
    }
    resetUserPassword(id, body) {
        return this.adminService.resetUserPassword(id, body?.password);
    }
    deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    createSubAdmin(dto) {
        return this.adminService.createSubAdmin(dto);
    }
    assignUserToCategories(dto) {
        return this.adminService.assignUserToCategories(dto);
    }
    removeUserFromCategory(dto) {
        return this.adminService.removeUserFromCategory(dto);
    }
    getUserCategories(userId) {
        return this.adminService.getUserCategories(userId);
    }
    getSubAdmins() {
        return this.adminService.getSubAdmins();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('top-workers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTopWorkers", null);
__decorate([
    (0, common_1.Get)('system-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSystemLogs", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('role')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsersStats", null);
__decorate([
    (0, common_1.Patch)('users/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Patch)('users/:id/profile'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserProfile", null);
__decorate([
    (0, common_1.Post)('users/:id/reset-password'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "resetUserPassword", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('sub-admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sub_admin_dto_1.CreateSubAdminDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createSubAdmin", null);
__decorate([
    (0, common_1.Post)('users/assign-categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_user_categories_dto_1.AssignUserToCategoriesDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "assignUserToCategories", null);
__decorate([
    (0, common_1.Delete)('users/remove-from-category'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [remove_user_category_dto_1.RemoveUserFromCategoryDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "removeUserFromCategory", null);
__decorate([
    (0, common_1.Get)('users/:userId/categories'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserCategories", null);
__decorate([
    (0, common_1.Get)('sub-admins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSubAdmins", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map