import { IsString, IsNotEmpty, IsOptional, MaxLength, IsUrl } from 'class-validator';

/**
 * DTO for posting a job or internship listing.
 */
export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  company!: string;

  @IsString()
  @IsOptional()
  type?: string; // Internship, Full-time, Part-time, Remote

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  description?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  applicationLink?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  salaryRange?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
