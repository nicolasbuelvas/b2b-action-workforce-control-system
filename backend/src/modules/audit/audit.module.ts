import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchAudit } from './entities/research-audit.entity';
import { RejectionReason } from './entities/rejection-reason.entity';
import { FlaggedAction } from './entities/flagged-action.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResearchTask,
      ResearchAudit,
      RejectionReason,
      FlaggedAction,
    ]),
  ],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}