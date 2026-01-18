import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
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

  @Get()
  @Roles('SUPER_ADMIN', 'SUB_ADMIN')
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() data: { name: string; config?: any }) {
    return this.categoriesService.create(data.name, data.config);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.update(id, data);
  }

  /**
   * Asigna sub-admins a una categoría.
   * Validación estricta: el body debe tener un array de userIds o subAdminIds.
   */
  @Post(':id/sub-admins')
  @Roles('SUPER_ADMIN')
  assignSubAdmins(
    @Param('id') categoryId: string,
    @Body() body: any,
  ) {
    // Accept both userIds and subAdminIds for compatibility
    const ids = Array.isArray(body.userIds)
      ? body.userIds
      : Array.isArray(body.subAdminIds)
        ? body.subAdminIds
        : null;
    if (!ids) {
      throw new BadRequestException('userIds or subAdminIds must be an array');
    }
    return this.categoriesService.assignSubAdmins(categoryId, ids);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}