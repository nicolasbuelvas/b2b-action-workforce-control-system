import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { CategoryConfig } from './entities/category-config.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoryRepo.find();
  }

  async getById(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(name: string) {
    const category = this.categoryRepo.create({
      name,
      config: {
        cooldownRules: {},
      },
    });

    return this.categoryRepo.save(category);
  }

  async updateConfig(
    categoryId: string,
    cooldownRules: Record<string, any>,
  ) {
    const category = await this.getById(categoryId);

    category.config.cooldownRules = cooldownRules;

    return this.categoryRepo.save(category);
  }
}