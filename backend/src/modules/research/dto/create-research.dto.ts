import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateResearchDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsIn(['COMPANY', 'LINKEDIN'])
  targetType: 'COMPANY' | 'LINKEDIN';

  @IsString()
  @IsNotEmpty()
  nameOrUrl: string;

  @IsString()
  @IsNotEmpty()
  domainOrProfile: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
