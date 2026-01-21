import { IsUUID, IsArray, ArrayNotEmpty } from 'class-validator';

export class AssignUserToCategoriesDto {
  @IsUUID()
  userId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
