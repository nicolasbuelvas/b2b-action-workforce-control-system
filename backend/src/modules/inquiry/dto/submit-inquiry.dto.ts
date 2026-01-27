import { IsEnum, IsUUID } from 'class-validator';

export enum InquiryActionType {
  EMAIL = 'EMAIL',
  LINKEDIN = 'LINKEDIN',
  CALL = 'CALL',
  LINKEDIN_OUTREACH = 'LINKEDIN_OUTREACH',
  LINKEDIN_EMAIL_REQUEST = 'LINKEDIN_EMAIL_REQUEST',
  LINKEDIN_CATALOGUE = 'LINKEDIN_CATALOGUE',
}

export class SubmitInquiryDto {
  @IsUUID()
  inquiryTaskId: string;

  @IsEnum(InquiryActionType)
  actionType: InquiryActionType;
}