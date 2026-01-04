import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('categories')
@UseGuards(JwtGuard, RolesGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body('name') name: string) {
    return this.categoriesService.create(name);
  }

  @Patch(':id/config')
  @Roles('SUPER_ADMIN')
  updateConfig(
    @Param('id') categoryId: string,
    @Body() config: any,
  ) {
    return this.categoriesService.updateConfig(
      categoryId,
      config,
    );
  }
}
