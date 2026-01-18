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
exports.CategoryRulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_rule_entity_1 = require("./entities/category-rule.entity");
const category_entity_1 = require("../categories/entities/category.entity");
let CategoryRulesService = class CategoryRulesService {
    constructor(categoryRuleRepo, categoryRepo) {
        this.categoryRuleRepo = categoryRuleRepo;
        this.categoryRepo = categoryRepo;
    }
    async findAll() {
        await this.seedInitialRules();
        return this.categoryRuleRepo.find({
            relations: ['category'],
            order: { priority: 'DESC', createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const rule = await this.categoryRuleRepo.findOne({
            where: { id },
            relations: ['category'],
        });
        if (!rule) {
            throw new common_1.NotFoundException('Category rule not found');
        }
        return rule;
    }
    async create(dto) {
        const rule = this.categoryRuleRepo.create(dto);
        return this.categoryRuleRepo.save(rule);
    }
    async update(id, dto) {
        const rule = await this.findOne(id);
        Object.assign(rule, dto);
        return this.categoryRuleRepo.save(rule);
    }
    async remove(id) {
        const rule = await this.findOne(id);
        return this.categoryRuleRepo.remove(rule);
    }
    async toggleStatus(id) {
        const rule = await this.findOne(id);
        rule.status = rule.status === category_rule_entity_1.RuleStatus.ACTIVE ? category_rule_entity_1.RuleStatus.INACTIVE : category_rule_entity_1.RuleStatus.ACTIVE;
        return this.categoryRuleRepo.save(rule);
    }
    async seedInitialRules() {
        const categories = await this.categoryRepo.find();
        const rulesToCreate = [];
        for (const category of categories) {
            const existingRulesForCategory = await this.categoryRuleRepo.count({
                where: { categoryId: category.id },
            });
            if (existingRulesForCategory > 0)
                continue;
            rulesToCreate.push({
                categoryId: category.id,
                actionType: 'Website Research',
                role: 'Researcher',
                requiredActions: 1,
                screenshotRequired: false,
                status: category_rule_entity_1.RuleStatus.ACTIVE,
                priority: 0,
            });
            rulesToCreate.push({
                categoryId: category.id,
                actionType: 'LinkedIn Research',
                role: 'Researcher',
                requiredActions: 1,
                screenshotRequired: false,
                status: category_rule_entity_1.RuleStatus.ACTIVE,
                priority: 0,
            });
            rulesToCreate.push({
                categoryId: category.id,
                actionType: 'Website Inquiry',
                role: 'Inquirer',
                requiredActions: 1,
                screenshotRequired: true,
                status: category_rule_entity_1.RuleStatus.ACTIVE,
                priority: 0,
            });
            rulesToCreate.push({
                categoryId: category.id,
                actionType: 'LinkedIn Inquiry',
                role: 'Inquirer',
                requiredActions: 3,
                screenshotRequired: true,
                status: category_rule_entity_1.RuleStatus.ACTIVE,
                priority: 0,
            });
            rulesToCreate.push({
                categoryId: category.id,
                actionType: 'Website Review',
                role: 'Auditor',
                requiredActions: 1,
                screenshotRequired: false,
                status: category_rule_entity_1.RuleStatus.ACTIVE,
                priority: 0,
            });
            rulesToCreate.push({
                categoryId: category.id,
                actionType: 'LinkedIn Review',
                role: 'Auditor',
                requiredActions: 1,
                screenshotRequired: false,
                status: category_rule_entity_1.RuleStatus.ACTIVE,
                priority: 0,
            });
        }
        await this.categoryRuleRepo.save(rulesToCreate);
    }
    async getEffectiveConfig(categoryId, actionType, role) {
        const rules = await this.getApplicableRules(categoryId, actionType, role);
        const effective = {
            dailyLimit: null,
            cooldownDays: null,
            requiredActions: 1,
            screenshotRequired: false,
        };
        if (rules.length > 0) {
            const rule = rules[0];
            effective.dailyLimit = rule.dailyLimitOverride;
            effective.cooldownDays = rule.cooldownDaysOverride;
            effective.requiredActions = rule.requiredActions;
            effective.screenshotRequired = rule.screenshotRequired;
        }
        return effective;
    }
    async getApplicableRules(categoryId, actionType, role) {
        return this.categoryRuleRepo.find({
            where: {
                categoryId,
                actionType,
                role,
                status: category_rule_entity_1.RuleStatus.ACTIVE,
            },
            order: { priority: 'DESC' },
        });
    }
};
exports.CategoryRulesService = CategoryRulesService;
exports.CategoryRulesService = CategoryRulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_rule_entity_1.CategoryRule)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CategoryRulesService);
//# sourceMappingURL=category-rules.service.js.map