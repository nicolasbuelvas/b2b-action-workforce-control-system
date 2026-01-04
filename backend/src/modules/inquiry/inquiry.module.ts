import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';

import { InquiryAction } from './entities/inquiry-action.entity';
import { InquiryTask } from './entities/inquiry-task.entity';
import { OutreachRecord } from './entities/outreach-record.entity';

import { ScreenshotsModule } from '../screenshots/screenshots.module';
import { CooldownModule } from '../cooldown/cooldown.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InquiryAction,
      InquiryTask,
      OutreachRecord,
    ]),
    ScreenshotsModule,
    CooldownModule,
  ],
  controllers: [InquiryController],
  providers: [InquiryService],
})
export class InquiryModule {}