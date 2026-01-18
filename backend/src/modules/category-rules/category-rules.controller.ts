import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoryRulesService } from './category-rules.service';
import { CreateCategoryRuleDto } from './dto/create-category-rule.dto';
import { UpdateCategoryRuleDto } from './dto/update-category-rule.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/category-rules')
@UseGuards(JwtGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class CategoryRulesController {
  constructor(private readonly categoryRulesService: CategoryRulesService) {}

  @Get()
  findAll() {
    return this.categoryRulesService.findAll();
  }

  @Post()
  create(@Body() createCategoryRuleDto: CreateCategoryRuleDto) {
    return this.categoryRulesService.create(createCategoryRuleDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryRuleDto: UpdateCategoryRuleDto) {
    return this.categoryRulesService.update(id, updateCategoryRuleDto);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.categoryRulesService.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryRulesService.remove(id);
  }
}