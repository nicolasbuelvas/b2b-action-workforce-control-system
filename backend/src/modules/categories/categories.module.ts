import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { CategoryConfig } from './entities/category-config.entity';
import { SubAdminCategory } from './entities/sub-admin-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, CategoryConfig, SubAdminCategory]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
