import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InquiryAction } from './entities/inquiry-action.entity';
import { ScreenshotsService } from '../screenshots/screenshots.service';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(InquiryAction)
    private readonly actionRepo: Repository<InquiryAction>,
    private readonly screenshotsService: ScreenshotsService,
  ) {}

  async submitInquiry(
    dto: SubmitInquiryDto,
    screenshotBuffer: Buffer,
    userId: string,
  ) {
    const screenshotHash =
      await this.screenshotsService.processScreenshot(
        screenshotBuffer,
        userId,
      );

    return this.actionRepo.save({
      inquiryTaskId: dto.inquiryTaskId,
      performedByUserId: userId,
      actionType: dto.actionType,
      screenshotHash,
    });
  }
}
