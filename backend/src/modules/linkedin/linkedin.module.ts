import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkedInResearchTask } from './entities/linkedin-research-task.entity';
import { LinkedInResearchSubmission } from './entities/linkedin-research-submission.entity';
import { LinkedInInquiryTask } from './entities/linkedin-inquiry-task.entity';
import { LinkedInAction } from './entities/linkedin-action.entity';
import { LinkedInSubmissionSnapshot } from './entities/linkedin-submission-snapshot.entity';
import { LinkedInResearchService } from './services/linkedin-research.service';
import { LinkedInInquiryService } from './services/linkedin-inquiry.service';
import { LinkedInResearchController } from './controllers/linkedin-research.controller';
import { LinkedInInquiryController } from './controllers/linkedin-inquiry.controller';
import { ScreenshotsModule } from '../screenshots/screenshots.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LinkedInResearchTask,
      LinkedInResearchSubmission,
      LinkedInInquiryTask,
      LinkedInAction,
      LinkedInSubmissionSnapshot,
    ]),
    ScreenshotsModule,
  ],
  providers: [LinkedInResearchService, LinkedInInquiryService],
  controllers: [LinkedInResearchController, LinkedInInquiryController],
  exports: [LinkedInResearchService, LinkedInInquiryService],
})
export class LinkedInModule {}
