import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';

import { InquiryAction } from './entities/inquiry-action.entity';
import { InquiryTask } from './entities/inquiry-task.entity';
import { OutreachRecord } from './entities/outreach-record.entity';

import { ScreenshotsModule } from '../screenshots/screenshots.module';
import { CooldownModule } from '../cooldown/cooldown.module';
import { ResearchTask } from '../research/entities/research-task.entity';
import { ResearchSubmission } from '../research/entities/research-submission.entity';
import { Company } from '../research/entities/company.entity';
import { Category } from '../categories/entities/category.entity';
import { UserCategory } from '../categories/entities/user-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InquiryAction,
      InquiryTask,
      OutreachRecord,
      ResearchTask,
      ResearchSubmission,
      Company,
      Category,
      UserCategory,
    ]),
    ScreenshotsModule,
    CooldownModule,
  ],
  controllers: [InquiryController],
  providers: [InquiryService],
})
export class InquiryModule {}