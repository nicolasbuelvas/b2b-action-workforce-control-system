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
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_metrics_entity_1 = require("./entities/role-metrics.entity");
let MetricsService = class MetricsService {
    constructor(metricsRepo) {
        this.metricsRepo = metricsRepo;
    }
    today() {
        return new Date().toISOString().split('T')[0];
    }
    async recordAction(params) {
        const date = this.today();
        let metrics = await this.metricsRepo.findOne({
            where: {
                userId: params.userId,
                role: params.role,
                categoryId: params.categoryId ?? null,
                date,
            },
        });
        if (!metrics) {
            metrics = this.metricsRepo.create({
                userId: params.userId,
                role: params.role,
                categoryId: params.categoryId ?? null,
                date,
            });
        }
        metrics.totalActions += 1;
        if (params.status === 'approved')
            metrics.approvedActions += 1;
        if (params.status === 'rejected')
            metrics.rejectedActions += 1;
        if (params.status === 'flagged')
            metrics.flaggedActions += 1;
        return this.metricsRepo.save(metrics);
    }
    async getUserMetrics(params) {
        return this.metricsRepo.find({
            where: {
                userId: params.userId,
                role: params.role,
                categoryId: params.categoryId ?? null,
            },
            order: { date: 'DESC' },
        });
    }
    async getTopWorkers(params) {
        const qb = this.metricsRepo
            .createQueryBuilder('m')
            .select('m.userId', 'userId')
            .addSelect('SUM(m.approvedActions)', 'approvedActions')
            .where('m.role = :role', { role: params.role })
            .andWhere('m.date BETWEEN :from AND :to', {
            from: params.from,
            to: params.to,
        });
        if (params.categoryId) {
            qb.andWhere('m.categoryId = :categoryId', {
                categoryId: params.categoryId,
            });
        }
        return qb
            .groupBy('m.userId')
            .orderBy('approvedActions', 'DESC')
            .limit(params.limit ?? 3)
            .getRawMany();
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_metrics_entity_1.RoleMetrics)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map