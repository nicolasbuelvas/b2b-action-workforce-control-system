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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
}
