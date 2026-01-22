import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { InquiryService } from './inquiry.service';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('inquiry')
@UseGuards(JwtGuard, RolesGuard)
export class InquiryController {
  constructor(
    private readonly inquiryService: InquiryService,
  ) {}

  @Get('tasks/website')
  @Roles('website_inquirer')
  getWebsiteTasks(@CurrentUser('userId') userId: string) {
    return this.inquiryService.getAvailableTasks(userId, 'website');
  }

  @Get('tasks/linkedin')
  @Roles('linkedin_inquirer')
  getLinkedInTasks(@CurrentUser('userId') userId: string) {
    return this.inquiryService.getAvailableTasks(userId, 'linkedin');
  }

  @Post('take')
  takeInquiry(
    @Body() body: { targetId: string; categoryId: string },
    @CurrentUser('userId') userId: string,
  ) {
    return this.inquiryService.takeInquiry(
      body.targetId,
      body.categoryId,
      userId,
    );
  }

  @Post('submit')
  @UseInterceptors(FileInterceptor('screenshot'))
  submitInquiry(
    @Body() dto: SubmitInquiryDto,
    @UploadedFile() file: any,
    @CurrentUser('userId') userId: string,
  ) {
    return this.inquiryService.submitInquiry(
      dto,
      file.buffer,
      userId,
    );
  }
}
