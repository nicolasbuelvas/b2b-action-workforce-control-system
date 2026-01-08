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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const user_role_entity_1 = require("../roles/entities/user-role.entity");
let AdminService = class AdminService {
    constructor(userRepo, roleRepo, userRoleRepo) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.userRoleRepo = userRoleRepo;
    }
    async createSubAdmin(dto) {
        const user = await this.userRepo.findOne({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const role = await this.roleRepo.findOne({
            where: { name: 'sub_admin' },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role sub_admin not found');
        }
        await this.userRoleRepo.save({
            userId: user.id,
            roleId: role.id,
        });
        return {
            userId: user.id,
            role: role.name,
            categories: dto.categoryIds,
        };
    }
    async assignCategories(dto) {
        const user = await this.userRepo.findOne({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            userId: user.id,
            categories: dto.categoryIds,
        };
    }
    async getSubAdmins() {
        return this.userRoleRepo
            .createQueryBuilder('ur')
            .innerJoin('ur.user', 'user')
            .innerJoin('ur.role', 'role')
            .where('role.name = :role', { role: 'sub_admin' })
            .select([
            'user.id',
            'user.email',
            'user.name',
            'role.name',
        ])
            .getMany();
    }
    async getDashboard() {
        const usersCount = await this.userRepo.count();
        const subAdminsCount = await this.userRoleRepo.count({
            where: { role: { name: 'sub_admin' } },
        });
        return {
            usersCount,
            subAdminsCount,
            status: 'ok',
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map