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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const action_price_entity_1 = require("./entities/action-price.entity");
const payment_record_entity_1 = require("./entities/payment-record.entity");
let PaymentsService = class PaymentsService {
    constructor(dataSource, priceRepo, paymentRepo) {
        this.dataSource = dataSource;
        this.priceRepo = priceRepo;
        this.paymentRepo = paymentRepo;
    }
    async getActionPrices() {
        return this.priceRepo.find({
            order: { roleId: 'ASC', actionType: 'ASC' },
        });
    }
    async getPricesByRole(role) {
        return this.priceRepo.find({
            where: { roleId: role },
            order: { actionType: 'ASC' },
        });
    }
    async createOrUpdatePrice(dto) {
        let price = await this.priceRepo.findOne({
            where: {
                roleId: dto.roleId,
                actionType: dto.actionType,
            },
        });
        if (!price) {
            price = this.priceRepo.create({
                roleId: dto.roleId,
                actionType: dto.actionType,
                amount: dto.amount,
                bonusMultiplier: dto.bonusMultiplier || 1.0,
                description: dto.description,
            });
        }
        else {
            price.amount = dto.amount;
            if (dto.bonusMultiplier !== undefined) {
                price.bonusMultiplier = dto.bonusMultiplier;
            }
            if (dto.description !== undefined) {
                price.description = dto.description;
            }
        }
        return this.priceRepo.save(price);
    }
    async updatePrice(id, dto) {
        const price = await this.priceRepo.findOne({ where: { id } });
        if (!price) {
            throw new common_1.NotFoundException('Price not found');
        }
        if (dto.amount !== undefined) {
            price.amount = dto.amount;
        }
        if (dto.bonusMultiplier !== undefined) {
            price.bonusMultiplier = dto.bonusMultiplier;
        }
        if (dto.description !== undefined) {
            price.description = dto.description;
        }
        return this.priceRepo.save(price);
    }
    async deletePrice(id) {
        const price = await this.priceRepo.findOne({ where: { id } });
        if (!price) {
            throw new common_1.NotFoundException('Price not found');
        }
        await this.priceRepo.remove(price);
        return { success: true };
    }
    async calculatePayment(params) {
        return this.dataSource.transaction(async (manager) => {
            const existing = await manager.findOne(payment_record_entity_1.PaymentRecord, {
                where: {
                    userId: params.userId,
                    actionId: params.actionId,
                },
            });
            if (existing) {
                return existing;
            }
            const price = await manager.findOne(action_price_entity_1.ActionPrice, {
                where: {
                    roleId: params.role,
                    actionType: params.actionType,
                },
            });
            if (!price) {
                throw new common_1.NotFoundException(`Price not configured for ${params.role}:${params.actionType}`);
            }
            const payment = manager.create(payment_record_entity_1.PaymentRecord, {
                userId: params.userId,
                role: params.role,
                actionId: params.actionId,
                actionType: params.actionType,
                amount: price.amount,
                status: 'pending',
            });
            return manager.save(payment);
        });
    }
    async approvePayment(paymentId) {
        const payment = await this.paymentRepo.findOne({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending payments can be approved');
        }
        payment.status = 'approved';
        return this.paymentRepo.save(payment);
    }
    async rejectPayment(paymentId) {
        const payment = await this.paymentRepo.findOne({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status === 'paid') {
            throw new common_1.BadRequestException('Cannot reject paid payment');
        }
        payment.status = 'rejected';
        return this.paymentRepo.save(payment);
    }
    async processPayments(paymentIds) {
        const payments = await this.paymentRepo.find({
            where: { id: (0, typeorm_2.In)(paymentIds) },
        });
        if (payments.length === 0) {
            throw new common_1.NotFoundException('No payments found');
        }
        for (const payment of payments) {
            if (payment.status !== 'approved') {
                throw new common_1.BadRequestException(`Payment ${payment.id} is not approved`);
            }
            payment.status = 'paid';
        }
        return this.paymentRepo.save(payments);
    }
    async getWorkerPaymentSummary(userId) {
        const payments = await this.paymentRepo.find({
            where: { userId },
        });
        const summary = {
            pending: {
                count: 0,
                total: 0,
            },
            inProcess: {
                count: 0,
                total: 0,
            },
            completed: {
                count: 0,
                total: 0,
            },
            totalEarnings: 0,
        };
        for (const payment of payments) {
            if (payment.status === 'pending') {
                summary.pending.count++;
                summary.pending.total += payment.amount;
            }
            else if (payment.status === 'approved') {
                summary.inProcess.count++;
                summary.inProcess.total += payment.amount;
            }
            else if (payment.status === 'paid') {
                summary.completed.count++;
                summary.completed.total += payment.amount;
            }
            if (payment.status !== 'rejected') {
                summary.totalEarnings += payment.amount;
            }
        }
        return summary;
    }
    async getWorkerPaymentDetails(userId, status) {
        const query = this.paymentRepo.createQueryBuilder('p');
        query.where('p.userId = :userId', { userId });
        if (status) {
            query.andWhere('p.status = :status', { status });
        }
        return query
            .orderBy('p.createdAt', 'DESC')
            .addOrderBy('p.amount', 'DESC')
            .getMany();
    }
    async getPaymentRecords(userId) {
        return this.paymentRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getAllPayments(options) {
        const { role, status, page = 1, limit = 50 } = options;
        const query = this.paymentRepo.createQueryBuilder('p');
        if (role) {
            query.where('p.role = :role', { role });
        }
        if (status) {
            query.andWhere('p.status = :status', { status });
        }
        const total = await query.getCount();
        const offset = (page - 1) * limit;
        const payments = await query
            .orderBy('p.createdAt', 'DESC')
            .skip(offset)
            .take(limit)
            .getMany();
        return {
            data: payments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getTopPerformers(role, category) {
        const query = this.paymentRepo.createQueryBuilder('p');
        query
            .where('p.role = :role', { role })
            .andWhere('p.status = :status', { status: 'paid' });
        if (category) {
            query.andWhere('p.category = :category', { category });
        }
        const topPerformers = await query
            .select('p.userId', 'userId')
            .addSelect('COUNT(p.id)', 'count')
            .addSelect('SUM(p.amount)', 'totalEarnings')
            .groupBy('p.userId')
            .orderBy('totalEarnings', 'DESC')
            .limit(3)
            .getRawMany();
        return topPerformers;
    }
    async getEarningsByRole(role) {
        const payments = await this.paymentRepo.find({
            where: { role, status: 'paid' },
        });
        const earnings = {
            byUser: {},
            total: 0,
            average: 0,
            count: payments.length,
        };
        for (const payment of payments) {
            if (!earnings.byUser[payment.userId]) {
                earnings.byUser[payment.userId] = 0;
            }
            earnings.byUser[payment.userId] += payment.amount;
            earnings.total += payment.amount;
        }
        earnings.average = payments.length > 0 ? earnings.total / payments.length : 0;
        return earnings;
    }
    async getPaymentStats() {
        const stats = {
            byStatus: {
                pending: 0,
                approved: 0,
                paid: 0,
                rejected: 0,
            },
            byRole: {},
            totalAmount: 0,
        };
        const allPayments = await this.paymentRepo.find();
        for (const payment of allPayments) {
            if (payment.status !== 'rejected') {
                stats.totalAmount += payment.amount;
            }
            stats.byStatus[payment.status] = (stats.byStatus[payment.status] || 0) + 1;
            if (!stats.byRole[payment.role]) {
                stats.byRole[payment.role] = {
                    count: 0,
                    total: 0,
                };
            }
            stats.byRole[payment.role].count++;
            if (payment.status !== 'rejected') {
                stats.byRole[payment.role].total += payment.amount;
            }
        }
        return stats;
    }
    async updateStatus(paymentId, status) {
        const payment = await this.paymentRepo.findOne({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status === 'paid') {
            throw new common_1.BadRequestException('Payment already paid');
        }
        payment.status = status;
        return this.paymentRepo.save(payment);
    }
    async markAsPaid(paymentId) {
        return this.updateStatus(paymentId, 'paid');
    }
    async getUserPayments(userId) {
        return this.paymentRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(action_price_entity_1.ActionPrice)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_record_entity_1.PaymentRecord)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map