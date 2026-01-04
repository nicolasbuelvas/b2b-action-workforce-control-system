import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CooldownRecord } from './entities/cooldown-record.entity';
import { COOLDOWN_RULES } from '../../config/cooldown.config';

@Injectable()
export class CooldownService {
  constructor(
    @InjectRepository(CooldownRecord)
    private readonly cooldownRepo: Repository<CooldownRecord>,
  ) {}

  async enforceCooldown(params: {
    userId: string;
    targetId: string;
    actionType: string;
  }) {
    const { userId, targetId, actionType } = params;

    const cooldownMs = COOLDOWN_RULES[actionType];
    if (!cooldownMs) return;

    const record = await this.cooldownRepo.findOne({
      where: { userId, targetId, actionType },
    });

    if (!record) return;

    const elapsed =
      Date.now() - record.lastPerformedAt.getTime();

    if (elapsed < cooldownMs) {
      const remainingMinutes = Math.ceil(
        (cooldownMs - elapsed) / 1000 / 60,
      );

      throw new ForbiddenException({
        code: 'COOLDOWN_ACTIVE',
        remainingMinutes,
      });
    }
  }

  async recordAction(params: {
    userId: string;
    targetId: string;
    actionType: string;
  }) {
    const { userId, targetId, actionType } = params;

    const existing = await this.cooldownRepo.findOne({
      where: { userId, targetId, actionType },
    });

    if (existing) {
      existing.lastPerformedAt = new Date();
      await this.cooldownRepo.save(existing);
      return;
    }

    await this.cooldownRepo.save({
      userId,
      targetId,
      actionType,
      lastPerformedAt: new Date(),
    });
  }
}