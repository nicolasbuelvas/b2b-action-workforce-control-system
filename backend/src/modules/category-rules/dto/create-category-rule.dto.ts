import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, Min } from 'class-validator';
import { RuleStatus } from '../entities/category-rule.entity';

export class CreateCategoryRuleDto {
  @IsString()
  categoryId: string;

  @IsString()
  actionType: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyLimitOverride?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cooldownDaysOverride?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  requiredActions?: number;

  @IsOptional()
  @IsBoolean()
  screenshotRequired?: boolean;

  @IsOptional()
  @IsEnum(RuleStatus)
  status?: RuleStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}