import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { CooldownRecord } from './entities/cooldown-record.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class CooldownService {
  constructor(
    @InjectRepository(CooldownRecord)
    private readonly cooldownRepo: Repository<CooldownRecord>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async enforceCooldown(params: {
    userId: string;
    targetId: string;
    categoryId: string;
    actionType: string;
  }) {
    const { userId, targetId, categoryId } = params;

    const category = await this.categoriesService.getById(categoryId);

    const cooldownRules = category.config?.cooldownRules || {};
    const cooldownDays = Math.min(...Object.values(cooldownRules).filter(v => typeof v === 'number')) || 30;
    if (cooldownDays <= 0) return; // no cooldown

    const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;

    let record = await this.cooldownRepo.findOne({
      where: { userId, targetId, categoryId },
    });

    if (!record) return;

    if (!record.cooldownStartedAt) return;

    const elapsed = Date.now() - record.cooldownStartedAt.getTime();

    if (elapsed >= cooldownMs) {
      record.cooldownStartedAt = null;
      await this.cooldownRepo.save(record);
      return;
    }

    const remainingMinutes = Math.ceil((cooldownMs - elapsed) / 1000 / 60);

    throw new ForbiddenException({
      code: 'COOLDOWN_ACTIVE',
      remainingMinutes,
    });
  }

  async recordAction(params: {
    userId: string;
    targetId: string;
    categoryId: string;
    actionType: string;
    manager?: EntityManager;
  }) {
    const { userId, targetId, categoryId, actionType, manager } = params;

    // Validate actionType is present
    if (!actionType) {
      console.error('[COOLDOWN] ERROR: actionType is required for cooldown record');
      throw new BadRequestException('actionType is required for cooldown record');
    }

    const category = await this.categoriesService.getById(categoryId);
    const cooldownRules = category.config?.cooldownRules || {};
    const cooldownDays = Math.min(...Object.values(cooldownRules).filter(v => typeof v === 'number')) || 30;

    if (cooldownDays <= 0) {
      console.log('[COOLDOWN] No cooldown configured, skipping');
      return;
    }

    // Use manager if provided (transaction context), otherwise use direct repo
    const repo = manager ? manager.getRepository(CooldownRecord) : this.cooldownRepo;

    let record = await repo.findOne({
      where: { userId, targetId, categoryId },
    });

    if (!record) {
      record = repo.create({
        userId,
        targetId,
        categoryId,
        actionType, // Ensure actionType is saved
        cooldownStartedAt: new Date(),
      });
      console.log('[COOLDOWN] Creating new cooldown record with actionType:', actionType);
    } else {
      record.actionType = actionType; // Update actionType if record exists
      record.cooldownStartedAt = new Date();
      console.log('[COOLDOWN] Updating cooldown record with actionType:', actionType);
    }

    await repo.save(record);
    console.log('[COOLDOWN] Cooldown record saved successfully');
  }
}