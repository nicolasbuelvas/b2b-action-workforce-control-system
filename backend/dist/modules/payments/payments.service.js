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
                    role: params.role,
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
    async approvePayment(paymentId) {
        return this.updateStatus(paymentId, 'approved');
    }
    async markAsPaid(paymentId) {
        return this.updateStatus(paymentId, 'paid');
    }
    async rejectPayment(paymentId) {
        return this.updateStatus(paymentId, 'rejected');
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