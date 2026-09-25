import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

/**
 * DTO for creating a new Podcast Episode.
 */
export class CreateEpisodeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  description?: string;

  @IsString()
  @IsNotEmpty()
  audioUrl!: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  episodeNumber?: number;
}
