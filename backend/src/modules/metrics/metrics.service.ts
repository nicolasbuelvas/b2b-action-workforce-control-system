import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleMetrics } from './entities/role-metrics.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(RoleMetrics)
    private readonly metricsRepo: Repository<RoleMetrics>,
  ) {}

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  async recordAction(params: {
    userId: string;
    role: string;
    status: 'approved' | 'rejected' | 'flagged';
  }) {
    const date = this.today();

    let metrics = await this.metricsRepo.findOne({
      where: { userId: params.userId, role: params.role, date },
    });

    if (!metrics) {
      metrics = this.metricsRepo.create({
        userId: params.userId,
        role: params.role,
        date,
      });
    }

    metrics.totalActions += 1;

    if (params.status === 'approved') metrics.approvedActions += 1;
    if (params.status === 'rejected') metrics.rejectedActions += 1;
    if (params.status === 'flagged') metrics.flaggedActions += 1;

    return this.metricsRepo.save(metrics);
  }

  async getUserMetrics(userId: string, role: string) {
    return this.metricsRepo.find({
      where: { userId, role },
      order: { date: 'DESC' },
    });
  }
}
