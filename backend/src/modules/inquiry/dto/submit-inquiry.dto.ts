import { IsEnum, IsUUID } from 'class-validator';

export enum InquiryActionType {
  EMAIL = 'EMAIL',
  LINKEDIN = 'LINKEDIN',
  CALL = 'CALL',
}

export class SubmitInquiryDto {
  @IsUUID()
  inquiryTaskId: string;

  @IsEnum(InquiryActionType)
  actionType: InquiryActionType;
}