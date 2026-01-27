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
exports.InquiryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const inquiry_service_1 = require("./inquiry.service");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let InquiryController = class InquiryController {
    constructor(inquiryService) {
        this.inquiryService = inquiryService;
    }
    getWebsiteTasks(userId) {
        return this.inquiryService.getAvailableTasks(userId, 'website');
    }
    getLinkedInTasks(userId) {
        return this.inquiryService.getAvailableTasks(userId, 'linkedin');
    }
    takeInquiry(body, userId) {
        return this.inquiryService.takeInquiry(body.inquiryTaskId, userId);
    }
    async submitInquiry(body, file, userId) {
        try {
            console.log('[INQUIRY-SUBMIT] ========== REQUEST START =========');
            console.log('[INQUIRY-SUBMIT] UserId:', userId);
            console.log('[INQUIRY-SUBMIT] Body:', body);
            console.log('[INQUIRY-SUBMIT] Body keys:', body ? Object.keys(body) : 'NO BODY');
            console.log('[INQUIRY-SUBMIT] File:', file ? `${file.originalname} (${file.size} bytes)` : 'NO FILE');
            if (!file) {
                console.error('[INQUIRY-SUBMIT] ERROR: No file uploaded');
                throw new common_1.BadRequestException('Screenshot file is required');
            }
            if (!file.buffer) {
                console.error('[INQUIRY-SUBMIT] ERROR: File buffer missing');
                throw new common_1.BadRequestException('Invalid file - buffer missing');
            }
            if (file.size === 0) {
                console.error('[INQUIRY-SUBMIT] ERROR: File empty');
                throw new common_1.BadRequestException('File cannot be empty');
            }
            if (!body || !body.inquiryTaskId) {
                console.error('[INQUIRY-SUBMIT] ERROR: Missing inquiryTaskId');
                throw new common_1.BadRequestException('inquiryTaskId is required');
            }
            if (!body.actionType) {
                console.error('[INQUIRY-SUBMIT] ERROR: Missing actionType');
                throw new common_1.BadRequestException('actionType is required');
            }
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(body.inquiryTaskId)) {
                console.error('[INQUIRY-SUBMIT] ERROR: Invalid UUID:', body.inquiryTaskId);
                throw new common_1.BadRequestException('inquiryTaskId must be a valid UUID');
            }
            const validTypes = ['EMAIL', 'LINKEDIN', 'CALL', 'LINKEDIN_OUTREACH', 'LINKEDIN_EMAIL_REQUEST', 'LINKEDIN_CATALOGUE'];
            if (!validTypes.includes(body.actionType)) {
                console.error('[INQUIRY-SUBMIT] ERROR: Invalid actionType:', body.actionType);
                throw new common_1.BadRequestException(`actionType must be one of: ${validTypes.join(', ')}`);
            }
            const dto = {
                inquiryTaskId: body.inquiryTaskId,
                actionType: body.actionType,
            };
            console.log('[INQUIRY-SUBMIT] DTO constructed:', dto);
            const result = await this.inquiryService.submitInquiry(dto, file.buffer, userId);
            console.log('[INQUIRY-SUBMIT] ========== REQUEST SUCCESS =========');
            return result;
        }
        catch (error) {
            console.error('[INQUIRY-SUBMIT] ========== REQUEST FAILED =========');
            console.error('[INQUIRY-SUBMIT] Error:', error.message);
            console.error('[INQUIRY-SUBMIT] Stack:', error.stack);
            throw error;
        }
    }
};
exports.InquiryController = InquiryController;
__decorate([
    (0, common_1.Get)('tasks/website'),
    (0, roles_decorator_1.Roles)('website_inquirer'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InquiryController.prototype, "getWebsiteTasks", null);
__decorate([
    (0, common_1.Get)('tasks/linkedin'),
    (0, roles_decorator_1.Roles)('linkedin_inquirer'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InquiryController.prototype, "getLinkedInTasks", null);
__decorate([
    (0, common_1.Post)('take'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InquiryController.prototype, "takeInquiry", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('screenshot')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], InquiryController.prototype, "submitInquiry", null);
exports.InquiryController = InquiryController = __decorate([
    (0, common_1.Controller)('inquiry'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [inquiry_service_1.InquiryService])
], InquiryController);
//# sourceMappingURL=inquiry.controller.js.map