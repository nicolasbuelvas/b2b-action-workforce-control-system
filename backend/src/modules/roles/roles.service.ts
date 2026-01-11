import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  /* ---------------- ROLES ---------------- */

  async createRole(name: string) {
    const existing = await this.roleRepo.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('Role already exists');
    }

    return this.roleRepo.save({ name });
  }

  async getRoleByName(name: string) {
    const role = await this.roleRepo.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async getAllRoles() {
    return this.roleRepo.find();
  }

  /* ---------------- USER ROLES ---------------- */

  async assignRoleToUser(userId: string, roleName: string) {
    const role = await this.getRoleByName(roleName);

    const existing = await this.userRoleRepo.findOne({
      where: { userId, roleId: role.id },
    });

    if (existing) {
      throw new ConflictException('User already has this role');
    }

    return this.userRoleRepo.save({
      userId,
      roleId: role.id,
    });
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const records = await this.userRoleRepo.find({
      where: { userId },
    });

    if (!records.length) return [];

    const roleIds = records.map(r => r.roleId);

    const roles = await this.roleRepo.findByIds(roleIds);
    return roles.map(r => r.name);
  }

  async userHasRole(userId: string, roleName: string): Promise<boolean> {
    const role = await this.roleRepo.findOne({
      where: { name: roleName },
    });

    if (!role) return false;

    const record = await this.userRoleRepo.findOne({
      where: { userId, roleId: role.id },
    });

    return Boolean(record);
  }
}