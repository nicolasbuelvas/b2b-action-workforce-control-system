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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
const category_config_entity_1 = require("./entities/category-config.entity");
const sub_admin_category_entity_1 = require("./entities/sub-admin-category.entity");
let CategoriesService = class CategoriesService {
    constructor(categoryRepo, categoryConfigRepo, subAdminCategoryRepo) {
        this.categoryRepo = categoryRepo;
        this.categoryConfigRepo = categoryConfigRepo;
        this.subAdminCategoryRepo = subAdminCategoryRepo;
    }
    async findAll() {
        return this.categoryRepo.find({
            relations: ['subAdminCategories', 'subAdminCategories.user'],
        });
    }
    async getById(id) {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['subAdminCategories', 'subAdminCategories.user'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async create(name, config) {
        const category = this.categoryRepo.create({ name });
        if (config) {
            category.config = this.categoryConfigRepo.create({ cooldownRules: config.cooldownRules || config });
        }
        return this.categoryRepo.save(category);
    }
    async update(id, data) {
        const category = await this.getById(id);
        if (data.config) {
            if (category.config) {
                Object.assign(category.config.cooldownRules, data.config.cooldownRules || data.config);
            }
            else {
                category.config = this.categoryConfigRepo.create({ cooldownRules: data.config.cooldownRules || data.config });
            }
        }
        const { config, ...otherData } = data;
        Object.assign(category, otherData);
        return this.categoryRepo.save(category);
    }
    async updateConfig(categoryId, configData) {
        const category = await this.getById(categoryId);
        Object.assign(category.config, configData);
        return this.categoryRepo.save(category);
    }
    async assignSubAdmins(categoryId, userIds) {
        await this.subAdminCategoryRepo.delete({ categoryId });
        const assignments = userIds.map(userId => ({
            userId,
            categoryId,
        }));
        await this.subAdminCategoryRepo.save(assignments);
        return this.getById(categoryId);
    }
    async delete(id) {
        const category = await this.getById(id);
        if (category.config) {
            await this.categoryConfigRepo.delete(category.config.id);
        }
        await this.categoryRepo.remove(category);
    }
    async getMetrics(categoryId) {
        return {
            totalResearchers: 0,
            totalInquirers: 0,
            totalAuditors: 0,
            approvalRate: 0,
            totalApprovedActions: 0,
        };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(category_config_entity_1.CategoryConfig)),
    __param(2, (0, typeorm_1.InjectRepository)(sub_admin_category_entity_1.SubAdminCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map