import { Controller, Post, Body, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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