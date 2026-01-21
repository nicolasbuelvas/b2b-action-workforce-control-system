"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const research_service_1 = require("./research.service");
const research_controller_1 = require("./research.controller");
const company_entity_1 = require("./entities/company.entity");
const research_task_entity_1 = require("./entities/research-task.entity");
const linkedin_profile_entity_1 = require("./entities/linkedin-profile.entity");
const research_submission_entity_1 = require("./entities/research-submission.entity");
const categories_module_1 = require("../categories/categories.module");
let ResearchModule = class ResearchModule {
};
exports.ResearchModule = ResearchModule;
exports.ResearchModule = ResearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                company_entity_1.Company,
                linkedin_profile_entity_1.LinkedInProfile,
                research_task_entity_1.ResearchTask,
                research_submission_entity_1.ResearchSubmission,
            ]),
            categories_module_1.CategoriesModule,
        ],
        controllers: [research_controller_1.ResearchController],
        providers: [research_service_1.ResearchService],
    })
], ResearchModule);
//# sourceMappingURL=research.module.js.map