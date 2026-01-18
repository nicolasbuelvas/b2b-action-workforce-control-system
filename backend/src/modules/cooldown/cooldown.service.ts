import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
  }) {
    const { userId, targetId, categoryId } = params;

    const category = await this.categoriesService.getById(categoryId);
    const cooldownRules = category.config?.cooldownRules || {};
    const cooldownDays = Math.min(...Object.values(cooldownRules).filter(v => typeof v === 'number')) || 30;

    if (cooldownDays <= 0) return;

    let record = await this.cooldownRepo.findOne({
      where: { userId, targetId, categoryId },
    });

    if (!record) {
      record = this.cooldownRepo.create({
        userId,
        targetId,
        categoryId,
        cooldownStartedAt: new Date(),
      });
    } else {
      record.cooldownStartedAt = new Date();
    }

    await this.cooldownRepo.save(record);
  }
}