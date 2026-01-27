import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AuditResearchDto {
  @IsEnum(['APPROVED', 'REJECTED', 'FLAGGED'])
  decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';

  @IsOptional()
  @IsString()
  reasonId?: string;
}