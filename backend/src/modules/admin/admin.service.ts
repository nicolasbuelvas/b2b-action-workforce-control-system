import { Injectable } from '@nestjs/common';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignCategoryDto } from './dto/assign-category.dto';

@Injectable()
export class AdminService {

  private subAdmins = new Map<string, string[]>(); 

  createSubAdmin(dto: CreateSubAdminDto) {
    this.subAdmins.set(dto.userId, dto.categoryIds);

    return {
      userId: dto.userId,
      categories: dto.categoryIds,
      role: 'SUB_ADMIN',
    };
  }

  assignCategories(dto: AssignCategoryDto) {
    this.subAdmins.set(dto.subAdminId, dto.categoryIds);

    return {
      subAdminId: dto.subAdminId,
      categories: dto.categoryIds,
    };
  }

  getSubAdmins() {
    return Array.from(this.subAdmins.entries()).map(
      ([userId, categories]) => ({
        userId,
        categories,
      }),
    );
  }
}
