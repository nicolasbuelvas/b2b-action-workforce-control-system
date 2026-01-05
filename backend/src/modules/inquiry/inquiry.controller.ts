import {
  Controller,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { InquiryService } from './inquiry.service';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('inquiry')
@UseGuards(JwtGuard)
export class InquiryController {
  constructor(
    private readonly inquiryService: InquiryService,
  ) {}

  @Post('submit')
  @UseInterceptors(FileInterceptor('screenshot'))
  submitInquiry(
    @Body() dto: SubmitInquiryDto,
    @UploadedFile() file: any,
    @CurrentUser('id') userId: string,
  ) {
    return this.inquiryService.submitInquiry(
      dto,
      file.buffer,
      userId,
    );
  }

}