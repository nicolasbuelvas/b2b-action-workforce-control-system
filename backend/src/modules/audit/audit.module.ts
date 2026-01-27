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
import { InquirySubmissionSnapshot } from '../inquiry/entities/inquiry-submission-snapshot.entity';
import { ScreenshotsModule } from '../screenshots/screenshots.module';
import { LinkedInProfile } from '../research/entities/linkedin-profile.entity';
import { DisapprovalReason } from '../subadmin/entities/disapproval-reason.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';

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
      InquirySubmissionSnapshot,
      LinkedInProfile,
      DisapprovalReason,
      UserRole,
      Role,
    ]),
    ScreenshotsModule,
  ],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}