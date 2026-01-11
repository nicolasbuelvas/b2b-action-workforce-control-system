import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsService } from './metrics.service';
import { RoleMetrics } from './entities/role-metrics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleMetrics])],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}