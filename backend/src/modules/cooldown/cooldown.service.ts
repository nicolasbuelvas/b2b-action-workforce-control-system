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
    const { userId, targetId, categoryId, actionType } = params;

    const category = await this.categoriesService.getById(categoryId);

    const rule = category.cooldownRules?.[actionType];
    if (!rule) return; // acción sin cooldown

    const { actionsRequired, cooldownMs } = rule;

    let record = await this.cooldownRepo.findOne({
      where: { userId, targetId, categoryId, actionType },
    });

    if (!record) return;

    if (record.actionCount < actionsRequired) return;

    if (!record.cooldownStartedAt) return;

    const elapsed =
      Date.now() - record.cooldownStartedAt.getTime();

    if (elapsed >= cooldownMs) {
      record.actionCount = 0;
      record.cooldownStartedAt = null;
      await this.cooldownRepo.save(record);
      return;
    }

    const remainingMinutes = Math.ceil(
      (cooldownMs - elapsed) / 1000 / 60,
    );

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
    const { userId, targetId, categoryId, actionType } = params;

    const category = await this.categoriesService.getById(categoryId);
    const rule = category.cooldownRules?.[actionType];

    if (!rule) return;

    const { actionsRequired } = rule;

    let record = await this.cooldownRepo.findOne({
      where: { userId, targetId, categoryId, actionType },
    });

    if (!record) {
      record = this.cooldownRepo.create({
        userId,
        targetId,
        categoryId,
        actionType,
        actionCount: 1,
      });
    } else {
      record.actionCount += 1;
    }

    if (
      record.actionCount >= actionsRequired &&
      !record.cooldownStartedAt
    ) {
      record.cooldownStartedAt = new Date();
    }

    await this.cooldownRepo.save(record);
  }
}