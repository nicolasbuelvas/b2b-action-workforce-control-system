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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("./entities/user.entity");
const roles_service_1 = require("../roles/roles.service");
const user_category_entity_1 = require("../categories/entities/user-category.entity");
let UsersService = class UsersService {
    constructor(userRepo, userCategoryRepo, rolesService) {
        this.userRepo = userRepo;
        this.userCategoryRepo = userCategoryRepo;
        this.rolesService = rolesService;
    }
    async create(dto) {
        const existing = await this.userRepo.findOne({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already in use');
        }
        const password_hash = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            name: dto.name,
            email: dto.email,
            password_hash,
            country: dto.country,
        });
        const savedUser = await this.userRepo.save(user);
        if (dto.role) {
            await this.rolesService.assignRoleToUser(savedUser.id, dto.role);
        }
        if (dto.role === 'sub_admin' && dto.categoryIds && dto.categoryIds.length > 0) {
        }
        return this.userRepo.findOne({
            where: { id: savedUser.id },
            relations: ['roles'],
        });
    }
    async findById(id) {
        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['roles'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepo.findOne({
            where: { email },
            relations: ['roles'],
        });
    }
    async findAll() {
        return this.userRepo.find({
            relations: ['roles'],
            order: { createdAt: 'DESC' },
        });
    }
    async suspendUser(userId) {
        const user = await this.findById(userId);
        user.status = 'suspended';
        return this.userRepo.save(user);
    }
    async getUserCategories(userId) {
        console.log('[getUserCategories] Fetching categories for userId:', userId);
        console.log('[getUserCategories] userId type:', typeof userId, 'value:', JSON.stringify(userId));
        if (!userId || userId === 'undefined' || userId === 'null') {
            console.error('[getUserCategories] SECURITY VIOLATION: userId is invalid:', userId);
            throw new Error('Unauthorized: User ID is required to access categories');
        }
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['roles'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const inquirerRoles = ['website_inquirer', 'linkedin_inquirer'];
        const userRole = user.roles && user.roles.length > 0 ? user.roles[0].role?.name : null;
        if (userRole && inquirerRoles.includes(userRole)) {
            console.log('[getUserCategories] User is inquirer role, returning empty categories');
            return [];
        }
        const userCategories = await this.userCategoryRepo.find({
            where: { userId },
            relations: ['category'],
        });
        console.log('[getUserCategories] Found', userCategories.length, 'user_categories records');
        const result = userCategories
            .filter(uc => {
            if (!uc.category) {
                console.warn('[getUserCategories] WARNING: user_category record has null category:', uc.id);
                return false;
            }
            return true;
        })
            .map(uc => ({
            id: uc.category.id,
            name: uc.category.name,
            assignedAt: uc.createdAt,
        }));
        console.log('[getUserCategories] Returning', result.length, 'categories:', result.map(c => c.name).join(', '));
        return result;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_category_entity_1.UserCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        roles_service_1.RolesService])
], UsersService);
//# sourceMappingURL=users.service.js.map