import { IsUUID } from 'class-validator';

export class RemoveUserFromCategoryDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  categoryId: string;
}
