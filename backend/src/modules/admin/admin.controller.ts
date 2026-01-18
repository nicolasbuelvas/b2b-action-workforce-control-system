import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';

import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Roles('super_admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('categories')
  getCategories() {
    return this.adminService.getCategories();
  }

  @Get('top-workers')
  getTopWorkers() {
    return this.adminService.getTopWorkers();
  }

  @Get('system-logs')
  getSystemLogs() {
    return this.adminService.getSystemLogs();
  }

  @Post('sub-admin')
  createSubAdmin(@Body() dto: CreateSubAdminDto) {
    return this.adminService.createSubAdmin(dto);
  }

  @Post('assign-category')
  assignCategory(@Body() dto: AssignCategoryDto) {
    return this.adminService.assignCategories(dto);
  }

  @Get('sub-admins')
  getSubAdmins() {
    return this.adminService.getSubAdmins();
  }
}