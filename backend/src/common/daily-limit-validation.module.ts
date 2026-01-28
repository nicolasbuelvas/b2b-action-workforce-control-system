import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyLimitValidationService } from './services/daily-limit-validation.service';
import { CategoryRule } from '../modules/category-rules/entities/category-rule.entity';
import { LastContact } from '../entities/last-contact.entity';
import { ResearchTask } from '../modules/research/entities/research-task.entity';
import { ResearchSubmission } from '../modules/research/entities/research-submission.entity';
import { InquiryTask } from '../modules/inquiry/entities/inquiry-task.entity';
import { InquiryAction } from '../modules/inquiry/entities/inquiry-action.entity';
import { LinkedInResearchTask } from '../modules/linkedin/entities/linkedin-research-task.entity';
import { LinkedInResearchSubmission } from '../modules/linkedin/entities/linkedin-research-submission.entity';
import { LinkedInInquiryTask } from '../modules/linkedin/entities/linkedin-inquiry-task.entity';
import { LinkedInAction } from '../modules/linkedin/entities/linkedin-action.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryRule,
      LastContact,
      ResearchTask,
      ResearchSubmission,
      InquiryTask,
      InquiryAction,
      LinkedInResearchTask,
      LinkedInResearchSubmission,
      LinkedInInquiryTask,
      LinkedInAction,
    ]),
  ],
  providers: [DailyLimitValidationService],
  exports: [DailyLimitValidationService],
})
export class DailyLimitValidationModule {}
