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
    @Body() body: { inquiryTaskId: string },
    @CurrentUser('userId') userId: string,
  ) {
    return this.inquiryService.takeInquiry(
      body.inquiryTaskId,
      userId,
    );
  }

  @Post('submit')
  @UseInterceptors(FileInterceptor('screenshot'))
  submitInquiry(
    @Body() body: any,
    @UploadedFile() file: any,
    @CurrentUser('userId') userId: string,
  ) {
    console.log('[INQUIRY-SUBMIT] Body received:', body);
    console.log('[INQUIRY-SUBMIT] Body keys:', Object.keys(body));
    console.log('[INQUIRY-SUBMIT] File received:', file ? `${file.originalname} (${file.size} bytes)` : 'NO FILE');
    console.log('[INQUIRY-SUBMIT] UserId:', userId);
    
    // Manually construct the DTO from form fields
    const dto: SubmitInquiryDto = {
      inquiryTaskId: body.inquiryTaskId,
      actionType: body.actionType as any,
    };
    
    console.log('[INQUIRY-SUBMIT] Constructed DTO:', dto);
    
    return this.inquiryService.submitInquiry(
      dto,
      file?.buffer,
      userId,
    );
  }
}
