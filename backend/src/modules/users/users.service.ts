import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service';
import { UserCategory } from '../categories/entities/user-category.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,
    private readonly rolesService: RolesService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password_hash,
      country: dto.country,
    });

    const savedUser = await this.userRepo.save(user);

    // Assign role
    if (dto.role) {
      await this.rolesService.assignRoleToUser(savedUser.id, dto.role);
    }

    // Assign categories for Sub-Admin role
    if (dto.role === 'sub_admin' && dto.categoryIds && dto.categoryIds.length > 0) {
      // This would need additional logic to assign categories to sub-admins
      // For now, we'll handle this in the admin service
    }

    return this.userRepo.findOne({
      where: { id: savedUser.id },
      relations: ['roles'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['roles'],
      order: { createdAt: 'DESC' },
    });
  }

  async suspendUser(userId: string) {
    const user = await this.findById(userId);
    user.status = 'suspended';
    return this.userRepo.save(user);
  }

  async getUserCategories(userId: string) {
    console.log('[getUserCategories] Fetching categories for userId:', userId);
    console.log('[getUserCategories] userId type:', typeof userId, 'value:', JSON.stringify(userId));
    
    // SECURITY: Reject if userId is missing/undefined
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('[getUserCategories] SECURITY VIOLATION: userId is invalid:', userId);
      throw new Error('Unauthorized: User ID is required to access categories');
    }
    
    const userCategories = await this.userCategoryRepo.find({
      where: { userId },
      relations: ['category'],
    });

    console.log('[getUserCategories] Found', userCategories.length, 'user_categories records');
    
    // Map and filter out any null/undefined categories
    const result = userCategories
      .filter(uc => {
        if (!uc.category) {
          console.warn('[getUserCategories] WARNING: user_category record has null category:', uc.id);
          return false;
        }
        return true;
      })
      .map(uc => ({
        id: uc.category.id,
        name: uc.category.name,
        assignedAt: uc.createdAt,
      }));
    
    console.log('[getUserCategories] Returning', result.length, 'categories:', result.map(c => c.name).join(', '));
    
    return result;
  }
}
