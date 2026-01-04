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

    @InjectRepository(CategoryConfig)
    private readonly configRepo: Repository<CategoryConfig>,
  ) {}

  async findAll() {
    return this.categoryRepo.find({
      relations: ['config'],
    });
  }

  async findById(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['config'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(name: string) {
    const category = this.categoryRepo.create({
      name,
      config: this.configRepo.create(),
    });

    return this.categoryRepo.save(category);
  }

  async updateConfig(
    categoryId: string,
    config: Partial<CategoryConfig>,
  ) {
    const category = await this.findById(categoryId);

    Object.assign(category.config, config);

    await this.configRepo.save(category.config);

    return this.findById(categoryId);
  }
}
