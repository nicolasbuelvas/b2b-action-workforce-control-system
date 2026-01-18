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
exports.CategoryConfig = void 0;
const typeorm_1 = require("typeorm");
const category_entity_1 = require("./category.entity");
let CategoryConfig = class CategoryConfig {
};
exports.CategoryConfig = CategoryConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CategoryConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => category_entity_1.Category, category => category.config),
    (0, typeorm_1.JoinColumn)({ name: 'categoryId' }),
    __metadata("design:type", category_entity_1.Category)
], CategoryConfig.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoryId' }),
    __metadata("design:type", String)
], CategoryConfig.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], CategoryConfig.prototype, "cooldownRules", void 0);
exports.CategoryConfig = CategoryConfig = __decorate([
    (0, typeorm_1.Entity)('category_configs')
], CategoryConfig);
//# sourceMappingURL=category-config.entity.js.map