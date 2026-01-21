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
exports.ResearchTask = exports.ResearchStatus = void 0;
const typeorm_1 = require("typeorm");
var ResearchStatus;
(function (ResearchStatus) {
    ResearchStatus["PENDING"] = "PENDING";
    ResearchStatus["COMPLETED"] = "COMPLETED";
    ResearchStatus["REJECTED"] = "REJECTED";
})(ResearchStatus || (exports.ResearchStatus = ResearchStatus = {}));
let ResearchTask = class ResearchTask {
};
exports.ResearchTask = ResearchTask;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ResearchTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ResearchTask.prototype, "targetId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ResearchTask.prototype, "targetType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ResearchTask.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ResearchStatus,
        default: ResearchStatus.PENDING,
    }),
    __metadata("design:type", String)
], ResearchTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ResearchTask.prototype, "assignedToUserId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ResearchTask.prototype, "createdAt", void 0);
exports.ResearchTask = ResearchTask = __decorate([
    (0, typeorm_1.Entity)('research_tasks')
], ResearchTask);
//# sourceMappingURL=research-task.entity.js.map