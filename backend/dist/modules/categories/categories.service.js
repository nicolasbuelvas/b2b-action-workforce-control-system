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
const user_category_entity_1 = require("./entities/user-category.entity");
const user_entity_1 = require("../users/entities/user.entity");
let CategoriesService = class CategoriesService {
    constructor(categoryRepo, categoryConfigRepo, userCategoryRepo, userRepo) {
        this.categoryRepo = categoryRepo;
        this.categoryConfigRepo = categoryConfigRepo;
        this.userCategoryRepo = userCategoryRepo;
        this.userRepo = userRepo;
    }
    async findAll() {
        const [categories, subAdminAssignments] = await Promise.all([
            this.categoryRepo.find({ relations: ['config'] }),
            this.userCategoryRepo.find({
                relations: ['user', 'user.roles', 'category'],
            }),
        ]);
        const subAdminByCategory = new Map();
        subAdminAssignments
            .filter(uc => uc.user?.roles?.some(r => r.role?.name?.toLowerCase() === 'sub_admin'))
            .forEach(uc => {
            const list = subAdminByCategory.get(uc.categoryId) || [];
            list.push({ userId: uc.userId, user: uc.user });
            subAdminByCategory.set(uc.categoryId, list);
        });
        return categories.map(cat => ({
            ...cat,
            subAdminCategories: subAdminByCategory.get(cat.id) || [],
        }));
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
        if (data.subAdminIds !== undefined) {
            if (!Array.isArray(data.subAdminIds)) {
                throw new Error('subAdminIds must be an array');
            }
            await this.assignSubAdmins(id, data.subAdminIds);
        }
        const { config, subAdminIds, ...otherData } = data;
        Object.assign(category, otherData);
        return this.categoryRepo.save(category);
    }
    async updateConfig(categoryId, configData) {
        const category = await this.getById(categoryId);
        Object.assign(category.config, configData);
        return this.categoryRepo.save(category);
    }
    async assignSubAdmins(categoryId, userIds) {
        if (!Array.isArray(userIds)) {
            throw new Error('userIds must be an array');
        }
        const existing = await this.userCategoryRepo.find({
            where: { categoryId },
            relations: ['user', 'user.roles'],
        });
        const existingSubAdminUCs = existing.filter(uc => uc.user?.roles?.some(r => r.role?.name?.toLowerCase() === 'sub_admin'));
        if (existingSubAdminUCs.length) {
            await this.userCategoryRepo.delete({ id: (0, typeorm_2.In)(existingSubAdminUCs.map(uc => uc.id)) });
        }
        if (userIds.length === 0) {
            return this.getById(categoryId);
        }
        const users = await this.userRepo.find({
            where: { id: (0, typeorm_2.In)(userIds) },
            relations: ['roles'],
        });
        const subAdminUsers = users.filter(u => u.roles?.some(r => r.role?.name?.toLowerCase() === 'sub_admin'));
        const subAdminUserIds = subAdminUsers.map(u => u.id);
        const assignments = subAdminUserIds.map(userId => ({
            userId,
            categoryId,
        }));
        if (assignments.length) {
            await this.userCategoryRepo.save(assignments);
        }
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
    __param(2, (0, typeorm_1.InjectRepository)(user_category_entity_1.UserCategory)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map