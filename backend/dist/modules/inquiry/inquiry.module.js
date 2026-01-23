"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const inquiry_service_1 = require("./inquiry.service");
const inquiry_controller_1 = require("./inquiry.controller");
const inquiry_action_entity_1 = require("./entities/inquiry-action.entity");
const inquiry_task_entity_1 = require("./entities/inquiry-task.entity");
const outreach_record_entity_1 = require("./entities/outreach-record.entity");
const screenshots_module_1 = require("../screenshots/screenshots.module");
const cooldown_module_1 = require("../cooldown/cooldown.module");
const research_task_entity_1 = require("../research/entities/research-task.entity");
const research_submission_entity_1 = require("../research/entities/research-submission.entity");
const company_entity_1 = require("../research/entities/company.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const user_category_entity_1 = require("../categories/entities/user-category.entity");
let InquiryModule = class InquiryModule {
};
exports.InquiryModule = InquiryModule;
exports.InquiryModule = InquiryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                inquiry_action_entity_1.InquiryAction,
                inquiry_task_entity_1.InquiryTask,
                outreach_record_entity_1.OutreachRecord,
                research_task_entity_1.ResearchTask,
                research_submission_entity_1.ResearchSubmission,
                company_entity_1.Company,
                category_entity_1.Category,
                user_category_entity_1.UserCategory,
            ]),
            screenshots_module_1.ScreenshotsModule,
            cooldown_module_1.CooldownModule,
        ],
        controllers: [inquiry_controller_1.InquiryController],
        providers: [inquiry_service_1.InquiryService],
    })
], InquiryModule);
//# sourceMappingURL=inquiry.module.js.map