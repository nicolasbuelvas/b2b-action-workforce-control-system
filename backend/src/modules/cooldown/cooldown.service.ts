import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CooldownRecord } from './entities/cooldown-record.entity';
import { COOLDOWN_RULES } from '../../common/config/cooldown.config';

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
    if (!cooldownMs) return; // acción sin cooldown

    const record = await this.cooldownRepo.findOne({
      where: { userId, targetId, actionType },
    });

    if (!record) return;

    const elapsed =
      Date.now() - record.lastPerformedAt.getTime();

    if (elapsed < cooldownMs) {
      const remaining = Math.ceil(
        (cooldownMs - elapsed) / 1000 / 60,
      );

      throw new ForbiddenException(
        `Cooldown active. Try again in ${remaining} minutes.`,
      );
    }
  }

  async recordAction(params: {
    userId: string;
    targetId: string;
    actionType: string;
  }) {
    const { userId, targetId, actionType } = params;

    await this.cooldownRepo.save({
      userId,
      targetId,
      actionType,
      lastPerformedAt: new Date(),
    });
  }
}
