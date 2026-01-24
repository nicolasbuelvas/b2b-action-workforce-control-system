import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchAudit } from './entities/research-audit.entity';
import { RejectionReason } from './entities/rejection-reason.entity';
import { FlaggedAction } from './entities/flagged-action.entity';
import { ResearchSubmission } from '../research/entities/research-submission.entity';
import { Category } from '../categories/entities/category.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { Company } from '../research/entities/company.entity';
import { User } from '../users/entities/user.entity';
import { InquiryTask } from '../inquiry/entities/inquiry-task.entity';
import { InquiryAction } from '../inquiry/entities/inquiry-action.entity';
import { OutreachRecord } from '../inquiry/entities/outreach-record.entity';
import { ScreenshotsModule } from '../screenshots/screenshots.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResearchTask,
      ResearchAudit,
      RejectionReason,
      FlaggedAction,
      ResearchSubmission,
      Category,
      UserCategory,
      Company,
      User,
      InquiryTask,
      InquiryAction,
      OutreachRecord,
    ]),
    ScreenshotsModule,
  ],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}