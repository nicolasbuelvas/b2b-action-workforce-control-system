import { IsString } from 'class-validator';

export class SubmitInquiryDto {
  @IsString()
  inquiryTaskId: string;

  @IsString()
  actionType: string;
}
