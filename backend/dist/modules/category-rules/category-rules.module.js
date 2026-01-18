"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRulesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const category_rules_service_1 = require("./category-rules.service");
const category_rules_controller_1 = require("./category-rules.controller");
const category_rule_entity_1 = require("./entities/category-rule.entity");
const category_entity_1 = require("../categories/entities/category.entity");
let CategoryRulesModule = class CategoryRulesModule {
};
exports.CategoryRulesModule = CategoryRulesModule;
exports.CategoryRulesModule = CategoryRulesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([category_rule_entity_1.CategoryRule, category_entity_1.Category])],
        controllers: [category_rules_controller_1.CategoryRulesController],
        providers: [category_rules_service_1.CategoryRulesService],
        exports: [category_rules_service_1.CategoryRulesService],
    })
], CategoryRulesModule);
//# sourceMappingURL=category-rules.module.js.map