import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { CategoryConfig } from './entities/category-config.entity';
import { UserCategory } from './entities/user-category.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(CategoryConfig)
    private readonly categoryConfigRepo: Repository<CategoryConfig>,

    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll() {
    const [categories, subAdminAssignments] = await Promise.all([
      this.categoryRepo.find({ relations: ['config'] }),
      this.userCategoryRepo.find({
        relations: ['user', 'user.roles', 'category'],
      }),
    ]);

    // Build map of categoryId -> sub-admin assignments from user_categories
    const subAdminByCategory = new Map<string, any[]>();
    subAdminAssignments
      .filter(uc => uc.user?.roles?.some(r => r.role?.name?.toLowerCase() === 'sub_admin'))
      .forEach(uc => {
        const list = subAdminByCategory.get(uc.categoryId) || [];
        list.push({ userId: uc.userId, user: uc.user });
        subAdminByCategory.set(uc.categoryId, list);
      });

    return categories.map(cat => ({
      ...cat,
      subAdminCategories: subAdminByCategory.get(cat.id) || [],
    }));
  }

  async getById(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['subAdminCategories', 'subAdminCategories.user'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(name: string, config?: any) {
    const category = this.categoryRepo.create({ name });

    if (config) {
      category.config = this.categoryConfigRepo.create({ cooldownRules: config.cooldownRules || config });
    }

    return this.categoryRepo.save(category);
  }

  async update(id: string, data: any) {
    const category = await this.getById(id);

    // Handle config separately to avoid creating new config
    if (data.config) {
      if (category.config) {
        Object.assign(category.config.cooldownRules, data.config.cooldownRules || data.config);
      } else {
        // If no config exists, create one
        category.config = this.categoryConfigRepo.create({ cooldownRules: data.config.cooldownRules || data.config });
      }
    }

    // Handle sub-admin assignments safely (user_categories table)
    if (data.subAdminIds !== undefined) {
      if (!Array.isArray(data.subAdminIds)) {
        throw new Error('subAdminIds must be an array');
      }
      await this.assignSubAdmins(id, data.subAdminIds);
    }

    // Update other fields
    const { config, subAdminIds, ...otherData } = data;
    Object.assign(category, otherData);

    return this.categoryRepo.save(category);
  }

  async updateConfig(
    categoryId: string,
    configData: Partial<CategoryConfig>,
  ) {
    const category = await this.getById(categoryId);

    Object.assign(category.config, configData);

    return this.categoryRepo.save(category);
  }

  async assignSubAdmins(categoryId: string, userIds: string[]) {
    if (!Array.isArray(userIds)) {
      throw new Error('userIds must be an array');
    }

    // Fetch existing sub-admin assignments for this category from user_categories
    const existing = await this.userCategoryRepo.find({
      where: { categoryId },
      relations: ['user', 'user.roles'],
    });

    const existingSubAdminUCs = existing.filter(uc =>
      uc.user?.roles?.some(r => r.role?.name?.toLowerCase() === 'sub_admin'),
    );

    if (existingSubAdminUCs.length) {
      await this.userCategoryRepo.delete({ id: In(existingSubAdminUCs.map(uc => uc.id)) });
    }

    if (userIds.length === 0) {
      return this.getById(categoryId);
    }

    // Ensure users exist (optional strictness)
    const users = await this.userRepo.find({
      where: { id: In(userIds) },
      relations: ['roles'],
    });

    const subAdminUsers = users.filter(u => u.roles?.some(r => r.role?.name?.toLowerCase() === 'sub_admin'));
    const subAdminUserIds = subAdminUsers.map(u => u.id);

    const assignments = subAdminUserIds.map(userId => ({
      userId,
      categoryId,
    }));

    if (assignments.length) {
      await this.userCategoryRepo.save(assignments);
    }

    return this.getById(categoryId);
  }

  async delete(id: string) {
    const category = await this.getById(id);

    // Delete config first to avoid foreign key constraint
    if (category.config) {
      await this.categoryConfigRepo.delete(category.config.id);
    }

    await this.categoryRepo.remove(category);
  }

  async getMetrics(categoryId: string) {
    // Placeholder for metrics calculation
    // This would aggregate from various tables
    return {
      totalResearchers: 0,
      totalInquirers: 0,
      totalAuditors: 0,
      approvalRate: 0,
      totalApprovedActions: 0,
    };
  }
}