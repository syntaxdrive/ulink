import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, Min, Max, MaxLength } from 'class-validator';

/**
 * DTO for creating a new Study Room (Pomodoro / Focus Room).
 */
export class CreateStudyRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subject?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @Min(5)
  @Max(180)
  @IsOptional()
  timerMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  allowDrawing?: boolean;
}
