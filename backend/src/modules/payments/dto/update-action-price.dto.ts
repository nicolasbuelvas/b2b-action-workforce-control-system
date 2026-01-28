import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateActionPriceDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  bonusMultiplier?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
