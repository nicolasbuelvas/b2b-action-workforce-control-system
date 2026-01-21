import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class SubmitResearchDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  techStack?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
