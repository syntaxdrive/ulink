import { IsString, IsOptional, IsArray, IsEnum, MaxLength } from 'class-validator';

/** Valid difficulty levels for a course */
export enum CourseLevel {
  ALL = 'All Levels',
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

/** Valid content types for a course */
export enum CourseContentType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  BOTH = 'both',
}

/**
 * DTO for creating a new course.
 */
export class CreateCourseDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  category!: string;

  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  /** YouTube video URL (e.g. https://youtube.com/watch?v=...) */
  @IsString()
  @IsOptional()
  youtubeUrl?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsEnum(CourseContentType)
  @IsOptional()
  contentType?: CourseContentType;
}
