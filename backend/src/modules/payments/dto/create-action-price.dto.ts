import { IsString, IsNumber, IsOptional, IsDecimal } from 'class-validator';

export class CreateActionPriceDto {
  @IsString()
  roleId: string;

  @IsString()
  actionType: string; // e.g., 'submit', 'approve', 'pay'

  @IsNumber()
  amount: number; // e.g., 10.50

  @IsNumber()
  @IsOptional()
  bonusMultiplier?: number; // e.g., 1.5 for top 3

  @IsString()
  @IsOptional()
  description?: string;
}
