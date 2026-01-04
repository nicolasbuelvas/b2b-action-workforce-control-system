import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { InquiryAction } from './entities/inquiry-action.entity';
import { ScreenshotsModule } from '../screenshots/screenshots.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InquiryAction]),
    ScreenshotsModule,
  ],
  controllers: [InquiryController],
  providers: [InquiryService],
})
export class InquiryModule {}
