import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(3000)
  content?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  imageUrls?: string[];

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  communityId?: string;

  @IsArray()
  @IsOptional()
  pollOptions?: string[];
}
