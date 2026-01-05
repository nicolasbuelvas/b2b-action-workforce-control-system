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
exports.InquiryTask = exports.InquiryStatus = void 0;
const typeorm_1 = require("typeorm");
var InquiryStatus;
(function (InquiryStatus) {
    InquiryStatus["PENDING"] = "PENDING";
    InquiryStatus["COMPLETED"] = "COMPLETED";
    InquiryStatus["FAILED"] = "FAILED";
})(InquiryStatus || (exports.InquiryStatus = InquiryStatus = {}));
let InquiryTask = class InquiryTask {
};
exports.InquiryTask = InquiryTask;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InquiryTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InquiryTask.prototype, "targetId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InquiryTask.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InquiryStatus,
        default: InquiryStatus.PENDING,
    }),
    __metadata("design:type", String)
], InquiryTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InquiryTask.prototype, "assignedToUserId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InquiryTask.prototype, "createdAt", void 0);
exports.InquiryTask = InquiryTask = __decorate([
    (0, typeorm_1.Entity)('inquiry_tasks')
], InquiryTask);
//# sourceMappingURL=inquiry-task.entity.js.map