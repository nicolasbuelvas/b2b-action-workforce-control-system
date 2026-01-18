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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRule = exports.RuleStatus = void 0;
const typeorm_1 = require("typeorm");
const category_entity_1 = require("../../categories/entities/category.entity");
var RuleStatus;
(function (RuleStatus) {
    RuleStatus["ACTIVE"] = "active";
    RuleStatus["INACTIVE"] = "inactive";
})(RuleStatus || (exports.RuleStatus = RuleStatus = {}));
let CategoryRule = class CategoryRule {
};
exports.CategoryRule = CategoryRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CategoryRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id' }),
    __metadata("design:type", String)
], CategoryRule.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], CategoryRule.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_type' }),
    __metadata("design:type", String)
], CategoryRule.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CategoryRule.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'daily_limit_override' }),
    __metadata("design:type", Number)
], CategoryRule.prototype, "dailyLimitOverride", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'cooldown_days_override' }),
    __metadata("design:type", Number)
], CategoryRule.prototype, "cooldownDaysOverride", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, name: 'required_actions' }),
    __metadata("design:type", Number)
], CategoryRule.prototype, "requiredActions", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'screenshot_required' }),
    __metadata("design:type", Boolean)
], CategoryRule.prototype, "screenshotRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RuleStatus,
        default: RuleStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], CategoryRule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CategoryRule.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CategoryRule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CategoryRule.prototype, "updatedAt", void 0);
exports.CategoryRule = CategoryRule = __decorate([
    (0, typeorm_1.Entity)('category_rules')
], CategoryRule);
//# sourceMappingURL=category-rule.entity.js.map