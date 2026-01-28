import { IsArray, IsString } from 'class-validator';

export class ProcessPaymentDto {
  @IsArray()
  @IsString({ each: true })
  paymentIds: string[];
}
