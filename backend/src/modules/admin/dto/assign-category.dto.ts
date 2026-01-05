import { IsString, IsArray } from 'class-validator';

export class AssignCategoryDto {
  @IsString()
  userId: string;

  @IsArray()
  categoryIds: string[];
}
