import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';
import { AssignUserToCategoriesDto } from './dto/assign-user-categories.dto';
import { RemoveUserFromCategoryDto } from './dto/remove-user-category.dto';

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

  @Get('users')
  getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
    @Query('role') role: string = '',
    @Query('status') status: string = '',
  ) {
    return this.adminService.getUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      role,
      status,
    });
  }

  @Get('users/stats')
  getUsersStats() {
    return this.adminService.getUsersStats();
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updateUserStatus(id, body.status);
  }

  @Post('users/:id/reset-password')
  resetUserPassword(@Param('id') id: string, @Body() body?: { password?: string }) {
    return this.adminService.resetUserPassword(id, body?.password);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('sub-admin')
  createSubAdmin(@Body() dto: CreateSubAdminDto) {
    return this.adminService.createSubAdmin(dto);
  }

  @Post('assign-category')
  assignCategory(@Body() dto: AssignCategoryDto) {
    return this.adminService.assignCategories(dto);
  }

  @Post('users/assign-categories')
  assignUserToCategories(@Body() dto: AssignUserToCategoriesDto) {
    return this.adminService.assignUserToCategories(dto);
  }

  @Delete('users/remove-from-category')
  removeUserFromCategory(@Body() dto: RemoveUserFromCategoryDto) {
    return this.adminService.removeUserFromCategory(dto);
  }

  @Get('users/:userId/categories')
  getUserCategories(@Param('userId') userId: string) {
    return this.adminService.getUserCategories(userId);
  }

  @Get('sub-admins')
  getSubAdmins() {
    return this.adminService.getSubAdmins();
  }
}