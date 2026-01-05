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
exports.ScreenshotsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const screenshot_hash_entity_1 = require("./entities/screenshot-hash.entity");
const hash_util_1 = require("../../common/utils/hash.util");
let ScreenshotsService = class ScreenshotsService {
    constructor(hashRepo) {
        this.hashRepo = hashRepo;
    }
    async processScreenshot(buffer, userId, mimeType) {
        if (!buffer || !buffer.length) {
            throw new common_1.BadRequestException({
                code: 'INVALID_SCREENSHOT',
                message: 'Screenshot buffer is empty',
            });
        }
        const hash = (0, hash_util_1.generateFileHash)(buffer);
        const exists = await this.hashRepo.findOne({
            where: { hash },
        });
        if (exists) {
            throw new common_1.BadRequestException({
                code: 'DUPLICATE_SCREENSHOT',
                message: 'Duplicate screenshot detected',
            });
        }
        await this.hashRepo.save({
            hash,
            uploadedByUserId: userId,
            fileSize: buffer.length,
            mimeType: mimeType ?? 'unknown',
        });
        return hash;
    }
};
exports.ScreenshotsService = ScreenshotsService;
exports.ScreenshotsService = ScreenshotsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(screenshot_hash_entity_1.ScreenshotHash)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ScreenshotsService);
//# sourceMappingURL=screenshots.service.js.map