import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString() @IsOptional() @MaxLength(100) name?: string;
  @IsString() @IsOptional() @MaxLength(50) username?: string;
  @IsString() @IsOptional() @MaxLength(150) headline?: string;
  @IsString() @IsOptional() @MaxLength(2000) about?: string;
  @IsString() @IsOptional() university?: string;
  @IsString() @IsOptional() avatarUrl?: string;
  @IsString() @IsOptional() backgroundImageUrl?: string;
}
