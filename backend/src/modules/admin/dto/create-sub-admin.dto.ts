import { IsString, IsArray } from 'class-validator';

export class CreateSubAdminDto {
  @IsString()
  userId: string;

  @IsArray()
  categoryIds: string[];
}
