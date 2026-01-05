import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('categories')
@UseGuards(JwtGuard, RolesGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Patch(':id/config')
  @Roles('SUPER_ADMIN')
  updateConfig(
    @Param('id') categoryId: string,
    @Body('cooldownRules') cooldownRules: Record<string, any>,
  ) {
    return this.categoriesService.updateConfig(
      categoryId,
      cooldownRules,
    );
  }
}