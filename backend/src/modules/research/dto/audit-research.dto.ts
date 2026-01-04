import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ResearchStatus } from '../entities/research-task.entity';

export class AuditResearchDto {
  @IsEnum(ResearchStatus)
  status: ResearchStatus;

  @IsOptional()
  @IsString()
  rejectionReasonId?: string;
}