import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InquiryAction } from './entities/inquiry-action.entity';
import { InquiryTask, InquiryStatus } from './entities/inquiry-task.entity';
import { OutreachRecord } from './entities/outreach-record.entity';

import { ScreenshotsService } from '../screenshots/screenshots.service';
import { CooldownService } from '../cooldown/cooldown.service';

import { SubmitInquiryDto } from './dto/submit-inquiry.dto';

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(InquiryAction)
    private readonly actionRepo: Repository<InquiryAction>,

    @InjectRepository(InquiryTask)
    private readonly taskRepo: Repository<InquiryTask>,

    @InjectRepository(OutreachRecord)
    private readonly outreachRepo: Repository<OutreachRecord>,

    private readonly screenshotsService: ScreenshotsService,
    private readonly cooldownService: CooldownService,
  ) {}

  async submitInquiry(
    dto: SubmitInquiryDto,
    screenshotBuffer: Buffer,
    userId: string,
  ) {
    const task = await this.taskRepo.findOne({
      where: { id: dto.inquiryTaskId },
    });

    if (!task) {
      throw new BadRequestException('Inquiry task not found');
    }

    await this.cooldownService.enforceCooldown({
      userId,
      targetId: task.targetId,
      categoryId: task.categoryId,
      actionType: dto.actionType,
    });


    const screenshotHash =
      await this.screenshotsService.processScreenshot(
        screenshotBuffer,
        userId,
      );

    const action = await this.actionRepo.save({
      inquiryTaskId: task.id,
      performedByUserId: userId,
      actionType: dto.actionType,
      screenshotHash,
    });

    await this.outreachRepo.save({
      inquiryTaskId: task.id,
      userId,
      actionType: dto.actionType,
      inquiryActionId: action.id,
    });

    await this.cooldownService.recordAction({
      userId,
      targetId: task.targetId,
      categoryId: task.categoryId,
      actionType: dto.actionType,
    });


    task.status = InquiryStatus.COMPLETED;
    await this.taskRepo.save(task);

    return action;
  }
}