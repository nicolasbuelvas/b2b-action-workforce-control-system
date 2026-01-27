import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
  BadRequestException,
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
    @Body() body: { inquiryTaskId?: string; researchTaskId?: string },
    @CurrentUser('userId') userId: string,
  ) {
    // Backward compatible: accept either researchTaskId or inquiryTaskId (was misnamed)
    const researchTaskId = body.researchTaskId || body.inquiryTaskId;
    if (!researchTaskId) {
      throw new BadRequestException('researchTaskId is required');
    }

    return this.inquiryService.takeInquiry(
      researchTaskId,
      userId,
    );
  }

  @Post('submit')
  @UseInterceptors(FileInterceptor('screenshot'))
  async submitInquiry(
    @Body() body: any,
    @UploadedFile() file: any,
    @CurrentUser('userId') userId: string,
  ) {
    try {
      console.log('[INQUIRY-SUBMIT] ========== REQUEST START =========');
      console.log('[INQUIRY-SUBMIT] UserId:', userId);
      console.log('[INQUIRY-SUBMIT] Body:', body);
      console.log('[INQUIRY-SUBMIT] Body keys:', body ? Object.keys(body) : 'NO BODY');
      console.log('[INQUIRY-SUBMIT] File:', file ? `${file.originalname} (${file.size} bytes)` : 'NO FILE');

      // Validate file exists
      if (!file) {
        console.error('[INQUIRY-SUBMIT] ERROR: No file uploaded');
        throw new BadRequestException('Screenshot file is required');
      }

      if (!file.buffer) {
        console.error('[INQUIRY-SUBMIT] ERROR: File buffer missing');
        throw new BadRequestException('Invalid file - buffer missing');
      }

      if (file.size === 0) {
        console.error('[INQUIRY-SUBMIT] ERROR: File empty');
        throw new BadRequestException('File cannot be empty');
      }

      // Validate body fields
      if (!body || !body.inquiryTaskId) {
        console.error('[INQUIRY-SUBMIT] ERROR: Missing inquiryTaskId');
        throw new BadRequestException('inquiryTaskId is required');
      }

      if (!body.actionType) {
        console.error('[INQUIRY-SUBMIT] ERROR: Missing actionType');
        throw new BadRequestException('actionType is required');
      }

      // Validate UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(body.inquiryTaskId)) {
        console.error('[INQUIRY-SUBMIT] ERROR: Invalid UUID:', body.inquiryTaskId);
        throw new BadRequestException('inquiryTaskId must be a valid UUID');
      }

      // Validate actionType
      const validTypes = ['EMAIL', 'LINKEDIN', 'CALL', 'LINKEDIN_OUTREACH', 'LINKEDIN_EMAIL_REQUEST', 'LINKEDIN_CATALOGUE'];
      if (!validTypes.includes(body.actionType)) {
        console.error('[INQUIRY-SUBMIT] ERROR: Invalid actionType:', body.actionType);
        throw new BadRequestException(`actionType must be one of: ${validTypes.join(', ')}`);
      }

      const dto: SubmitInquiryDto = {
        inquiryTaskId: body.inquiryTaskId,
        actionType: body.actionType,
      };
      console.log('[INQUIRY-SUBMIT] DTO constructed:', dto);

      const result = await this.inquiryService.submitInquiry(
        dto,
        file.buffer,
        userId,
      );

      console.log('[INQUIRY-SUBMIT] ========== REQUEST SUCCESS =========');
      return result;
    } catch (error: any) {
      console.error('[INQUIRY-SUBMIT] ========== REQUEST FAILED =========');
      console.error('[INQUIRY-SUBMIT] Error:', error.message);
      console.error('[INQUIRY-SUBMIT] Stack:', error.stack);
      throw error;
    }
  }
}
