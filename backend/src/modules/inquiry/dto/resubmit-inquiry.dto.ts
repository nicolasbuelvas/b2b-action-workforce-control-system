import { IsString } from 'class-validator';

export class ResubmitInquiryDto {
  @IsString()
  inquiryTaskId: string;

  @IsString()
  actionType: string;

  @IsString()
  previousActionId: string;
}
