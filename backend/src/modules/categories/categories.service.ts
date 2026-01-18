import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { CategoryConfig } from './entities/category-config.entity';
import { SubAdminCategory } from './entities/sub-admin-category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(CategoryConfig)
    private readonly categoryConfigRepo: Repository<CategoryConfig>,

    @InjectRepository(SubAdminCategory)
    private readonly subAdminCategoryRepo: Repository<SubAdminCategory>,
  ) {}

  async findAll() {
    return this.categoryRepo.find({
      relations: ['subAdminCategories', 'subAdminCategories.user'],
    });
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

    // Handle sub-admin assignments
    if (data.subAdminIds !== undefined) {
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
    // Remove existing
    await this.subAdminCategoryRepo.delete({ categoryId });

    // Add new
    const assignments = userIds.map(userId => ({
      userId,
      categoryId,
    }));

    await this.subAdminCategoryRepo.save(assignments);

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