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
exports.ResearchSubmission = void 0;
const typeorm_1 = require("typeorm");
const research_task_entity_1 = require("./research-task.entity");
let ResearchSubmission = class ResearchSubmission {
};
exports.ResearchSubmission = ResearchSubmission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ResearchSubmission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'researchtaskid' }),
    __metadata("design:type", String)
], ResearchSubmission.prototype, "researchTaskId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => research_task_entity_1.ResearchTask),
    (0, typeorm_1.JoinColumn)({ name: 'researchtaskid' }),
    __metadata("design:type", research_task_entity_1.ResearchTask)
], ResearchSubmission.prototype, "researchTask", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ResearchSubmission.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'email' }),
    __metadata("design:type", String)
], ResearchSubmission.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'phone' }),
    __metadata("design:type", String)
], ResearchSubmission.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'techstack' }),
    __metadata("design:type", String)
], ResearchSubmission.prototype, "techStack", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'notes' }),
    __metadata("design:type", String)
], ResearchSubmission.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'screenshotpath' }),
    __metadata("design:type", String)
], ResearchSubmission.prototype, "screenshotPath", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'createdat' }),
    __metadata("design:type", Date)
], ResearchSubmission.prototype, "createdAt", void 0);
exports.ResearchSubmission = ResearchSubmission = __decorate([
    (0, typeorm_1.Entity)('research_submissions')
], ResearchSubmission);
//# sourceMappingURL=research-submission.entity.js.map