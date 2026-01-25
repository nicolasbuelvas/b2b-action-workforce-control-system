"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const screenshot_entity_1 = require("./entities/screenshot.entity");
const hash_util_1 = require("../../common/utils/hash.util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let ScreenshotsService = class ScreenshotsService {
    constructor(hashRepo, screenshotRepo) {
        this.hashRepo = hashRepo;
        this.screenshotRepo = screenshotRepo;
        this.uploadsDir = 'uploads/screenshots';
        this.ensureUploadsDirExists();
    }
    ensureUploadsDirExists() {
        const fullPath = path.join(process.cwd(), this.uploadsDir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log('[SCREENSHOTS] Created uploads directory:', fullPath);
        }
    }
    async processScreenshot(buffer, userId, mimeType) {
        if (!buffer || !buffer.length) {
            throw new common_1.BadRequestException({
                code: 'INVALID_SCREENSHOT',
                message: 'Screenshot buffer is empty',
            });
        }
        const hash = (0, hash_util_1.generateFileHash)(buffer);
        const existing = await this.hashRepo.findOne({
            where: { hash },
        });
        if (existing) {
            console.log('[SCREENSHOTS] Duplicate screenshot detected:', existing.id);
            return {
                screenshotId: existing.id,
                isDuplicate: true,
                existingScreenshotId: existing.id,
            };
        }
        const saved = await this.hashRepo.save({
            hash,
            uploadedByUserId: userId,
            fileSize: buffer.length,
            mimeType: mimeType ?? 'unknown',
        });
        console.log('[SCREENSHOTS] New screenshot saved:', saved.id);
        return {
            screenshotId: saved.id,
            isDuplicate: false,
        };
    }
    async saveScreenshotFile(buffer, actionId, userId, mimeType, isDuplicateFromProcessing) {
        const hash = (0, hash_util_1.generateFileHash)(buffer);
        const ext = mimeType === 'image/png' ? 'png' : 'jpg';
        const filename = `${actionId}.${ext}`;
        const relativePath = `${this.uploadsDir}/${filename}`;
        const fullPath = path.join(process.cwd(), relativePath);
        const dirPath = path.dirname(fullPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log('[SCREENSHOTS] Created directory:', dirPath);
        }
        try {
            fs.writeFileSync(fullPath, buffer);
            console.log('[SCREENSHOTS] File saved:', fullPath);
        }
        catch (err) {
            console.error('[SCREENSHOTS] ERROR writing file:', fullPath, err);
            throw err;
        }
        const screenshot = await this.screenshotRepo.save({
            actionId,
            filePath: relativePath,
            mimeType,
            fileSize: buffer.length,
            hash,
            isDuplicate: isDuplicateFromProcessing,
            uploadedByUserId: userId,
        });
        console.log('[SCREENSHOTS] Screenshot metadata saved:', screenshot.id, 'isDuplicate:', isDuplicateFromProcessing);
        return screenshot;
    }
    async getScreenshotByActionId(actionId) {
        return this.screenshotRepo.findOne({ where: { actionId } });
    }
};
exports.ScreenshotsService = ScreenshotsService;
exports.ScreenshotsService = ScreenshotsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(screenshot_hash_entity_1.ScreenshotHash)),
    __param(1, (0, typeorm_1.InjectRepository)(screenshot_entity_1.Screenshot)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ScreenshotsService);
//# sourceMappingURL=screenshots.service.js.map