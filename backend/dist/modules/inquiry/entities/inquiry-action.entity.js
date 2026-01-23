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
exports.InquiryAction = exports.InquiryActionStatus = void 0;
const typeorm_1 = require("typeorm");
var InquiryActionStatus;
(function (InquiryActionStatus) {
    InquiryActionStatus["PENDING"] = "PENDING";
    InquiryActionStatus["SUBMITTED"] = "SUBMITTED";
    InquiryActionStatus["APPROVED"] = "APPROVED";
    InquiryActionStatus["REJECTED"] = "REJECTED";
})(InquiryActionStatus || (exports.InquiryActionStatus = InquiryActionStatus = {}));
let InquiryAction = class InquiryAction {
};
exports.InquiryAction = InquiryAction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InquiryAction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taskid' }),
    __metadata("design:type", String)
], InquiryAction.prototype, "inquiryTaskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actionindex' }),
    __metadata("design:type", Number)
], InquiryAction.prototype, "actionIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'performedbyuserid' }),
    __metadata("design:type", String)
], InquiryAction.prototype, "performedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InquiryActionStatus,
        default: InquiryActionStatus.PENDING,
    }),
    __metadata("design:type", String)
], InquiryAction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'createdat' }),
    __metadata("design:type", Date)
], InquiryAction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewedat', nullable: true }),
    __metadata("design:type", Date)
], InquiryAction.prototype, "reviewedAt", void 0);
exports.InquiryAction = InquiryAction = __decorate([
    (0, typeorm_1.Entity)('inquiry_actions')
], InquiryAction);
//# sourceMappingURL=inquiry-action.entity.js.map