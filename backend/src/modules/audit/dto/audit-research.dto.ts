import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AuditResearchDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  rejectionReasonId?: string;
}