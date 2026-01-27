"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_service_1 = require("./audit.service");
const audit_controller_1 = require("./audit.controller");
const research_task_entity_1 = require("../research/entities/research-task.entity");
const research_audit_entity_1 = require("./entities/research-audit.entity");
const rejection_reason_entity_1 = require("./entities/rejection-reason.entity");
const flagged_action_entity_1 = require("./entities/flagged-action.entity");
const research_submission_entity_1 = require("../research/entities/research-submission.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const user_category_entity_1 = require("../categories/entities/user-category.entity");
const company_entity_1 = require("../research/entities/company.entity");
const user_entity_1 = require("../users/entities/user.entity");
const inquiry_task_entity_1 = require("../inquiry/entities/inquiry-task.entity");
const inquiry_action_entity_1 = require("../inquiry/entities/inquiry-action.entity");
const outreach_record_entity_1 = require("../inquiry/entities/outreach-record.entity");
const inquiry_submission_snapshot_entity_1 = require("../inquiry/entities/inquiry-submission-snapshot.entity");
const screenshots_module_1 = require("../screenshots/screenshots.module");
const linkedin_profile_entity_1 = require("../research/entities/linkedin-profile.entity");
const disapproval_reason_entity_1 = require("../subadmin/entities/disapproval-reason.entity");
const user_role_entity_1 = require("../roles/entities/user-role.entity");
const role_entity_1 = require("../roles/entities/role.entity");
let AuditModule = class AuditModule {
};
exports.AuditModule = AuditModule;
exports.AuditModule = AuditModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                research_task_entity_1.ResearchTask,
                research_audit_entity_1.ResearchAudit,
                rejection_reason_entity_1.RejectionReason,
                flagged_action_entity_1.FlaggedAction,
                research_submission_entity_1.ResearchSubmission,
                category_entity_1.Category,
                user_category_entity_1.UserCategory,
                company_entity_1.Company,
                user_entity_1.User,
                inquiry_task_entity_1.InquiryTask,
                inquiry_action_entity_1.InquiryAction,
                outreach_record_entity_1.OutreachRecord,
                inquiry_submission_snapshot_entity_1.InquirySubmissionSnapshot,
                linkedin_profile_entity_1.LinkedInProfile,
                disapproval_reason_entity_1.DisapprovalReason,
                user_role_entity_1.UserRole,
                role_entity_1.Role,
            ]),
            screenshots_module_1.ScreenshotsModule,
        ],
        controllers: [audit_controller_1.AuditController],
        providers: [audit_service_1.AuditService],
    })
], AuditModule);
//# sourceMappingURL=audit.module.js.map