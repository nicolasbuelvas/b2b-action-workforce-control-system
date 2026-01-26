import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminService } from './subadmin.service';
import { SubAdminController } from './subadmin.controller';
import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchSubmission } from '../research/entities/research-submission.entity';
import { InquiryTask } from '../inquiry/entities/inquiry-task.entity';
import { InquiryAction } from '../inquiry/entities/inquiry-action.entity';
import { InquirySubmissionSnapshot } from '../inquiry/entities/inquiry-submission-snapshot.entity';
import { UserCategory } from '../categories/entities/user-category.entity';
import { Category } from '../categories/entities/category.entity';
import { Company } from '../research/entities/company.entity';
import { LinkedInProfile } from '../research/entities/linkedin-profile.entity';
import { User } from '../users/entities/user.entity';
import { CompanyType } from './entities/company-type.entity';
import { JobType } from './entities/job-type.entity';
import { DisapprovalReason } from './entities/disapproval-reason.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResearchTask,
      ResearchSubmission,
      InquiryTask,
      InquiryAction,
      InquirySubmissionSnapshot,
      UserCategory,
      Category,
      Company,
      LinkedInProfile,
      User,
      CompanyType,
      JobType,
      DisapprovalReason,
    ]),
  ],
  providers: [SubAdminService],
  controllers: [SubAdminController],
  exports: [SubAdminService],
})
export class SubAdminModule {}
