import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { CategoryConfig } from './entities/category-config.entity';
import { SubAdminCategory } from './entities/sub-admin-category.entity';
import { UserCategory } from './entities/user-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, CategoryConfig, SubAdminCategory, UserCategory]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService, TypeOrmModule],
})
export class CategoriesModule {}
