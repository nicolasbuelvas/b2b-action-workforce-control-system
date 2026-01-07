import { IsUUID } from 'class-validator';

export class ResubmitInquiryDto {
  @IsUUID()
  previousActionId: string;
}