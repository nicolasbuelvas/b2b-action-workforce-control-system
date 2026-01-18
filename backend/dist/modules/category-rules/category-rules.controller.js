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
exports.CategoryRulesController = void 0;
const common_1 = require("@nestjs/common");
const category_rules_service_1 = require("./category-rules.service");
const create_category_rule_dto_1 = require("./dto/create-category-rule.dto");
const update_category_rule_dto_1 = require("./dto/update-category-rule.dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let CategoryRulesController = class CategoryRulesController {
    constructor(categoryRulesService) {
        this.categoryRulesService = categoryRulesService;
    }
    findAll() {
        return this.categoryRulesService.findAll();
    }
    create(createCategoryRuleDto) {
        return this.categoryRulesService.create(createCategoryRuleDto);
    }
    update(id, updateCategoryRuleDto) {
        return this.categoryRulesService.update(id, updateCategoryRuleDto);
    }
    toggleStatus(id) {
        return this.categoryRulesService.toggleStatus(id);
    }
    remove(id) {
        return this.categoryRulesService.remove(id);
    }
};
exports.CategoryRulesController = CategoryRulesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoryRulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_rule_dto_1.CreateCategoryRuleDto]),
    __metadata("design:returntype", void 0)
], CategoryRulesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_rule_dto_1.UpdateCategoryRuleDto]),
    __metadata("design:returntype", void 0)
], CategoryRulesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoryRulesController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoryRulesController.prototype, "remove", null);
exports.CategoryRulesController = CategoryRulesController = __decorate([
    (0, common_1.Controller)('admin/category-rules'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __metadata("design:paramtypes", [category_rules_service_1.CategoryRulesService])
], CategoryRulesController);
//# sourceMappingURL=category-rules.controller.js.map