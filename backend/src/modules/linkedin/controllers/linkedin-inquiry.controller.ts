import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LinkedInInquiryService } from '../services/linkedin-inquiry.service';
import { LinkedInActionType } from '../entities/linkedin-action.entity';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SubmitLinkedInActionDto } from '../dto/submit-linkedin-action.dto';

@Controller('linkedin/inquiry')
@UseGuards(JwtGuard, RolesGuard)
export class LinkedInInquiryController {
  constructor(private readonly linkedInInquiryService: LinkedInInquiryService) {}

  @Get('tasks')
  @Roles('linkedin_inquirer')
  async getTasks(@CurrentUser('userId') userId: string) {
    return this.linkedInInquiryService.getLinkedInTasks(userId);
  }

  @Post('tasks/:taskId/claim')
  @Roles('linkedin_inquirer')
  async claimTask(
    @Param('taskId') taskId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.linkedInInquiryService.claimTask(taskId, userId);
  }

  @Post('tasks/:taskId/actions/outreach')
  @Roles('linkedin_inquirer')
  @UseInterceptors(FileInterceptor('screenshot'))
  async submitOutreach(
    @Param('taskId') taskId: string,
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: any,
    @Body() dto: SubmitLinkedInActionDto,
  ) {
    const dtoWithFile = { ...dto, screenshotFile: file?.buffer };
    return this.linkedInInquiryService.submitAction(
      taskId,
      LinkedInActionType.OUTREACH,
      userId,
      dtoWithFile,
    );
  }

  @Post('tasks/:taskId/actions/ask-email')
  @Roles('linkedin_inquirer')
  @UseInterceptors(FileInterceptor('screenshot'))
  async submitAskForEmail(
    @Param('taskId') taskId: string,
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: any,
    @Body() dto: SubmitLinkedInActionDto,
  ) {
    const dtoWithFile = { ...dto, screenshotFile: file?.buffer };
    return this.linkedInInquiryService.submitAction(
      taskId,
      LinkedInActionType.ASK_FOR_EMAIL,
      userId,
      dtoWithFile,
    );
  }

  @Post('tasks/:taskId/actions/send-catalogue')
  @Roles('linkedin_inquirer')
  @UseInterceptors(FileInterceptor('screenshot'))
  async submitSendCatalogue(
    @Param('taskId') taskId: string,
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: any,
    @Body() dto: SubmitLinkedInActionDto,
  ) {
    const dtoWithFile = { ...dto, screenshotFile: file?.buffer };
    return this.linkedInInquiryService.submitAction(
      taskId,
      LinkedInActionType.SEND_CATALOGUE,
      userId,
      dtoWithFile,
    );
  }
}
