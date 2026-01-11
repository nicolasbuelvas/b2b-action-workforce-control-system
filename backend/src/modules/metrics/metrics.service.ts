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

  /**
   * (approved / rejected / flagged)
   */
  async recordAction(params: {
    userId: string;
    role: string;
    categoryId?: string;
    status: 'approved' | 'rejected' | 'flagged';
  }) {
    const date = this.today();

    let metrics = await this.metricsRepo.findOne({
      where: {
        userId: params.userId,
        role: params.role,
        categoryId: params.categoryId ?? null,
        date,
      },
    });

    if (!metrics) {
      metrics = this.metricsRepo.create({
        userId: params.userId,
        role: params.role,
        categoryId: params.categoryId ?? null,
        date,
      });
    }

    metrics.totalActions += 1;

    if (params.status === 'approved') metrics.approvedActions += 1;
    if (params.status === 'rejected') metrics.rejectedActions += 1;
    if (params.status === 'flagged') metrics.flaggedActions += 1;

    return this.metricsRepo.save(metrics);
  }

  async getUserMetrics(params: {
    userId: string;
    role: string;
    categoryId?: string;
  }) {
    return this.metricsRepo.find({
      where: {
        userId: params.userId,
        role: params.role,
        categoryId: params.categoryId ?? null,
      },
      order: { date: 'DESC' },
    });
  }

  /**
   * TOP 3 WORKERS
   */
  async getTopWorkers(params: {
    role: string;
    categoryId?: string;
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
    limit?: number;
  }) {
    const qb = this.metricsRepo
      .createQueryBuilder('m')
      .select('m.userId', 'userId')
      .addSelect('SUM(m.approvedActions)', 'approvedActions')
      .where('m.role = :role', { role: params.role })
      .andWhere('m.date BETWEEN :from AND :to', {
        from: params.from,
        to: params.to,
      });

    if (params.categoryId) {
      qb.andWhere('m.categoryId = :categoryId', {
        categoryId: params.categoryId,
      });
    }

    return qb
      .groupBy('m.userId')
      .orderBy('approvedActions', 'DESC')
      .limit(params.limit ?? 3)
      .getRawMany();
  }
}