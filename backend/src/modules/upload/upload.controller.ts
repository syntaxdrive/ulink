import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UploadService } from './upload.service';

class PresignDto {
  folder!: string;
  ext!: string;
  mimeType?: string;
}

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: 'Get a presigned R2 upload URL' })
  @Post('presign')
  @HttpCode(HttpStatus.OK)
  presign(
    @Request() req: any,
    @Body() body: PresignDto,
  ) {
    return this.uploadService.presign(
      body.folder || 'posts',
      body.ext || 'jpg',
      body.mimeType,
    );
  }
}
