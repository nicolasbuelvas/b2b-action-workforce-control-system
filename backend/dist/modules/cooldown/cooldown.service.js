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
exports.CooldownService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cooldown_record_entity_1 = require("./entities/cooldown-record.entity");
const categories_service_1 = require("../categories/categories.service");
let CooldownService = class CooldownService {
    constructor(cooldownRepo, categoriesService) {
        this.cooldownRepo = cooldownRepo;
        this.categoriesService = categoriesService;
    }
    async enforceCooldown(params) {
        const { userId, targetId, categoryId } = params;
        const category = await this.categoriesService.getById(categoryId);
        const cooldownRules = category.config?.cooldownRules || {};
        const cooldownDays = Math.min(...Object.values(cooldownRules).filter(v => typeof v === 'number')) || 30;
        if (cooldownDays <= 0)
            return;
        const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
        let record = await this.cooldownRepo.findOne({
            where: { userId, targetId, categoryId },
        });
        if (!record)
            return;
        if (!record.cooldownStartedAt)
            return;
        const elapsed = Date.now() - record.cooldownStartedAt.getTime();
        if (elapsed >= cooldownMs) {
            record.cooldownStartedAt = null;
            await this.cooldownRepo.save(record);
            return;
        }
        const remainingMinutes = Math.ceil((cooldownMs - elapsed) / 1000 / 60);
        throw new common_1.ForbiddenException({
            code: 'COOLDOWN_ACTIVE',
            remainingMinutes,
        });
    }
    async recordAction(params) {
        const { userId, targetId, categoryId } = params;
        const category = await this.categoriesService.getById(categoryId);
        const cooldownRules = category.config?.cooldownRules || {};
        const cooldownDays = Math.min(...Object.values(cooldownRules).filter(v => typeof v === 'number')) || 30;
        if (cooldownDays <= 0)
            return;
        let record = await this.cooldownRepo.findOne({
            where: { userId, targetId, categoryId },
        });
        if (!record) {
            record = this.cooldownRepo.create({
                userId,
                targetId,
                categoryId,
                cooldownStartedAt: new Date(),
            });
        }
        else {
            record.cooldownStartedAt = new Date();
        }
        await this.cooldownRepo.save(record);
    }
};
exports.CooldownService = CooldownService;
exports.CooldownService = CooldownService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cooldown_record_entity_1.CooldownRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        categories_service_1.CategoriesService])
], CooldownService);
//# sourceMappingURL=cooldown.service.js.map