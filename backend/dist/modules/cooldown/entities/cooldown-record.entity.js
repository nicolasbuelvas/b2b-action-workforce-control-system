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
exports.CooldownRecord = void 0;
const typeorm_1 = require("typeorm");
let CooldownRecord = class CooldownRecord {
};
exports.CooldownRecord = CooldownRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CooldownRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CooldownRecord.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CooldownRecord.prototype, "targetId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CooldownRecord.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CooldownRecord.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CooldownRecord.prototype, "actionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CooldownRecord.prototype, "cooldownStartedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CooldownRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CooldownRecord.prototype, "updatedAt", void 0);
exports.CooldownRecord = CooldownRecord = __decorate([
    (0, typeorm_1.Entity)('cooldown_records'),
    (0, typeorm_1.Index)(['userId', 'targetId', 'actionType', 'categoryId'], { unique: true })
], CooldownRecord);
//# sourceMappingURL=cooldown-record.entity.js.map