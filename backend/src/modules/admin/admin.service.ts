import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';

import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  async createSubAdmin(dto: CreateSubAdminDto) {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepo.findOne({
      where: { name: 'sub_admin' },
    });

    if (!role) {
      throw new NotFoundException('Role sub_admin not found');
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

  async assignCategories(dto: AssignCategoryDto) {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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
}