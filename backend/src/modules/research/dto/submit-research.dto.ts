import { IsString, IsNotEmpty, IsOptional, IsEmail, IsUrl } from 'class-validator';

export class SubmitResearchDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsOptional()
  language?: string;

  // LinkedIn researcher fields (validated in service based on task type)
  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  contactLinkedinUrl?: string;

  @IsString()
  @IsOptional()
  country?: string;

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
