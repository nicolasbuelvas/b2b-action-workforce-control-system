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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const user_role_entity_1 = require("./entities/user-role.entity");
let RolesService = class RolesService {
    constructor(roleRepo, userRoleRepo) {
        this.roleRepo = roleRepo;
        this.userRoleRepo = userRoleRepo;
    }
    async createRole(name) {
        const existing = await this.roleRepo.findOne({ where: { name } });
        if (existing) {
            throw new common_1.ConflictException('Role already exists');
        }
        return this.roleRepo.save({ name });
    }
    async getRoleByName(name) {
        const role = await this.roleRepo.findOne({ where: { name } });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        return role;
    }
    async getAllRoles() {
        return this.roleRepo.find();
    }
    async assignRoleToUser(userId, roleName) {
        const role = await this.getRoleByName(roleName);
        const existing = await this.userRoleRepo.findOne({
            where: { userId, roleId: role.id },
        });
        if (existing) {
            throw new common_1.ConflictException('User already has this role');
        }
        return this.userRoleRepo.save({
            userId,
            roleId: role.id,
        });
    }
    async getUserRoles(userId) {
        const records = await this.userRoleRepo.find({
            where: { userId },
        });
        if (!records.length)
            return [];
        const roleIds = records.map(r => r.roleId);
        const roles = await this.roleRepo.findByIds(roleIds);
        return roles.map(r => r.name);
    }
    async userHasRole(userId, roleName) {
        const role = await this.roleRepo.findOne({
            where: { name: roleName },
        });
        if (!role)
            return false;
        const record = await this.userRoleRepo.findOne({
            where: { userId, roleId: role.id },
        });
        return Boolean(record);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map