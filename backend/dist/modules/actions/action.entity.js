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
exports.ApprovalRule = exports.EvidenceRule = exports.ActionInput = exports.Action = void 0;
const typeorm_1 = require("typeorm");
let Action = class Action {
};
exports.Action = Action;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Action.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Action.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Action.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Action.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Action.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Action.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ActionInput, (input) => input.action, { cascade: true }),
    __metadata("design:type", Array)
], Action.prototype, "inputs", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => EvidenceRule, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", EvidenceRule)
], Action.prototype, "evidence", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => ApprovalRule, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", ApprovalRule)
], Action.prototype, "approval", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Action.prototype, "guidelines", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Action.prototype, "deletedAt", void 0);
exports.Action = Action = __decorate([
    (0, typeorm_1.Entity)('actions')
], Action);
let ActionInput = class ActionInput {
};
exports.ActionInput = ActionInput;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ActionInput.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ActionInput.prototype, "actionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Action, (action) => action.inputs),
    __metadata("design:type", Action)
], ActionInput.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ActionInput.prototype, "inputKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ActionInput.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ActionInput.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ActionInput.prototype, "required", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActionInput.prototype, "optionsSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActionInput.prototype, "validationRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ActionInput.prototype, "order", void 0);
exports.ActionInput = ActionInput = __decorate([
    (0, typeorm_1.Entity)('action_inputs')
], ActionInput);
let EvidenceRule = class EvidenceRule {
};
exports.EvidenceRule = EvidenceRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EvidenceRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EvidenceRule.prototype, "actionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], EvidenceRule.prototype, "requiresScreenshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'image' }),
    __metadata("design:type", String)
], EvidenceRule.prototype, "screenshotType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], EvidenceRule.prototype, "screenshotContext", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], EvidenceRule.prototype, "maxSizeMb", void 0);
exports.EvidenceRule = EvidenceRule = __decorate([
    (0, typeorm_1.Entity)('evidence_rules')
], EvidenceRule);
let ApprovalRule = class ApprovalRule {
};
exports.ApprovalRule = ApprovalRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ApprovalRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ApprovalRule.prototype, "actionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ApprovalRule.prototype, "requiresApproval", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ApprovalRule.prototype, "approvalRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ApprovalRule.prototype, "approvalCriteria", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ApprovalRule.prototype, "rejectionReasonGroupId", void 0);
exports.ApprovalRule = ApprovalRule = __decorate([
    (0, typeorm_1.Entity)('approval_rules')
], ApprovalRule);
//# sourceMappingURL=action.entity.js.map