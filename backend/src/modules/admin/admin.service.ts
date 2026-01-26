import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { InquiryAction, InquiryActionStatus } from '../inquiry/entities/inquiry-action.entity';
import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchAudit } from '../audit/entities/research-audit.entity';
import { Category } from '../categories/entities/category.entity';
import { SubAdminCategory } from '../categories/entities/sub-admin-category.entity';
import { UserCategory } from '../categories/entities/user-category.entity';

import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import { AssignUserToCategoriesDto } from './dto/assign-user-categories.dto';
import { RemoveUserFromCategoryDto } from './dto/remove-user-category.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,

    @InjectRepository(InquiryAction)
    private readonly inquiryActionRepo: Repository<InquiryAction>,

    @InjectRepository(ResearchTask)
    private readonly researchTaskRepo: Repository<ResearchTask>,

    @InjectRepository(ResearchAudit)
    private readonly researchAuditRepo: Repository<ResearchAudit>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(SubAdminCategory)
    private readonly subAdminCategoryRepo: Repository<SubAdminCategory>,

    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,
  ) {}

  async getDashboard() {
    const totalUsers = await this.userRepo.count();

    const totalResearchers = await this.userRoleRepo
      .createQueryBuilder('ur')
      .innerJoin('ur.role', 'role')
      .where('role.name LIKE :researcher', { researcher: '%researcher%' })
      .getCount();

    const totalInquirers = await this.userRoleRepo
      .createQueryBuilder('ur')
      .innerJoin('ur.role', 'role')
      .where('role.name LIKE :inquirer', { inquirer: '%inquirer%' })
      .getCount();

    const totalAuditors = await this.userRoleRepo
      .createQueryBuilder('ur')
      .innerJoin('ur.role', 'role')
      .where('role.name LIKE :auditor', { auditor: '%auditor%' })
      .getCount();

    const totalActionsSubmitted = await this.inquiryActionRepo.count({
      where: { status: InquiryActionStatus.SUBMITTED },
    });

    const totalActionsApproved = await this.inquiryActionRepo.count({
      where: { status: InquiryActionStatus.APPROVED },
    });

    const totalActionsRejected = await this.inquiryActionRepo.count({
      where: { status: InquiryActionStatus.REJECTED },
    });

    const approvalRate = totalActionsSubmitted > 0 ? (totalActionsApproved / totalActionsSubmitted) * 100 : 0;

    return {
      totalUsers,
      totalResearchers,
      totalInquirers,
      totalAuditors,
      totalActionsSubmitted,
      totalActionsApproved,
      totalActionsRejected,
      approvalRate: Math.round(approvalRate * 100) / 100, // round to 2 decimals
    };
  }

  async createSubAdmin(dto: CreateSubAdminDto) {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepo.findOne({
      where: { name: 'sub_admin' },
    });

    if (!role) {
      throw new NotFoundException('Role sub_admin not found');
    }

    await this.userRoleRepo.save({
      userId: user.id,
      roleId: role.id,
    });

    return {
      userId: user.id,
      role: role.name,
      categories: dto.categoryIds,
    };
  }

  async getSystemLogs() {
    // Recent inquiry actions
    const recentActions = await this.inquiryActionRepo
      .createQueryBuilder('ia')
      .select(['ia.id', 'ia.status', 'ia.createdat', 'ia.performedbyuserid'])
      .orderBy('ia.createdat', 'DESC')
      .limit(10)
      .getMany();

    // Recent audits
    const recentAudits = await this.researchAuditRepo
      .createQueryBuilder('ra')
      .select(['ra.id', 'ra.decision', 'ra.createdAt', 'ra.auditorUserId'])
      .orderBy('ra.createdAt', 'DESC')
      .limit(10)
      .getMany();

    // Combine and sort by createdAt
    const logs = [
      ...recentActions.map(a => ({ type: 'action', ...a })),
      ...recentAudits.map(a => ({ type: 'audit', ...a })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);

    return logs;
  }

  async getCategories() {
    const categories = await this.categoryRepo.find({
      relations: ['config', 'subAdminCategories', 'subAdminCategories.user']
    });
    const result = await Promise.all(
      categories.map(async (cat) => {
        const totalActions = await this.inquiryActionRepo
          .createQueryBuilder('ia')
          .innerJoin('inquiry_tasks', 'it', 'ia.taskid = it.id')
          .where('it.categoryId = :catId', { catId: cat.id })
          .getCount();
        const approvedActions = await this.inquiryActionRepo
          .createQueryBuilder('ia')
          .innerJoin('inquiry_tasks', 'it', 'ia.taskid = it.id')
          .where('it.categoryId = :catId AND ia.status = :status', { catId: cat.id, status: InquiryActionStatus.APPROVED })
          .getCount();
        const rejectedActions = await this.inquiryActionRepo
          .createQueryBuilder('ia')
          .innerJoin('inquiry_tasks', 'it', 'ia.taskid = it.id')
          .where('it.categoryId = :catId AND ia.status = :status', { catId: cat.id, status: InquiryActionStatus.REJECTED })
          .getCount();

        // Calculate metrics
        const totalResearchers = await this.userRoleRepo
          .createQueryBuilder('ur')
          .innerJoin('ur.role', 'role')
          .innerJoin('category_sub_admins', 'sac', 'sac.user_id = ur.userId')
          .where('role.name LIKE :researcher AND sac.category_id = :catId', { researcher: '%researcher%', catId: cat.id })
          .getCount();

        const totalInquirers = await this.userRoleRepo
          .createQueryBuilder('ur')
          .innerJoin('ur.role', 'role')
          .innerJoin('category_sub_admins', 'sac', 'sac.user_id = ur.userId')
          .where('role.name LIKE :inquirer AND sac.category_id = :catId', { inquirer: '%inquirer%', catId: cat.id })
          .getCount();

        const totalAuditors = await this.userRoleRepo
          .createQueryBuilder('ur')
          .innerJoin('ur.role', 'role')
          .innerJoin('category_sub_admins', 'sac', 'sac.user_id = ur.userId')
          .where('role.name LIKE :auditor AND sac.category_id = :catId', { auditor: '%auditor%', catId: cat.id })
          .getCount();

        const approvalRate = totalActions > 0 ? (approvedActions / totalActions) * 100 : 0;

        return {
          id: cat.id,
          name: cat.name,
          isActive: cat.isActive,
          config: {
            cooldownRules: cat.config ? cat.config.cooldownRules : {
              cooldownDays: 30,
              dailyLimits: { researcher: 200, inquirer: 50, auditor: 300 },
            },
          },
          subAdminCategories: cat.subAdminCategories,
          metrics: {
            totalResearchers,
            totalInquirers,
            totalAuditors,
            approvalRate: Math.round(approvalRate * 100) / 100,
            totalApprovedActions: approvedActions,
          },
        };
      })
    );
    return result;
  }

  async getTopWorkers() {
    // For researchers: count completed research tasks
    const topResearchers = await this.researchTaskRepo
      .createQueryBuilder('rt')
      .select('rt.assignedToUserId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('rt.status = :status', { status: 'COMPLETED' })
      .groupBy('rt.assignedToUserId')
      .orderBy('count', 'DESC')
      .limit(3)
      .getRawMany();

    // For inquirers: count approved inquiry actions
    const topInquirers = await this.inquiryActionRepo
      .createQueryBuilder('ia')
      .select('ia.performedbyuserid', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('ia.status = :status', { status: InquiryActionStatus.APPROVED })
      .groupBy('ia.performedbyuserid')
      .orderBy('count', 'DESC')
      .limit(3)
      .getRawMany();

    // For auditors: count approved audits
    const topAuditors = await this.researchAuditRepo
      .createQueryBuilder('ra')
      .select('ra.auditorUserId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('ra.decision = :decision', { decision: 'APPROVED' })
      .groupBy('ra.auditorUserId')
      .orderBy('count', 'DESC')
      .limit(3)
      .getRawMany();

    return {
      researchers: topResearchers,
      inquirers: topInquirers,
      auditors: topAuditors,
    };
  }

  async getSubAdmins() {
    return this.userRoleRepo
      .createQueryBuilder('ur')
      .innerJoin('ur.user', 'user')
      .innerJoin('ur.role', 'role')
      .where('role.name = :role', { role: 'sub_admin' })
      .select([
        'user.id',
        'user.email',
        'user.name',
        'role.name',
      ])
      .getMany();
  }

  async getUsers(options: { page: number; limit: number; search: string; role: string; status: string }) {
    const { page, limit, search, role, status } = options;
    const skip = (page - 1) * limit;

    let query = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.roles', 'ur')
      .leftJoinAndSelect('ur.role', 'r');

    if (search) {
      query = query.where('u.name ILIKE :search OR u.email ILIKE :search OR u.id::text ILIKE :search', { search: `%${search}%` });
    }

    if (role) {
      query = query.andWhere('r.name = :role', { role });
    }

    if (status) {
      query = query.andWhere('u.status = :status', { status });
    }

    const [users, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roles?.[0]?.role?.name || 'No Role',
      status: user.status || 'active',
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
    }));

    return {
      users: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUsersStats() {
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { status: 'active' } });
    const suspendedUsers = await this.userRepo.count({ where: { status: 'suspended' } });
    const subAdmins = await this.userRoleRepo
      .createQueryBuilder('ur')
      .innerJoin('ur.role', 'role')
      .where('role.name = :role', { role: 'sub_admin' })
      .getCount();

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      subAdmins,
    };
  }

  async updateUserStatus(id: string, status: string) {
    await this.userRepo.update(id, { status: status as 'active' | 'suspended' });
    return { success: true };
  }

  async resetUserPassword(id: string, newPassword?: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error('User not found');

    if (newPassword) {
      user.password_hash = await bcrypt.hash(newPassword, 10);
      await this.userRepo.save(user);
      return { success: true, message: 'Password updated successfully' };
    } else {
      // TODO: Send email for password reset
      return { success: true, message: 'Password reset email sent' };
    }
  }

  async deleteUser(id: string) {
    await this.userRepo.delete(id);
    return { success: true };
  }

  async assignUserToCategories(dto: AssignUserToCategoriesDto) {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify all categories exist
    const categories = await this.categoryRepo.find({
      where: { id: In(dto.categoryIds) },
    });

    if (categories.length !== dto.categoryIds.length) {
      throw new NotFoundException('One or more categories not found');
    }

    // Remove existing assignments for this user
    await this.userCategoryRepo.delete({ userId: dto.userId });

    // Create new assignments
    const assignments = dto.categoryIds.map(categoryId => ({
      userId: dto.userId,
      categoryId,
    }));

    await this.userCategoryRepo.save(assignments);

    return {
      userId: user.id,
      categories: dto.categoryIds,
      message: 'User assigned to categories successfully',
    };
  }

  async removeUserFromCategory(dto: RemoveUserFromCategoryDto) {
    await this.userCategoryRepo.delete({
      userId: dto.userId,
      categoryId: dto.categoryId,
    });

    return {
      message: 'User removed from category successfully',
    };
  }

  async getUserCategories(userId: string) {
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      relations: ['category'],
    });

    return userCategories.map(uc => ({
      id: uc.category.id,
      name: uc.category.name,
      assignedAt: uc.createdAt,
    }));
  }
}