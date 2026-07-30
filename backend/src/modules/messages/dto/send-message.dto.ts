import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';

/**
 * DTO for sending a new direct message.
 * Validated automatically by NestJS's global ValidationPipe.
 */
export class SendMessageDto {
  /** The ID of the user receiving the message */
  @IsUUID()
  @IsNotEmpty()
  recipientId!: string;

  /** Text content of the message (optional if sending media) */
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  content?: string;

  /** URL of an attached image or file (uploaded to Cloudinary beforehand) */
  @IsString()
  @IsOptional()
  imageUrl?: string;

  /** URL of an attached audio clip (voice message) */
  @IsString()
  @IsOptional()
  audioUrl?: string;
}
